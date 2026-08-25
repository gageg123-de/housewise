# SEO foundation

The root layout defines site-wide title behavior, metadata base, WebSite and Organization schema, favicon, and the generated social card. Independently shareable routes override title, description, Open Graph, and X metadata; article routes explicitly clear inherited images because they do not yet have record-specific primary images.

Article pages emit Article and BreadcrumbList JSON-LD. Category and symptom pages are indexable. Search is `noindex,follow`. `app/sitemap.ts` lists canonical indexable routes; `app/robots.ts` points crawlers to it. Do not add FAQ schema unless current search-engine rules and actual page content make it appropriate.

Before launch, replace the temporary domain in `lib/site-data.ts`. Add the Google verification token to `metadata.verification.google` in `app/layout.tsx`, deploy, submit `/sitemap.xml`, and inspect rendered canonicals and structured data at the final host.
