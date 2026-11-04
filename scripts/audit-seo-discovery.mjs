import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { finderLocations, getFinderSymptomOptions, rankFinderArticles, searchArticles } from "../lib/discovery.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDir = path.join(repoRoot, "dist", "client");
const registry = JSON.parse(await readFile(path.join(repoRoot, "content", "articles.json"), "utf8"));
const siteConfig = JSON.parse(await readFile(path.join(repoRoot, "site.config.json"), "utf8"));
const siteOrigin = siteConfig.siteOrigin.replace(/\/+$/, "");
const outputArgument = process.argv.find((argument) => argument.startsWith("--output="));
const requestedOutput = outputArgument?.slice("--output=".length) ?? (process.argv.includes("--output") ? process.argv[process.argv.indexOf("--output") + 1] : null);
const checkProduction = process.argv.includes("--production");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function routeForArticle(article) {
  return `/${article.primary_category}/${article.slug}/`;
}

function routeForHtml(file) {
  const relative = path.relative(outputDir, file).replaceAll("\\", "/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404/";
  return `/${relative.replace(/index\.html$/, "")}`;
}

function canonicalFromHtml(html) {
  return html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null;
}

function isIndexableHtml(html) {
  return Boolean(canonicalFromHtml(html)) && !/<meta name="robots" content="[^"]*noindex/i.test(html);
}

function internalHrefs(html) {
  return [...html.matchAll(/\bhref=["'](\/[^"'#?]*(?:\?[^"'#]*)?)/g)].map((match) => {
    const url = new URL(match[1], "https://audit.invalid");
    return url.pathname.endsWith("/") || path.extname(url.pathname) ? url.pathname : `${url.pathname}/`;
  });
}

function articleLinks(article) {
  const links = [];
  if (article.contextual_link) links.push(article.contextual_link);
  if (article.contextual_links) links.push(...article.contextual_links);
  for (const section of article.body_sections ?? []) {
    if (section.link) links.push(section.link);
    if (section.links) links.push(...section.links);
  }
  return links.filter((link) => link.href?.startsWith("/"));
}

function parseSitemap(xml) {
  const entries = [];
  for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = match[1];
    entries.push({
      url: block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? null,
      lastmod: block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
    });
  }
  return entries;
}

