import registry from "@/content/articles.json";

export type Article = (typeof registry)[number];
export const articles = registry as Article[];
export const siteUrl = "https://housewise.guide";

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

export const symptoms = ["leaking", "smell", "noise", "moisture", "crack", "heat", "cold", "vibration", "clogging", "low-pressure", "electrical-behavior", "pest-activity", "discoloration"];

export function articleUrl(article: Article) { return `/${article.primary_category}/${article.slug}/`; }
export function findArticle(category: string, slug: string) { return articles.find((article) => article.primary_category === category && article.slug === slug); }
export function categoryArticles(category: string) { return articles.filter((article) => article.primary_category === category || article.secondary_categories.includes(category)); }
export function titleCase(value: string) { return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
