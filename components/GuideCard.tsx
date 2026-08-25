import Link from "next/link";
import type { Article } from "@/lib/site-data";
import { articleUrl, titleCase } from "@/lib/site-data";

export function GuideCard({ article }: { article: Article }) {
  return <article className="guide-card"><p className="guide-type">{titleCase(article.content_type)}</p><h3><Link href={articleUrl(article)}>{article.title}</Link></h3><p>{article.description}</p><div className="tag-row">{article.symptoms.slice(0, 3).map((symptom) => <span key={symptom}>{titleCase(symptom)}</span>)}</div></article>;
}
