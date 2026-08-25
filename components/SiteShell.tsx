import { SiteLink as Link } from "@/components/SiteLink";
import { categories } from "@/lib/site-data";

export function Header() {
  return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header">
    <Link className="brand" href="/">Housewise <span>Guide</span></Link>
    <nav aria-label="Primary navigation"><Link href="/find-a-problem/">Find a problem</Link><Link href="/hvac/">HVAC</Link><Link href="/plumbing/">Plumbing</Link><Link href="/electrical/">Electrical</Link><Link href="/appliances/">Appliances</Link><Link href="/search/">Search</Link></nav>
  </header></>;
}

export function Footer() {
  return <footer className="footer"><div className="footer-grid"><div><Link className="brand footer-brand" href="/">Housewise <span>Guide</span></Link><p>Calm, practical help for understanding what your home is telling you.</p></div><div><h2>Explore</h2><Link href="/find-a-problem/">Problem Finder</Link><Link href="/search/">Search guides</Link><Link href="/sitemap.xml">Sitemap</Link></div><div><h2>Categories</h2>{categories.slice(0, 5).map((category) => <Link key={category.slug} href={`/${category.slug}/`}>{category.name}</Link>)}</div><div><h2>About</h2><Link href="/about/">About</Link><Link href="/editorial-policy/">Editorial policy</Link><Link href="/contact/">Contact</Link><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms & disclaimer</Link></div></div><p className="fine-print">© {new Date().getFullYear()} Housewise Guide. General information only; not a substitute for professional evaluation.</p></footer>;
}

export function SiteShell({ children }: { children: React.ReactNode }) { return <><Header/><main id="main">{children}</main><Footer/></>; }
