import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("dist/client");
const siteConfig = JSON.parse(await readFile(path.resolve("site.config.json"), "utf8"));
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? siteConfig.basePath;
const normalizedBasePath = configuredBasePath.replace(/^\/+|\/+$/g, "");
const basePath = normalizedBasePath ? `/${normalizedBasePath}` : "";
const port = Number(process.env.PORT ?? 4173);
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
]);

async function resolveFile(urlPath) {
  if (urlPath !== basePath && !urlPath.startsWith(`${basePath}/`)) return null;
  const relativePath = decodeURIComponent(urlPath.slice(basePath.length)).replace(/^\/+/, "");
  const candidate = path.resolve(outputDir, relativePath || "index.html");
  if (!candidate.startsWith(`${outputDir}${path.sep}`)) return null;

  try {
    const details = await stat(candidate);
    return details.isDirectory() ? path.join(candidate, "index.html") : candidate;
  } catch {
    return null;
  }
}

createServer(async (request, response) => {
  const urlPath = new URL(request.url ?? "/", "http://localhost").pathname;
  const filePath = await resolveFile(urlPath) ?? path.join(outputDir, "404.html");
  try {
    const body = await readFile(filePath);
    response.writeHead(filePath.endsWith("404.html") ? 404 : 200, {
      "Content-Type": mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream",
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : String(error));
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`${siteConfig.brandName} Pages preview: http://127.0.0.1:${port}${basePath}/`);
});
