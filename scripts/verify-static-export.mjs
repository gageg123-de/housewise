import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const outputDir = path.resolve("dist/client");
const siteConfig = JSON.parse(await readFile(path.resolve("site.config.json"), "utf8"));
const registry = JSON.parse(await readFile(path.resolve("content/articles.json"), "utf8"));
const taxonomy = JSON.parse(await readFile(path.resolve("content/taxonomy.json"), "utf8"));
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? siteConfig.basePath;
const normalizedBasePath = configuredBasePath.replace(/^\/+|\/+$/g, "");
const basePath = normalizedBasePath ? `/${normalizedBasePath}` : "";
const siteOrigin = (process.env.NEXT_PUBLIC_SITE_ORIGIN ?? siteConfig.siteOrigin).replace(/\/+$/, "");
const siteUrl = `${siteOrigin}${basePath}`;
const staleProductionReferences = [
  /Housewise/i,
  /housewise\.guide/i,
  /gageg123-de\.github\.io\/housewise/i,
  /chatgpt\.site/i,
];

const requiredFiles = [
  "index.html",
  "404.html",
  ".nojekyll",
  "CNAME",
  "favicon.svg",
  "og.png",
  "images/how-ac-removes-indoor-humidity.webp",
  "robots.txt",
  "sitemap.xml",
  "find-a-problem/index.html",
  "search/index.html",
  "about/index.html",
  "contact/index.html",
  "editorial-policy/index.html",
  "privacy/index.html",
  "terms/index.html",
  "hvac/index.html",
  "plumbing/index.html",
  "hvac/ac-vent-sweating/index.html",
  "hvac/water-dripping-from-ac-vent/index.html",
  "hvac/house-humid-with-ac-running/index.html",
  "plumbing/toilet-bubbles-when-washer-drains/index.html",
];

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

for (const file of requiredFiles) await access(path.join(outputDir, file));

