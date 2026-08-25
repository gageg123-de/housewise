import type { Metadata } from "next";
import "./globals.css";
import { assetUrl, brandName, canonicalUrl, siteUrl, tagline } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: { default: `${brandName} | ${tagline}`, template: `%s | ${brandName}` },
  description: `${tagline} Calm, practical guides to leaks, smells, noises, moisture, electrical behavior, and other home problems.`,
  alternates: { canonical: canonicalUrl("/") },
  openGraph: { type: "website", siteName: brandName, url: canonicalUrl("/"), title: brandName, description: tagline, images: [{ url: assetUrl("/og.png"), width: 1731, height: 909, alt: `${brandName} — ${tagline}` }] },
  twitter: { card: "summary_large_image", title: brandName, description: tagline, images: [assetUrl("/og.png")] },
  icons: { icon: assetUrl("/favicon.svg"), shortcut: assetUrl("/favicon.svg") },
  // Add a future Google Search Console verification token via `verification: { google: "..." }` here.
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: brandName, description: tagline, url: canonicalUrl("/"), potentialAction: { "@type": "SearchAction", target: `${canonicalUrl("/search/")}?q={search_term_string}`, "query-input": "required name=search_term_string" } };
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: brandName, url: siteUrl };
  return <html lang="en"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([website, organization]).replace(/</g, "\\u003c") }}/>{/* Future analytics, ad, and site-verification scripts belong here only after consent/configuration. */}</body></html>;
}
