"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { SiteLink as Link } from "@/components/SiteLink";
import registry from "@/content/articles.json";
import { articleUrl, titleCase, type Article } from "@/lib/site-data";

export default function SiteSearch() {
  const initialQuery = useSyncExternalStore(
    () => () => undefined,
    () => new URLSearchParams(window.location.search).get("q") ?? "",
    () => "",
  );
  const [editedQuery, setEditedQuery] = useState<string | null>(null);
  const query = editedQuery ?? initialQuery;
  const results = useMemo(() => { const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean); if (!terms.length) return registry as Article[]; return (registry as Article[]).map((article) => { const fields = [article.title, article.description, article.primary_category, ...article.symptoms, ...article.search_keywords].join(" ").toLowerCase(); return { article, score: terms.reduce((sum, term) => sum + (article.title.toLowerCase().includes(term) ? 5 : 0) + (article.search_keywords.some((keyword) => keyword.includes(term)) ? 3 : 0) + (fields.includes(term) ? 1 : 0), 0) }; }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).map((item) => item.article); }, [query]);
  return <div className="search-page"><label htmlFor="library-search">Search titles, symptoms, systems, and keywords</label><input id="library-search" type="search" value={query} onChange={(event) => setEditedQuery(event.target.value)} placeholder="Try “musty garage” or “toilet bubbling”"/><p aria-live="polite">{results.length} {results.length === 1 ? "guide" : "guides"}</p><div className="result-list">{results.map((article) => <Link key={article.slug} href={articleUrl(article)}><strong>{article.title}</strong><span>{titleCase(article.primary_category)} · {article.description}</span></Link>)}</div></div>;
}
