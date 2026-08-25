import type { MetadataRoute } from "next";
import { routePath, siteUrl } from "@/lib/site-config";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: routePath("/"), disallow: [routePath("/search/")] }, sitemap: `${siteUrl}/sitemap.xml` }; }
