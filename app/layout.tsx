import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/site-data";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Housewise Guide | Understand What Your Home Is Telling You", template: "%s | Housewise Guide" },
  description: "Calm, practical guides to help homeowners understand leaks, smells, noises, moisture, electrical behavior, and other home problems.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Housewise Guide", title: "Housewise Guide", description: "Figure out what’s happening in your home.", images: [{ url: "/og.png", width: 1731, height: 909, alt: "Housewise Guide — Figure out what’s happening in your home." }] },
  twitter: { card: "summary_large_image", title: "Housewise Guide", description: "Figure out what’s happening in your home.", images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  // Add a future Google Search Console verification token via `verification: { google: "..." }` here.
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: "Housewise Guide", url: siteUrl, potentialAction: { "@type": "SearchAction", target: `${siteUrl}/search/?q={search_term_string}`, "query-input": "required name=search_term_string" } };
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "Housewise Guide", url: siteUrl };
  return <html lang="en"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([website, organization]).replace(/</g, "\\u003c") }}/>{/* Future analytics, ad, and site-verification scripts belong here only after consent/configuration. */}</body></html>;
}
