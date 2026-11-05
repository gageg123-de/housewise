import { ClassicHomePage } from "@/components/ClassicHomePage";
import { ExplorerHomePage } from "@/components/ExplorerHomePage";
import { normalizeHomeVariant } from "@/lib/home-variant";
import { brandName, canonicalUrl } from "@/lib/site-config";

export default function Home() {
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: brandName, url: canonicalUrl("/") };
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: brandName, url: canonicalUrl("/") };
  const variant = normalizeHomeVariant(process.env.NEXT_PUBLIC_HOME_VARIANT);
  const schemaMarkup = JSON.stringify([website, organization]).replace(/</g, "\\u003c");
  return variant === "explorer" ? <ExplorerHomePage schemaMarkup={schemaMarkup}/> : <ClassicHomePage schemaMarkup={schemaMarkup}/>;
}
