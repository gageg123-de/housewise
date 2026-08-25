import type { Metadata } from "next";
import ProblemFinder from "@/components/ProblemFinder";
import { SiteShell } from "@/components/SiteShell";
export const metadata: Metadata = { title: "Home Problem Finder", description: "Choose a location and symptom to find relevant homeowner guides.", alternates: { canonical: "/find-a-problem/" }, openGraph: { title: "Home Problem Finder", description: "Choose a location and symptom to find relevant homeowner guides.", images: [] }, twitter: { title: "Home Problem Finder", description: "Choose a location and symptom to find relevant homeowner guides.", images: [] } };
export default function FinderPage() { return <SiteShell><header className="page-hero"><p className="eyebrow">Home Problem Finder</p><h1>Start with what you can observe.</h1><p>Choose where the problem is happening and what you notice. We’ll surface relevant possible causes and guides.</p></header><div className="page-wrap"><ProblemFinder/></div></SiteShell>; }
