import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("dist/client");
const siteConfig = JSON.parse(await readFile(path.resolve("site.config.json"), "utf8"));
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
assert.ok(htmlFiles.length >= 40, `Expected a full route export, found only ${htmlFiles.length} HTML files`);
const referencedPaths = new Set();

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const staleReference of staleProductionReferences) {
    assert.doesNotMatch(html, staleReference, `${file} contains stale production branding or domains`);
  }
  assert.ok(!html.includes('="/housewise/'), `${file} contains a legacy repository base path`);
  if (basePath) assert.ok(!html.includes(`${basePath}${basePath}/`), `${file} duplicates the base path`);
  for (const match of html.matchAll(/\b(?:href|src|action)=["'](\/[^"']*)/g)) {
    const url = match[1];
    assert.ok(url === basePath || url.startsWith(`${basePath}/`), `${file} contains an unprefixed root URL: ${url}`);
    referencedPaths.add(new URL(url, "https://verify.invalid").pathname);
  }
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
for (const route of ["/", "/hvac/", "/plumbing/", "/hvac/ac-vent-sweating/", "/plumbing/toilet-bubbles-when-washer-drains/"]) {
  assert.ok(sitemap.includes(`${siteUrl}${route}`), `Sitemap is missing ${siteUrl}${route}`);
}
if (basePath) assert.ok(!sitemap.includes(`${basePath}${basePath}/`), "Sitemap duplicates the base path");
assert.ok(!sitemap.includes("github.io"), "Production sitemap contains a GitHub Pages infrastructure URL");
assert.equal((sitemap.match(/<url>/g) ?? []).length, htmlFiles.length - 2, "Sitemap should contain every indexable HTML route except search and 404");

const robots = await readFile(path.join(outputDir, "robots.txt"), "utf8");
for (const staleReference of staleProductionReferences) assert.doesNotMatch(robots, staleReference);
assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`));
assert.ok(robots.includes(`Disallow: ${basePath}/search/`));

const cname = await readFile(path.join(outputDir, "CNAME"), "utf8");
assert.equal(cname.trim(), siteConfig.customDomain);

const stats = await stat(path.join(outputDir, "index.html"));
assert.ok(stats.size > 1_000, "Exported index.html is unexpectedly small");

console.log(`Verified ${htmlFiles.length} static HTML pages in ${outputDir}`);
