# Housewise Guide operating manual

## Purpose and business model

Housewise Guide is a content-first homeowner problem-solving reference. Its durable loop is search discovery → immediate useful answer → related guides/tools → deeper session → display-ad revenue. Helpfulness, accuracy, speed, and trust come before ad density. Strategic—not guaranteed—targets are 2,000+ high-quality pages, primarily US informational traffic, and 1,000,000+ monthly organic pageviews.

## Audience and voice

Write for homeowners describing observable symptoms without specialist vocabulary. Be calm, practical, clear, non-alarmist, and explicit about uncertainty. Never use clickbait, fake urgency, fake personal experience, fake statistics, invented quotes, credentials, reviews, ratings, or staff. The working brand, domain, palette, and mark are temporary and must remain easy to replace.

## Architecture

- Vinext/React static export deployed to GitHub Pages by GitHub Actions. The deployable artifact is `dist/client/`, never the repository root.
- No database or runtime API is required. Published content lives in `content/articles.json` and renders through `app/[category]/[slug]/page.tsx`.
- Category and informational pages share `app/[category]/page.tsx`; symptom hubs use `app/symptoms/[symptom]/page.tsx`.
- Client JavaScript is limited to `components/ProblemFinder.tsx` and `components/SiteSearch.tsx`.
- `app/sitemap.ts` and `app/robots.ts` define crawl-control behavior; `scripts/prepare-pages-export.mjs` emits their static files for GitHub Pages. `lib/site-data.ts` is the registry access layer.
- `.openai/hosting.json` configures Sites. No D1 or R2 is currently needed.
- `.github/workflows/deploy-pages.yml` is the GitHub Pages deployment authority. Repository Pages source must be **GitHub Actions**.
- `NEXT_PUBLIC_SITE_ORIGIN` and `NEXT_PUBLIC_BASE_PATH` define deployment URLs. `lib/site-config.ts` centralizes URL composition.
- Internal navigation uses `SiteLink` so static Pages navigation receives the public base path and uses full document requests. Do not reintroduce bare root-relative anchors or `next/link` without verifying static-host behavior.
- Vinext 1.0.0-beta.2 cannot prerender these dynamic App Router routes when framework `basePath` is enabled. Keep framework `basePath` unset, use `assetPrefix`, and preserve the post-export route/asset preparation step unless a verified Vinext upgrade removes the limitation.

## Folder map

```text
app/                 routes, metadata, global CSS, sitemap, robots, 404
components/          reusable shell, guide cards, finder, search
content/             published registry and unpublished topic backlog
docs/                architecture, content, SEO, monetization, roadmap
lib/                 typed registry and taxonomy helpers
public/              favicon and social image
scripts/             Pages post-export and artifact verification
tests/               build/render and content-integrity checks
.github/workflows/   GitHub Pages build and deployment
.openai/              Sites hosting declaration
```

## Content schema

Each registry record supports: `title`, `slug`, `description`, `primary_category`, `secondary_categories`, `symptoms`, `room_or_location`, `system`, `content_type`, `published_date`, `updated_date`, nullable `reviewed_date`, `author`, `reading_time`, `related_articles`, `featured_status`, `search_keywords`, `target_search_intent`, `direct_answer`, `likely_causes`, `safe_checks`, and `professional_help`. The registry is authoritative; do not duplicate metadata in components.

Allowed content types: symptom guide, comparison/explanation guide, diagnostic guide, maintenance guide, safety/reference guide, and interactive tool. Template sections are guidance, not mandatory identical phrasing.

## URL rules

- Use lowercase kebab-case and a short system-first path: `/plumbing/toilet-bubbles-when-washer-drains/`.
- Never use dates, `blog`, `article`, IDs, version labels, or keyword-stuffed paths.
- Preserve published URLs. Add redirects if a change is unavoidable.
- One canonical indexable page per search intent. Taxonomy hubs link to the canonical article; never create duplicate system × symptom pages.
- Source code uses logical paths such as `/hvac/`; `SiteLink`/`routePath` adds the configured deployment base exactly once.

## Duplicate-topic process (mandatory)

Before drafting any article:

1. Search titles, slugs, keywords, target intent, and related pages in `content/articles.json`.
2. Search `content/topics.csv` and inspect the relevant category and symptom hubs.
3. Classify the proposal as a new intent, supporting subtopic, duplicate, or update to an existing guide.
4. Prefer updating/expanding the existing canonical page when wording differs but user intent does not.
5. Document a truly new topic in the backlog before publication and connect at least two relevant internal pathways.

Near-duplicate SEO pages and thin programmatic combinations are prohibited.

## Editorial quality

