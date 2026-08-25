# SEO foundation

The root layout defines site-wide title behavior, metadata base, WebSite and Organization schema, favicon, and the generated social card. Independently shareable routes override title, description, Open Graph, and X metadata; article routes explicitly clear inherited images because they do not yet have record-specific primary images.

Article pages emit Article and BreadcrumbList JSON-LD. Category and symptom pages are indexable. Search is `noindex,follow`. `app/sitemap.ts` lists canonical indexable routes; `app/robots.ts` points crawlers to it. Do not add FAQ schema unless current search-engine rules and actual page content make it appropriate.

For the current project Pages deployment, canonical and structured-data URLs use `https://gageg123-de.github.io/housewise/`. `NEXT_PUBLIC_SITE_ORIGIN` and `NEXT_PUBLIC_BASE_PATH` in the Pages workflow are the deployment configuration points; `lib/site-config.ts` composes them without duplicating the repository path. The static sitemap uses the same configuration and is emitted at `dist/client/sitemap.xml`; robots points to `https://gageg123-de.github.io/housewise/sitemap.xml` and disallows only the base-prefixed search route.

When attaching a custom domain, update the workflow origin, clear the base path, configure the GitHub Pages custom domain, rebuild, and verify every canonical/Open Graph/JSON-LD/sitemap URL before submitting the new sitemap. Add the Google verification token to `metadata.verification.google` in `app/layout.tsx`.
