import type { Metadata } from "next";
import { SiteLink as Link } from "@/components/SiteLink";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { GuideCard } from "@/components/GuideCard";
import { articles, symptoms, titleCase } from "@/lib/site-data";
import { canonicalUrl } from "@/lib/site-config";
export async function generateStaticParams() { return symptoms.map((symptom) => ({ symptom })); }
export async function generateMetadata({ params }: { params: Promise<{ symptom: string }> }): Promise<Metadata> { const { symptom } = await params; const title = `${titleCase(symptom)} Problems Around the Home`; const description = `Browse homeowner guides connected to ${titleCase(symptom).toLowerCase()} symptoms.`; const url = canonicalUrl(`/symptoms/${symptom}/`); return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, images: [] }, twitter: { title, description, images: [] } }; }
export default async function SymptomPage({ params }: { params: Promise<{ symptom: string }> }) { const { symptom } = await params; if (!symptoms.includes(symptom)) notFound(); const matches = articles.filter((article) => article.symptoms.includes(symptom)); if (!matches.length) notFound(); return <SiteShell><header className="page-hero compact"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Symptoms</span><span>/</span><span aria-current="page">{titleCase(symptom)}</span></nav><p className="eyebrow">Browse by symptom</p><h1>{titleCase(symptom)} problems</h1><p>These guides connect the symptom you notice with relevant home systems. Similar clues can have different causes, so compare timing, location, and related changes.</p></header><section className="page-wrap"><div className="guide-grid">{matches.map((article) => <GuideCard key={article.slug} article={article} context="symptom"/>)}</div></section></SiteShell>; }
