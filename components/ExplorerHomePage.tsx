import { GuideCard } from "@/components/GuideCard";
import { HouseExplorer } from "@/components/HouseExplorer";
import { SiteLink as Link } from "@/components/SiteLink";
import { SiteShell } from "@/components/SiteShell";
import { resolveHouseHotspots } from "@/lib/house-explorer";
import { normalizeHouseVisualVariant } from "@/lib/house-visual-variant";
import { articles, publishedCategories } from "@/lib/site-data";
import { routePath, tagline } from "@/lib/site-config";

export function ExplorerHomePage({ schemaMarkup }: { schemaMarkup: string }) {
  const hotspots = resolveHouseHotspots();
  const houseVisual = normalizeHouseVisualVariant(process.env.NEXT_PUBLIC_HOUSE_EXPLORER_VISUAL);
  const featured = articles.filter((article) => article.featured_status).slice(0, 3);
  return <SiteShell>
    <section className="explorer-hero">
      <div className="explorer-hero-copy"><p className="eyebrow">{tagline}</p><h1>Your House Is Doing <em>WHAT?</em></h1><p>Something weird happening at home? Explore your house or describe the problem to find out what might be going on.</p></div>
      <form className="search-box explorer-search" action={routePath("/search/")} data-analytics-event="site_search"><label className="sr-only" htmlFor="explorer-site-search">Search home problems</label><input id="explorer-site-search" name="q" type="search" placeholder="What’s happening in your house?"/><button type="submit">Search guides</button></form>
      <Link className="finder-link" href="/find-a-problem/">Not sure where to start? Use the Problem Finder →</Link>
    </section>
    <section className="explorer-section" aria-labelledby="explore-house-title">
      <div className="explorer-intro"><div><p className="eyebrow">Interactive home guide</p><h2 id="explore-house-title">Explore Your House</h2></div><p>Tap a room or part of the house to find common problems. The house helps you choose a reading path—it does not diagnose the cause.</p></div>
      <HouseExplorer hotspots={hotspots} visualVariant={houseVisual}/>
    </section>
    <section className="explorer-categories" aria-labelledby="explorer-categories-title">
      <div><p className="eyebrow">Prefer the traditional route?</p><h2 id="explorer-categories-title">Browse every home system</h2><p>Go straight to a category, or let the Problem Finder narrow the library by location and symptom.</p><Link className="button" href="/find-a-problem/">Open the Problem Finder</Link></div>
      <div className="explorer-category-links">{publishedCategories().slice(0, 10).map((category) => <Link href={`/${category.slug}/`} key={category.slug} data-analytics-event="house_category_click" data-category={category.slug}><span>{category.name}</span><i aria-hidden="true">→</i></Link>)}</div>
    </section>
    <section className="section explorer-starting-points"><div className="section-heading"><div><p className="eyebrow">Useful starting points</p><h2>Popular guides</h2></div><Link href="/search/">Search all guides</Link></div><div className="guide-grid">{featured.map((article) => <GuideCard article={article} key={article.slug} context="popular"/>)}</div></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaMarkup }}/>
  </SiteShell>;
}