async function fetchText(url) {
  try {
    const response = await fetch(url, { headers: { "user-agent": "My House Is Doing What audit/1.0" } });
    return { status: response.status, text: await response.text(), error: null };
  } catch (error) {
    return { status: null, text: "", error: error instanceof Error ? error.message : String(error) };
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const htmlFiles = (await walk(outputDir)).filter((file) => file.endsWith(".html"));
const htmlByRoute = new Map();
for (const file of htmlFiles) htmlByRoute.set(routeForHtml(file), await readFile(file, "utf8"));

const articleByRoute = new Map(registry.map((article) => [routeForArticle(article), article]));
const articleBySlug = new Map(registry.map((article) => [article.slug, article]));
const renderedGraph = new Map();
const renderedInbound = new Map();
for (const [source, html] of htmlByRoute) {
  const targets = new Set(internalHrefs(html));
  renderedGraph.set(source, targets);
  for (const target of targets) {
    if (!renderedInbound.has(target)) renderedInbound.set(target, new Set());
    renderedInbound.get(target).add(source);
  }
}

const crawlDepth = new Map([["/", 0]]);
const queue = ["/"];
while (queue.length) {
  const source = queue.shift();
  for (const target of renderedGraph.get(source) ?? []) {
    if (!htmlByRoute.has(target) || crawlDepth.has(target) || target === "/404/") continue;
    crawlDepth.set(target, crawlDepth.get(source) + 1);
    queue.push(target);
  }
}

const contextualOutbound = new Map();
const relatedOutbound = new Map();
const contextualInbound = new Map(registry.map((article) => [article.slug, new Set()]));
const relatedInbound = new Map(registry.map((article) => [article.slug, new Set()]));
const anchorTextByTarget = new Map(registry.map((article) => [article.slug, []]));
for (const article of registry) {
  const contextual = articleLinks(article)
    .map((link) => ({ ...link, target: articleByRoute.get(new URL(link.href, "https://audit.invalid").pathname)?.slug }))
    .filter((link) => link.target);
  contextualOutbound.set(article.slug, contextual);
  for (const link of contextual) {
    contextualInbound.get(link.target).add(article.slug);
    anchorTextByTarget.get(link.target).push({ source: article.slug, label: link.label });
  }
  const related = article.related_articles.filter((slug) => articleBySlug.has(slug));
  relatedOutbound.set(article.slug, related);
  for (const slug of related) relatedInbound.get(slug).add(article.slug);
}

const finderPathsBySlug = new Map(registry.map((article) => [article.slug, []]));
for (const location of finderLocations) {
  for (const symptom of getFinderSymptomOptions(location.value)) {
    for (const [index, result] of rankFinderArticles(registry, location.value, symptom.value).entries()) {
      finderPathsBySlug.get(result.article.slug)?.push({ location: location.value, symptom: symptom.value, rank: index + 1 });
    }
  }
}

const localSitemapXml = await readFile(path.join(outputDir, "sitemap.xml"), "utf8");
const localSitemap = parseSitemap(localSitemapXml);
const localSitemapByUrl = new Map(localSitemap.map((entry) => [entry.url, entry]));
const pinterestIndex = await readFile(path.join(repoRoot, "content-deployment", "pinterest-blog-content", "index.csv"), "utf8");

let production = { checked: false, sitemap_status: null, robots_status: null, errors: [] };
let productionSitemapByUrl = new Map();
let productionHubHtml = new Map();
let productionArticleResponses = new Map();
if (checkProduction) {
  const [sitemapResponse, robotsResponse] = await Promise.all([
    fetchText(`${siteOrigin}/sitemap.xml`),
    fetchText(`${siteOrigin}/robots.txt`),
  ]);
  production = {
    checked: true,
    sitemap_status: sitemapResponse.status,
    robots_status: robotsResponse.status,
    errors: [sitemapResponse.error, robotsResponse.error].filter(Boolean),
  };
  productionSitemapByUrl = new Map(parseSitemap(sitemapResponse.text).map((entry) => [entry.url, entry]));
  const categories = [...new Set(registry.map((article) => article.primary_category))];
  const hubResponses = await mapLimit(categories, 6, async (category) => [category, await fetchText(`${siteOrigin}/${category}/`)]);
  productionHubHtml = new Map(hubResponses);
  const articleResponses = await mapLimit(registry, 6, async (article) => [article.slug, await fetchText(`${siteOrigin}${routeForArticle(article)}`)]);
  productionArticleResponses = new Map(articleResponses);
  production.errors.push(...[...productionHubHtml.values(), ...productionArticleResponses.values()].map((item) => item.error).filter(Boolean));
}

const inventory = registry.map((article) => {
  const route = routeForArticle(article);
  const canonical = `${siteOrigin}${route}`;
  const localHtml = htmlByRoute.get(route) ?? "";
  const primaryHubHtml = htmlByRoute.get(`/${article.primary_category}/`) ?? "";
  const contextualSources = [...contextualInbound.get(article.slug)].sort();
  const relatedSources = [...relatedInbound.get(article.slug)].sort();
  const articleSources = [...new Set([...contextualSources, ...relatedSources])].sort();
  const finderPaths = finderPathsBySlug.get(article.slug);
  const titleResults = searchArticles(registry, article.title);
  const keywordTopMatches = article.search_keywords.filter((query) => searchArticles(registry, query)[0]?.slug === article.slug);
  const packagePath = path.join(repoRoot, "content-deployment", "pinterest-blog-content", article.primary_category, article.slug);
  const packageRelative = path.relative(repoRoot, packagePath).replaceAll("\\", "/");
  const productionResponse = productionArticleResponses.get(article.slug);
  const productionHtml = productionResponse?.text ?? "";
  const productionHub = productionHubHtml.get(article.primary_category);
  return {
    title: article.title,
    slug: article.slug,
    route,
    canonical,
    content_type: article.content_type,
    primary_category: article.primary_category,
    secondary_categories: article.secondary_categories,
    local_export: {
      route_present: Boolean(localHtml),
      indexable: isIndexableHtml(localHtml),
      canonical: canonicalFromHtml(localHtml),
      canonical_matches: canonicalFromHtml(localHtml) === canonical,
      article_schema: localHtml.includes('"@type":"Article"'),
      breadcrumb_schema: localHtml.includes('"@type":"BreadcrumbList"'),
    },
    sitemap: {
      included: localSitemapByUrl.has(canonical),
      lastmod: localSitemapByUrl.get(canonical)?.lastmod ?? null,
      lastmod_matches_updated_date: localSitemapByUrl.get(canonical)?.lastmod === article.updated_date,
    },
    primary_hub: {
      route: `/${article.primary_category}/`,
      includes_article: primaryHubHtml.includes(`href="${route}"`),
    },
    problem_finder: {
      status: finderPaths.length ? "included" : "search-only",
      path_count: finderPaths.length,
      paths: finderPaths,
    },
    site_search: {
      included: true,
      title_query_rank: titleResults.findIndex((result) => result.slug === article.slug) + 1 || null,
      keyword_count: article.search_keywords.length,
      keyword_top_match_count: keywordTopMatches.length,
      keyword_top_matches: keywordTopMatches,
    },
    internal_links: {
      rendered_unique_inbound_sources: [...(renderedInbound.get(route) ?? [])].sort(),
      rendered_unique_inbound_source_count: renderedInbound.get(route)?.size ?? 0,
      rendered_unique_outbound_targets: [...(renderedGraph.get(route) ?? [])].filter((target) => articleByRoute.has(target)).sort(),
      contextual_inbound_sources: contextualSources,
      contextual_inbound_count: contextualSources.length,
      related_card_inbound_sources: relatedSources,
      related_card_inbound_count: relatedSources.length,
      article_inbound_sources: articleSources,
      article_inbound_count: articleSources.length,
      contextual_outbound_targets: contextualOutbound.get(article.slug).map((link) => link.target),
      related_card_outbound_targets: relatedOutbound.get(article.slug),
      anchor_texts: anchorTextByTarget.get(article.slug),
      crawl_depth_from_home: crawlDepth.get(route) ?? null,
    },
    pinterest: {
      package_path: packageRelative,
      package_present: awaitableStat(packagePath),
      index_row_present: new RegExp(`(?:^|,)${article.slug}(?:,|$)`, "m").test(pinterestIndex),
    },
    updated_date: article.updated_date,
    production: checkProduction ? {
      http_status: productionResponse?.status ?? null,
      indexable: isIndexableHtml(productionHtml),
      canonical: canonicalFromHtml(productionHtml),
      canonical_matches: canonicalFromHtml(productionHtml) === canonical,
      sitemap_included: productionSitemapByUrl.has(canonical),
      sitemap_lastmod: productionSitemapByUrl.get(canonical)?.lastmod ?? null,
      primary_hub_includes_article: productionHub?.text.includes(`href="${route}"`) ?? false,
      article_schema: productionHtml.includes('"@type":"Article"'),
      breadcrumb_schema: productionHtml.includes('"@type":"BreadcrumbList"'),
    } : null,
  };
});

async function awaitableStat(target) {
  try {
    return (await stat(target)).isDirectory();
  } catch {
    return false;
  }
}

for (const item of inventory) item.pinterest.package_present = await item.pinterest.package_present;

const validRoutes = new Set(htmlByRoute.keys());
const brokenInternalLinks = [];
for (const [source, targets] of renderedGraph) {
  for (const target of targets) {
    if (target.startsWith("/_next/") || path.extname(target)) continue;
    if (!validRoutes.has(target)) brokenInternalLinks.push({ source, target });
  }
}

const findings = {
  broken_internal_links: brokenInternalLinks,
  zero_contextual_article_inbound: inventory.filter((item) => item.internal_links.contextual_inbound_count === 0).map((item) => item.slug),
  hub_only_article_inbound: inventory.filter((item) => item.internal_links.article_inbound_count === 0).map((item) => item.slug),
  missing_primary_hub: inventory.filter((item) => !item.primary_hub.includes_article).map((item) => item.slug),
  missing_finder_path: inventory.filter((item) => item.problem_finder.status === "search-only").map((item) => item.slug),
  title_search_not_first: inventory.filter((item) => item.site_search.title_query_rank !== 1).map((item) => item.slug),
  missing_sitemap: inventory.filter((item) => !item.sitemap.included).map((item) => item.slug),
  canonical_mismatch: inventory.filter((item) => !item.local_export.canonical_matches).map((item) => item.slug),
  crawl_depth_over_four: inventory.filter((item) => item.internal_links.crawl_depth_from_home > 4 || item.internal_links.crawl_depth_from_home === null).map((item) => item.slug),
  production_failures: checkProduction ? inventory.filter((item) => item.production.http_status !== 200 || !item.production.canonical_matches || !item.production.sitemap_included || !item.production.primary_hub_includes_article).map((item) => item.slug) : [],
};

const report = {
  audit_date: new Date().toISOString().slice(0, 10),
  site_origin: siteOrigin,
  source_head: process.env.GITHUB_SHA ?? null,
  summary: {
    published_articles: registry.length,
    content_types: Object.fromEntries([...new Set(registry.map((article) => article.content_type))].sort().map((type) => [type, registry.filter((article) => article.content_type === type).length])),
    static_html_files: htmlFiles.length,
    local_sitemap_urls: localSitemap.length,
    pinterest_packages_present: inventory.filter((item) => item.pinterest.package_present).length,
    articles_with_contextual_inbound: inventory.filter((item) => item.internal_links.contextual_inbound_count > 0).length,
    articles_with_any_article_inbound: inventory.filter((item) => item.internal_links.article_inbound_count > 0).length,
    articles_in_problem_finder: inventory.filter((item) => item.problem_finder.status === "included").length,
    maximum_crawl_depth: Math.max(...inventory.map((item) => item.internal_links.crawl_depth_from_home ?? 0)),
  },
  production,
  findings,
  articles: inventory,
};

if (requestedOutput) {
  const absoluteOutput = path.resolve(repoRoot, requestedOutput);
  await mkdir(path.dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote SEO discovery inventory to ${path.relative(repoRoot, absoluteOutput)}`);
}

console.log(JSON.stringify({ summary: report.summary, findings: report.findings, production: report.production }, null, 2));
