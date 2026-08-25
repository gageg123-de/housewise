import type { Metadata } from "next";
import SiteSearch from "@/components/SiteSearch";
import { SiteShell } from "@/components/SiteShell";
import { brandName, canonicalUrl } from "@/lib/site-config";
const description = `Search ${brandName} by symptom, system, location, or phrase.`;
export const metadata: Metadata = { title: "Search Home Problem Guides", description, alternates: { canonical: canonicalUrl("/search/") }, robots: { index: false, follow: true }, openGraph: { title: "Search Home Problem Guides", description, url: canonicalUrl("/search/"), images: [] }, twitter: { title: "Search Home Problem Guides", description, images: [] } };
export default function SearchPage() { return <SiteShell><header className="page-hero compact"><p className="eyebrow">Search the library</p><h1>What is your home doing?</h1><p>Use the words you would naturally use. The index checks titles, symptoms, systems, summaries, and related phrases.</p></header><div className="page-wrap"><SiteSearch/></div></SiteShell>; }
