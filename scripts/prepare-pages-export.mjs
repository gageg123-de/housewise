import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("dist/client");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/housewise";
const siteOrigin = (process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://gageg123-de.github.io").replace(/\/+$/, "");
const siteUrl = `${siteOrigin}${basePath}`;

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

const htmlFiles = (await walk(outputDir)).filter((file) => file.endsWith(".html"));
let moved = 0;

for (const source of htmlFiles) {
  const relative = path.relative(outputDir, source).replaceAll("\\", "/");
  if (relative === "index.html" || relative === "404.html" || relative.endsWith("/index.html")) continue;
  const route = relative.slice(0, -".html".length);
  const destination = path.join(outputDir, route, "index.html");
  await mkdir(path.dirname(destination), { recursive: true });
  await rename(source, destination);
  moved += 1;
}

if (basePath) {
  const nestedRoot = path.join(outputDir, basePath.replace(/^\/+|\/+$/g, ""));
  const nestedAssets = path.join(nestedRoot, "_next");
  await rename(nestedAssets, path.join(outputDir, "_next"));
  await rm(nestedRoot, { recursive: true, force: true });
}

const manifest = JSON.parse(await readFile(path.resolve("dist/server/vinext-prerender.json"), "utf8"));
const registry = JSON.parse(await readFile(path.resolve("content/articles.json"), "utf8"));
const articleUpdates = new Map(registry.map((article) => [`/${article.primary_category}/${article.slug}`, article.updated_date]));
const routes = [...new Set(manifest.routes.map((entry) => entry.path ?? entry.route))]
  .filter((route) => route !== "/404" && route !== "/search" && !route.includes(":"))
  .sort((left, right) => left.localeCompare(right));

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const sitemapEntries = routes.map((route) => {
  const suffix = route === "/" ? "/" : `${route}/`;
  const lastModified = articleUpdates.get(route) ?? "2026-08-24";
  return `  <url><loc>${escapeXml(`${siteUrl}${suffix}`)}</loc><lastmod>${lastModified}</lastmod></url>`;
});
await writeFile(path.join(outputDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join("\n")}\n</urlset>\n`);
await writeFile(path.join(outputDir, "robots.txt"), `User-agent: *\nAllow: ${basePath}/\nDisallow: ${basePath}/search/\nSitemap: ${siteUrl}/sitemap.xml\n`);

console.log(`Prepared GitHub Pages export: ${moved + 1} HTML pages plus robots.txt and sitemap.xml.`);