- Answer the query directly near the top; no autobiographical lead, filler, or forced table of contents.
- Explain the reasoning that distinguishes causes. Use conditional language when several causes are plausible.
- Offer safe observations, not procedures that expose hazardous systems.
- Verify material factual claims with primary/authoritative sources when accuracy matters; keep a Sources section when sources materially support the guide.
- Do not copy competitor structure blindly, stuff keywords, or mass-generate thin pages.
- Update `updated_date`, related links, search keywords, sitemap behavior, and backlog status together.
- Do not claim expert review unless a real named reviewer performed it and their identity/credentials are verified. `reviewed_date` stays `null` otherwise.

## Safety standards

Use reusable callout states: information, caution, and stop/professional evaluation. Never encourage work on live electricity, gas, refrigerants, roofs, structural components, active mold/sewage, high-temperature equipment, or pressurized plumbing. Give a calm stop condition, the immediate safe action, and the appropriate kind of help. Emergency language is reserved for actual immediate hazards.

## SEO and internal linking

- Every indexable page needs a unique title, description, canonical, one H1, semantic heading order, and useful anchor text.
- Article pages require Article and BreadcrumbList JSON-LD. Site-wide pages use WebSite and Organization. Do not add FAQ schema by default.
- Every article links to its parent category and, when available, close problems, broader context, and the Problem Finder/search pathway.
- Related links must be editorially meaningful, not circular decoration. Validate referenced slugs.
- Search-result pages are `noindex,follow`; category and symptom hubs are indexable.
- Add a future Search Console token in `app/layout.tsx` under `metadata.verification.google`.

## Accessibility

Use semantic HTML, explicit form labels, keyboard-operable controls, a skip link, visible `:focus-visible`, at least 44px touch targets for primary controls, meaningful link text, adequate contrast, alt text for informative images, and empty alt text for decorative images. Respect reduced motion. Expandable controls must expose state with `aria-expanded` and associate controlled regions.

## Performance budget

- Static-first HTML; no general UI framework beyond the existing React renderer.
- Target initial route JS under 90 KB gzip; article pages should ship no custom client JavaScript.
- Target total above-fold transfer under 500 KB and LCP image under 200 KB when imagery is introduced.
- No layout-dependent ad slot without reserved dimensions. No third-party scripts before explicit approval.
- Use responsive dimensions, modern formats, lazy loading below the fold, and avoid render-blocking fonts. Current typography uses system fonts.
- Target Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile.

## Mobile and design system

Test 320, 375, 390, 430, 768, 1024, and 1440px. Confirm no overflow; navigation, search, finder, cards, headings, article measure, focus, and tables remain usable. Tokens live in `app/globals.css`: off-white paper, charcoal ink, forest green primary, sage surfaces, amber caution, 18px card radius, restrained shadow, and 1180px maximum shell. Avoid gradients, giant heroes, fake social proof, and decorative excess.

## Analytics and ads

Tracking is intentionally absent. Future hooks: `problem_finder_started`, `problem_finder_completed`, `site_search`, `related_article_click`, `category_click`, `article_depth_50`, and `article_depth_90`. Add consent-aware analytics in the root layout or a narrowly scoped analytics component and document vendor IDs. Disabled `.ad-slot` elements reserve optional desktop space; enable only after network approval, privacy updates, and CLS testing. Content must work without ads.

## Git workflow

- Start from a clean understanding of `git status`; preserve unrelated user changes.
- Use focused commits such as `feat: add problem finder framework` or `docs: expand editorial safeguards`.
- Never rewrite shared history or use destructive reset/checkout to discard user work.
- Run the full verification suite before committing. Do not commit secrets, build output, caches, or local Wrangler state.
- Push deployment changes to `origin main`; confirm the Pages workflow exists remotely and that GitHub Pages uses the GitHub Actions source.

## Pre-publish checklist

- Duplicate-intent audit completed; record added once; backlog status updated.
- Direct answer, uncertainty, safe checks, stop conditions, metadata, canonical, H1, dates, and links reviewed.
- Category/symptom paths and at least two relevant internal links present.
- Claims sourced where needed; no fabricated review/author credentials.
- `npm run lint`, `npm test`, `npm run build`, and `npm run verify:export` pass. Inspect `dist/client/index.html`, `404.html`, representative category/article directories, assets, sitemap, and robots directly.

## Post-publish checklist

- Confirm final URL, canonical, sitemap inclusion, indexability, and rendered structured data.
- Inspect Search Console after discovery; record impressions/query patterns without creating keyword variants.
- Revisit pages with misleading snippets, poor engagement, dated information, or missing related paths.

## Modifying pages and taxonomies

For existing pages, preserve intent and URL; make substantive improvements, update the registry date, and retest related links. Create a category only when it can support a coherent cluster—not to hold one orphan page. Add it to `categories`, navigation selectively, sitemap generation, finder/search metadata, docs, and internal links. Never automatically publish the backlog or generate every taxonomy combination.
