# SEO foundation

The root layout defines site-wide title behavior, metadata base, WebSite and Organization schema, favicon, and the generated social card. Independently shareable routes override title, description, Open Graph, and X metadata; article routes explicitly clear inherited images because they do not yet have record-specific primary images.

Article pages emit Article and BreadcrumbList JSON-LD. Category and symptom pages are indexable. Search is `noindex,follow`. `app/sitemap.ts` lists canonical indexable routes; `app/robots.ts` points crawlers to it. Do not add FAQ schema unless current search-engine rules and actual page content make it appropriate.

Production canonical and structured-data URLs use `https://myhouseisdoingwhat.com/`. `site.config.json` is the deployment identity source; `lib/site-config.ts` composes root-based URLs without a repository prefix. The static sitemap uses the same configuration and is emitted at `dist/client/sitemap.xml`; robots points to `https://myhouseisdoingwhat.com/sitemap.xml` and disallows only `/search/`.

The GitHub Pages infrastructure URL must never appear as a canonical. GitHub redirects that URL after the custom domain is accepted, while production metadata consistently identifies the custom domain. After DNS and Pages configuration, verify every canonical/Open Graph/JSON-LD/sitemap URL and submit `https://myhouseisdoingwhat.com/sitemap.xml` in Search Console. Add the Google verification token to `metadata.verification.google` in `app/layout.tsx`.