const htmlFiles = (await walk(outputDir)).filter((file) => file.endsWith(".html"));
assert.ok(htmlFiles.length >= 35, `Expected a full route export, found only ${htmlFiles.length} HTML files`);
const referencedPaths = new Set();
const inboundPaths = new Map();
const indexableInboundPaths = new Map();
const indexableMetadata = [];
const indexableRoutePaths = new Set();
const linkGraph = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const staleReference of staleProductionReferences) {
    assert.doesNotMatch(html, staleReference, `${file} contains stale production branding or domains`);
  }
  assert.ok(!html.includes('="/housewise/'), `${file} contains a legacy repository base path`);
  assert.ok(!/>\s*click here\s*</i.test(html), `${file} contains generic anchor text`);
  if (basePath) assert.ok(!html.includes(`${basePath}${basePath}/`), `${file} duplicates the base path`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  const relativeFile = path.relative(outputDir, file).replaceAll("\\", "/");
  const is404 = relativeFile === "404.html";
  const isSearch = relativeFile === "search/index.html";
  const logicalRoute = relativeFile === "index.html" ? "/" : `/${relativeFile.replace(/index\.html$/, "")}`;
  const publicRoute = `${basePath}${logicalRoute}` || "/";
  linkGraph.set(publicRoute, new Set());
  assert.ok(title && description, `${file} is missing a title or description`);
  assert.equal(h1Count, 1, `${file} should contain exactly one H1`);
  if (is404) {
    assert.ok(/noindex/.test(html), "404 must be noindex");
    assert.ok(!canonical, "404 must not inherit the homepage canonical");
  } else {
    assert.ok(canonical === siteUrl || canonical?.startsWith(`${siteUrl}/`), `${file} has a missing or off-origin canonical`);
    if (!isSearch) {
      indexableMetadata.push({ file, title, description, canonical });
      indexableRoutePaths.add(publicRoute);
    }
  }
  assert.ok(!html.includes('"@type":"SearchAction"'), `${file} restores obsolete SearchAction schema`);
  assert.equal(html.includes('"@type":"WebSite"'), relativeFile === "index.html", `${file} has incorrect WebSite schema placement`);
  if (isSearch) assert.ok(/noindex/.test(html), "Search must remain noindex,follow");
  for (const match of html.matchAll(/\b(?:href|src|action)=["'](\/[^"']*)/g)) {
    const url = match[1];
    assert.ok(url === basePath || url.startsWith(`${basePath}/`), `${file} contains an unprefixed root URL: ${url}`);
    const pathname = new URL(url, "https://verify.invalid").pathname;
    referencedPaths.add(pathname);
    if (match[0].startsWith("href")) {
      inboundPaths.set(pathname, (inboundPaths.get(pathname) ?? 0) + 1);
      if (!is404 && !isSearch) indexableInboundPaths.set(pathname, (indexableInboundPaths.get(pathname) ?? 0) + 1);
      linkGraph.get(publicRoute).add(pathname);
    }
  }
}

for (const key of ["title", "description", "canonical"]) {
  const values = new Set();
  for (const record of indexableMetadata) {
    assert.ok(!values.has(record[key]), `Duplicate ${key}: ${record[key]}`);
    values.add(record[key]);
  }
}

for (const article of registry) {
  const pathname = `${basePath}/${article.primary_category}/${article.slug}/`;
  assert.ok((inboundPaths.get(pathname) ?? 0) > 0, `Published article has no crawlable inbound link: ${pathname}`);
  assert.ok((indexableInboundPaths.get(pathname) ?? 0) > 0, `Published article has no inbound link from an indexable page: ${pathname}`);
  const articleFile = path.join(outputDir, article.primary_category, article.slug, "index.html");
  const articleHtml = await readFile(articleFile, "utf8");
  for (const requiredPath of [`${basePath}/${article.primary_category}/`, `${basePath}/find-a-problem/`, `${basePath}/search/`]) {
    assert.ok(articleHtml.includes(`href="${requiredPath}"`), `${pathname} is missing the outbound pathway ${requiredPath}`);
  }
  assert.ok(articleHtml.includes('"@type":"Article"'), `${pathname} is missing Article schema`);
  assert.ok(articleHtml.includes('"@type":"BreadcrumbList"'), `${pathname} is missing BreadcrumbList schema`);
}

const homeRoute = `${basePath}/`;
const crawlDepth = new Map([[homeRoute, 0]]);
const crawlQueue = [homeRoute];
while (crawlQueue.length) {
  const current = crawlQueue.shift();
  for (const next of linkGraph.get(current) ?? []) {
    if (!indexableRoutePaths.has(next) || crawlDepth.has(next)) continue;
    crawlDepth.set(next, crawlDepth.get(current) + 1);
    crawlQueue.push(next);
  }
}
for (const article of registry) {
  const pathname = `${basePath}/${article.primary_category}/${article.slug}/`;
  assert.ok(crawlDepth.has(pathname), `Published article is unreachable from the homepage: ${pathname}`);
  assert.ok(crawlDepth.get(pathname) <= 4, `Published article exceeds four meaningful crawl steps: ${pathname}`);
}

for (const pathname of referencedPaths) {
  const relativePath = decodeURIComponent(pathname.slice(basePath.length)).replace(/^\/+/, "");
  const artifactPath = !relativePath
    ? "index.html"
    : relativePath.endsWith("/")
      ? `${relativePath}index.html`
      : path.extname(relativePath)
        ? relativePath
        : `${relativePath}/index.html`;
  await access(path.join(outputDir, artifactPath));
}

const home = await readFile(path.join(outputDir, "index.html"), "utf8");
assert.ok(home.includes(siteConfig.brandName));
assert.ok(home.includes(siteConfig.tagline));
assert.match(home, new RegExp(`<link[^>]+rel=["']canonical["'][^>]+href=["']${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?["']`, "i"));
assert.match(home, new RegExp(`<meta[^>]+property=["']og:url["'][^>]+content=["']${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?["']`, "i"));
assert.ok(home.includes(`${siteUrl}/og.png`));
assert.match(home, new RegExp(`(?:href|src)=["']${basePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/_next/`, "i"));
assert.match(home, new RegExp(`action=["']${basePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/search/["']`, "i"));

const sitemap = await readFile(path.join(outputDir, "sitemap.xml"), "utf8");
for (const staleReference of staleProductionReferences) assert.doesNotMatch(sitemap, staleReference);
for (const route of ["/", "/hvac/", "/plumbing/", "/hvac/ac-vent-sweating/", "/hvac/water-dripping-from-ac-vent/", "/hvac/house-humid-with-ac-running/", "/plumbing/toilet-bubbles-when-washer-drains/"]) {
  assert.ok(sitemap.includes(`${siteUrl}${route}`), `Sitemap is missing ${siteUrl}${route}`);
}
if (basePath) assert.ok(!sitemap.includes(`${basePath}${basePath}/`), "Sitemap duplicates the base path");
assert.ok(!sitemap.includes("github.io"), "Production sitemap contains a GitHub Pages infrastructure URL");
assert.equal((sitemap.match(/<url>/g) ?? []).length, htmlFiles.length - 2, "Sitemap should contain every indexable HTML route except search and 404");
assert.equal((sitemap.match(/<lastmod>/g) ?? []).length, registry.length, "Only article URLs should carry verified last-modified dates");
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(sitemapLocations).size, sitemapLocations.length, "Sitemap contains duplicate URLs");
const normalizeUrl = (value) => value.replace(/\/$/, "");
assert.deepEqual(
  sitemapLocations.map(normalizeUrl).sort(),
  indexableMetadata.map((record) => normalizeUrl(record.canonical)).sort(),
  "Sitemap must exactly match rendered indexable canonicals",
);

const categoryCounts = new Map(taxonomy.categories.map((category) => [category.slug, registry.filter((article) => article.primary_category === category.slug || article.secondary_categories.includes(category.slug)).length]));
for (const [slug, count] of categoryCounts) {
  const hubFile = path.join(outputDir, slug, "index.html");
  const hubUrl = `${siteUrl}/${slug}/`;
  if (count > 0) {
    await access(hubFile);
    assert.ok(sitemap.includes(hubUrl), `Populated category hub is missing from sitemap: /${slug}/`);
  } else {
    await assert.rejects(access(hubFile), `Empty category hub was generated: /${slug}/`);
    assert.ok(!sitemap.includes(hubUrl), `Empty category hub should not be indexable: /${slug}/`);
  }
}
for (const emptyHub of ["/symptoms/crack/", "/symptoms/cold/", "/symptoms/low-pressure/", "/symptoms/pest-activity/"]) {
  assert.ok(!sitemap.includes(`${siteUrl}${emptyHub}`), `Empty taxonomy hub should not be indexable: ${emptyHub}`);
}

const robots = await readFile(path.join(outputDir, "robots.txt"), "utf8");
for (const staleReference of staleProductionReferences) assert.doesNotMatch(robots, staleReference);
assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`));
assert.ok(robots.includes(`Disallow: ${basePath}/search/`));

const cname = await readFile(path.join(outputDir, "CNAME"), "utf8");
assert.equal(cname.trim(), siteConfig.customDomain);

const stats = await stat(path.join(outputDir, "index.html"));
assert.ok(stats.size > 1_000, "Exported index.html is unexpectedly small");
const allFiles = await walk(outputDir);
assert.ok(!allFiles.some((file) => file.endsWith(".map")), "Production artifact contains source maps");
const homeScriptPaths = [...new Set([...home.matchAll(/(?:src|href)=["']([^"']+\.js)["']/g)].map((match) => new URL(match[1], "https://verify.invalid").pathname))];
let homeInitialJsGzip = 0;
for (const scriptPath of homeScriptPaths) {
  const relativePath = decodeURIComponent(scriptPath.slice(basePath.length)).replace(/^\/+/, "");
  homeInitialJsGzip += gzipSync(await readFile(path.join(outputDir, relativePath))).length;
}
assert.ok(homeInitialJsGzip <= 120_000, `Homepage initial JS grew to ${homeInitialJsGzip} bytes gzip; current regression ceiling is 120000 while the target remains 90000`);
const socialCardStats = await stat(path.join(outputDir, "og.png"));
assert.ok(socialCardStats.size <= 2_000_000, `Social card grew beyond the current 2 MB maintenance ceiling: ${socialCardStats.size}`);
for (const article of registry.filter((item) => item.image)) {
  const imagePath = path.join(outputDir, article.image.src.replace(/^\/+/, ""));
  const imageStats = await stat(imagePath);
  assert.ok(imageStats.size <= 200_000, `${article.slug}: primary article image exceeds the 200 KB budget`);
}

console.log(`Verified ${htmlFiles.length} static HTML pages in ${outputDir}`);
