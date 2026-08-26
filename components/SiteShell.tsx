import { SiteLink as Link } from "@/components/SiteLink";
import { publishedCategories } from "@/lib/site-data";
import { brandName, tagline } from "@/lib/site-config";

function BrandWordmark({ footer = false }: { footer?: boolean }) {
  return <Link aria-label={`${brandName} home`} className={`brand${footer ? " footer-brand" : ""}`} href="/"><span className="brand-prefix">My House Is</span>{" "}<span className="brand-question">Doing What?</span></Link>;
}

export function Header() {
  return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header">
    <BrandWordmark/>
    <nav aria-label="Primary navigation"><Link href="/find-a-problem/">Find a problem</Link><Link href="/hvac/">HVAC</Link><Link href="/plumbing/">Plumbing</Link><Link href="/electrical/">Electrical</Link><Link href="/appliances/">Appliances</Link><Link href="/search/">Search</Link></nav>
  </header></>;
}

export function Footer() {
  return <footer className="footer"><div className="footer-grid"><div><BrandWordmark footer/><p>{tagline}</p></div><div><h2>Explore</h2><Link href="/find-a-problem/">Problem Finder</Link><Link href="/search/">Search guides</Link><Link href="/sitemap.xml">Sitemap</Link></div><div><h2>Categories</h2>{publishedCategories().slice(0, 5).map((category) => <Link key={category.slug} href={`/${category.slug}/`} data-analytics-event="category_click" data-category={category.slug}>{category.name}</Link>)}</div><div><h2>About</h2><Link href="/about/">About</Link><Link href="/editorial-policy/">Editorial policy</Link><Link href="/contact/">Contact</Link><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms & disclaimer</Link></div></div><p className="fine-print">© {new Date().getFullYear()} {brandName}. General information only; not a substitute for professional evaluation.</p></footer>;
}

export function SiteShell({ children }: { children: React.ReactNode }) { return <><Header/><main id="main">{children}</main><Footer/></>; }
