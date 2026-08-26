import registry from "@/content/articles.json";
import taxonomy from "@/content/taxonomy.json";
export { siteUrl } from "@/lib/site-config";

export type ContextualLink = {
  before: string;
  label: string;
  href: string;
  after: string;
};

export type ArticleSection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  causes?: { heading: string; text: string }[];
  subsections?: { heading: string; paragraphs: string[] }[];
  bullets?: string[];
  link?: ContextualLink;
  links?: ContextualLink[];
  table?: { headers: string[]; rows: string[][] };
  callout?: { title: string; text: string };
};

export type ArticleImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  kind: "conceptual" | "diagrammatic" | "representational";
  after_section: string;
};

export type Article = {
  title: string;
  slug: string;
  description: string;
  primary_category: string;
  secondary_categories: string[];
  symptoms: string[];
  room_or_location: string[];
  system: string;
  content_type: string;
  published_date: string;
  updated_date: string;
  reviewed_date: string | null;
  author: string;
  reading_time: number;
  featured_status: boolean;
  search_keywords: string[];
  target_search_intent: string;
  direct_answer: string;
  likely_causes: string[];
  safe_checks: string[];
  professional_help: string;
  related_articles: string[];
  body_sections?: ArticleSection[];
  contextual_link?: ContextualLink;
  contextual_links?: ContextualLink[];
  image?: ArticleImage;
  sources?: { title: string; publisher: string; url: string }[];
};

export const articles = registry as Article[];
export const categories = taxonomy.categories;

export const symptoms = [...new Set(articles.flatMap((article) => article.symptoms))].sort();

export function articleUrl(article: Article) { return `/${article.primary_category}/${article.slug}/`; }
export function findArticle(category: string, slug: string) { return articles.find((article) => article.primary_category === category && article.slug === slug); }
export function categoryArticles(category: string) { return articles.filter((article) => article.primary_category === category || article.secondary_categories.includes(category)); }
export function publishedCategories() { return categories.filter((category) => categoryArticles(category.slug).length > 0); }
export function titleCase(value: string) { return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
