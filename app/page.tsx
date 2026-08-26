import { SiteLink as Link } from "@/components/SiteLink";
import { GuideCard } from "@/components/GuideCard";
import { SiteShell } from "@/components/SiteShell";
import { articles, articleUrl, publishedCategories, symptoms } from "@/lib/site-data";
import { brandName, canonicalUrl, routePath, tagline } from "@/lib/site-config";

const problems = [
  ["leaking", "Something is leaking", "Drips, puddles, damp spots, and water stains"], ["smell", "Something smells", "Musty, burning, sewer, and unexplained odors"],
  ["noise", "Something is making noise", "Buzzing, humming, banging, whistling, and gurgling"], ["heat", "Something is too hot or cold", "Uneven rooms, warm fixtures, and comfort issues"],
  ["moisture", "I found moisture", "Condensation, damp materials, and hidden water"], ["drainage", "Drain or backup problem", "Slow drains, bubbling fixtures, and possible blockages"],
  ["electrical-behavior", "Electrical problem", "Warm outlets, flickers, trips, sparks, and odd behavior"], ["appliance-behavior", "Appliance problem", "Unexpected cycles, slow performance, and unusual behavior"]
];

export default function Home() {
  const featured = articles.filter((article) => article.featured_status).slice(0, 4);
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: brandName, url: canonicalUrl("/") };
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: brandName, url: canonicalUrl("/") };
  return <SiteShell><section className="hero"><p className="eyebrow">{tagline}</p><h1>Figure out what’s happening in your home.</h1><p className="hero-copy">Search a symptom, browse a system, or use the guided problem finder to narrow down what to check next.</p><form className="search-box" action={routePath("/search/")} data-analytics-event="site_search"><label className="sr-only" htmlFor="site-search">Search home problems</label><input id="site-search" name="q" type="search" placeholder="Try “toilet bubbling” or “warm outlet”"/><button type="submit">Search guides</button></form><Link className="finder-link" href="/find-a-problem/">Not sure what to search? Start the Problem Finder →</Link></section>
  <section className="section" aria-labelledby="browse-problems"><div className="section-heading"><div><p className="eyebrow">Start with what you notice</p><h2 id="browse-problems">Browse by problem</h2></div></div><div className="problem-grid">{problems.filter(([slug]) => symptoms.includes(slug)).map(([slug,title,detail]) => <Link className="problem-card" href={`/symptoms/${slug}/`} key={slug}><span className="card-mark" aria-hidden="true"/><strong>{title}</strong><span>{detail}</span></Link>)}</div></section>
  <section className="system-band" aria-labelledby="browse-systems"><div><p className="eyebrow">Know where to look?</p><h2 id="browse-systems">Browse by home system</h2><p>Explore a focused collection of problems, symptoms, and practical checks.</p></div><div className="system-links">{publishedCategories().slice(0, 10).map((category) => <Link href={`/${category.slug}/`} key={category.slug} data-analytics-event="category_click" data-category={category.slug}>{category.name}<span>→</span></Link>)}</div></section>
  <section className="section"><div className="section-heading"><div><p className="eyebrow">Useful starting points</p><h2>Popular guides</h2></div><Link href="/search/">View all guides</Link></div><div className="guide-grid">{featured.map((article) => <GuideCard article={article} key={article.slug} context="popular"/>)}</div></section>
  <section className="finder-cta"><div><p className="eyebrow">Guided navigation</p><h2>Start with the room. Then the symptom.</h2><p>The Home Problem Finder connects what you can observe with relevant reading—without pretending to diagnose your house.</p></div><Link className="button" href="/find-a-problem/">Open the Problem Finder</Link></section>
  <section className="section updated"><div><p className="eyebrow">Recently updated</p><h2>Recently updated guides</h2></div><div className="updated-list">{[...articles].sort((left, right) => right.updated_date.localeCompare(left.updated_date)).slice(0,3).map((article) => <Link href={articleUrl(article)} key={article.slug}><span>{article.updated_date}</span>{article.title}</Link>)}</div></section><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([website, organization]).replace(/</g, "\\u003c") }}/></SiteShell>;
}
