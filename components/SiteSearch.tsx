"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { SiteLink as Link } from "@/components/SiteLink";
import registry from "@/content/articles.json";
import { searchArticles } from "@/lib/discovery.mjs";
import { articleUrl, titleCase, type Article } from "@/lib/site-data";

export default function SiteSearch() {
  const initialQuery = useSyncExternalStore(
    () => () => undefined,
    () => new URLSearchParams(window.location.search).get("q") ?? "",
    () => "",
  );
  const [editedQuery, setEditedQuery] = useState<string | null>(null);
  const query = editedQuery ?? initialQuery;
  const results = useMemo(() => searchArticles(registry as Article[], query), [query]);
  return <div className="search-page" data-analytics-surface="site_search"><label htmlFor="library-search">Search titles, symptoms, systems, and keywords</label><input id="library-search" type="search" value={query} onChange={(event) => setEditedQuery(event.target.value)} placeholder="Try “musty garage” or “toilet bubbling”" data-analytics-event="site_search"/><p aria-live="polite">{results.length} {results.length === 1 ? "guide" : "guides"}</p>{results.length ? <div className="result-list">{results.map((article) => <Link key={article.slug} href={articleUrl(article)} data-analytics-event="search_result_click" data-search-query={query} data-result-slug={article.slug}><strong>{article.title}</strong><span>{titleCase(article.primary_category)} · {article.description}</span></Link>)}</div> : <div className="empty-state"><strong>No close match yet.</strong><p>Try fewer words, describe the symptom another way, or let the Problem Finder narrow it down by location.</p><div className="empty-actions"><Link href="/find-a-problem/">Use the Problem Finder</Link><Link href="/">Browse home problems</Link></div></div>}</div>;
}
