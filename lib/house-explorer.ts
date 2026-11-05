import explorerConfig from "@/content/house-explorer.json";
import { articles, articleUrl } from "@/lib/site-data";

export type HouseExplorerArticle = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

export type HouseHotspot = {
  id: string;
  label: string;
  prompt: string;
  categoryHref: string;
  categoryLabel: string;
  x: number;
  y: number;
  detailedX: number;
  detailedY: number;
  highlight: {
    x: number;
    y: number;
    width: number;
    height: number;
    clipPath: string;
  };
  articles: HouseExplorerArticle[];
};

export function resolveHouseHotspots(): HouseHotspot[] {
  return explorerConfig.map((hotspot) => ({
    ...hotspot,
    articles: hotspot.articleSlugs.map((slug) => {
      const article = articles.find((candidate) => candidate.slug === slug);
      if (!article) throw new Error(`House explorer destination is not published: ${slug}`);
      return {
        slug: article.slug,
        title: article.title,
        description: article.description,
        href: articleUrl(article),
      };
    }),
  }));
}
