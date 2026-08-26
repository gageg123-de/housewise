import registry from "@/content/articles.json";
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
export const categories = [
  { slug: "hvac", name: "HVAC", intro: "Heating, cooling, airflow, thermostat, and indoor-comfort problems." },
  { slug: "plumbing", name: "Plumbing", intro: "Leaks, drains, toilets, water heaters, pressure, and supply questions." },
  { slug: "electrical", name: "Electrical", intro: "Outlets, lights, switches, circuits, fans, and unusual electrical behavior." },
  { slug: "appliances", name: "Appliances", intro: "Practical symptom guides for laundry, kitchen, and household appliances." },
  { slug: "moisture-and-mold", name: "Moisture & Mold", intro: "Condensation, dampness, stains, musty odors, and moisture-source clues." },
  { slug: "roofing", name: "Roofing", intro: "Roof leaks, flashing, drainage, ventilation, and visible roof symptoms." },
  { slug: "windows-and-doors", name: "Windows & Doors", intro: "Drafts, condensation, sticking, gaps, locks, and water intrusion." },
  { slug: "flooring", name: "Flooring", intro: "Squeaks, cracks, movement, stains, and moisture affecting floors." },
  { slug: "pests", name: "Pests", intro: "Signs of insect and animal activity and the conditions that attract them." },
  { slug: "attic-and-insulation", name: "Attic & Insulation", intro: "Heat, moisture, ventilation, insulation, and attic warning signs." },
  { slug: "garage", name: "Garage", intro: "Garage-specific moisture, odor, door, slab, and equipment problems." },
  { slug: "bathroom", name: "Bathroom", intro: "Fixtures, ventilation, moisture, drains, tile, and bathroom surfaces." },
  { slug: "kitchen", name: "Kitchen", intro: "Sink, appliance, ventilation, cabinet, and kitchen plumbing problems." },
  { slug: "yard-and-drainage", name: "Yard & Drainage", intro: "Standing water, grading, downspouts, erosion, and exterior drainage." },
  { slug: "sounds-and-smells", name: "Sounds & Smells", intro: "Start with the buzz, hum, whistle, mustiness, or other clue you notice." },
];

export const symptoms = [...new Set(articles.flatMap((article) => article.symptoms))].sort();

export function articleUrl(article: Article) { return `/${article.primary_category}/${article.slug}/`; }
export function findArticle(category: string, slug: string) { return articles.find((article) => article.primary_category === category && article.slug === slug); }
export function categoryArticles(category: string) { return articles.filter((article) => article.primary_category === category || article.secondary_categories.includes(category)); }
export function publishedCategories() { return categories.filter((category) => categoryArticles(category.slug).length > 0); }
export function titleCase(value: string) { return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
