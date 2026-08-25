import siteConfig from "@/site.config.json";

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? siteConfig.basePath;
const configuredOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? siteConfig.siteOrigin;

const normalizedBasePath = configuredBasePath.replace(/^\/+|\/+$/g, "");
export const brandName = siteConfig.brandName;
export const tagline = siteConfig.tagline;
export const customDomain = siteConfig.customDomain;
export const basePath = normalizedBasePath ? `/${normalizedBasePath}` : "";
export const siteOrigin = configuredOrigin.replace(/\/+$/, "");
export const siteUrl = `${siteOrigin}${basePath}`;

export function routePath(path = "/") {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("#")) return path;
  const [, pathname = "/", suffix = ""] = path.match(/^([^?#]*)(.*)$/) ?? [];
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  const isFile = /\/[^/]+\.[^/]+$/.test(`/${clean}`);
  const normalized = clean ? `/${clean}${isFile ? "" : "/"}` : "/";
  return `${basePath}${normalized}${suffix}`;
}

export function canonicalUrl(path = "/") {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return `${siteUrl}${normalized}`;
}

export function assetUrl(path: string) {
  return `${siteUrl}/${path.replace(/^\/+/, "")}`;
}
