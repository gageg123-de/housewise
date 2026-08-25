import { SiteLink as Link } from "@/components/SiteLink";
import { SiteShell } from "@/components/SiteShell";
export default function NotFound() { return <SiteShell><section className="not-found"><p className="eyebrow">404 · Page not found</p><h1>This problem guide wandered off.</h1><p>The address may have changed, or the guide may not exist yet. Search by what you notice instead.</p><div><Link className="button" href="/search/">Search guides</Link><Link href="/find-a-problem/">Use the Problem Finder</Link></div></section></SiteShell>; }
