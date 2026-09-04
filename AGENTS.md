# My House Is Doing What? operating manual

## Purpose and business model

My House Is Doing What? is a symptom-driven homeowner troubleshooting and reference library. Its permanent tagline is “Answers for the weird things your home does.” Its durable loop is organic search discovery → immediate useful answer → related guides/tools → deeper session → display-ad revenue. Display advertising is the primary monetization model, and organic search is the primary acquisition channel. Helpfulness, accuracy, speed, and trust come before ad density. Strategic—not guaranteed—targets are 2,000+ high-quality pages, primarily US informational traffic, and 1,000,000+ monthly organic pageviews.

## Audience and voice

Write for homeowners describing observable symptoms without specialist vocabulary. Be calm, practical, clear, non-alarmist, and explicit about uncertainty. The brand may acknowledge that houses behave in confusing ways, but troubleshooting remains serious and credible. Never use clickbait, fake urgency, fake personal experience, fake statistics, invented quotes, credentials, reviews, ratings, or staff. The production brand is **My House Is Doing What?** and the production domain is **myhouseisdoingwhat.com**.

## Architecture

- Vinext/React static export deployed to GitHub Pages by GitHub Actions. The deployable artifact is `dist/client/`, never the repository root.
- No database or runtime API is required. Published content lives in `content/articles.json` and renders through `app/[category]/[slug]/page.tsx`.
- Category and informational pages share `app/[category]/page.tsx`; symptom hubs use `app/symptoms/[symptom]/page.tsx`.
- Client JavaScript is limited to `components/ProblemFinder.tsx` and `components/SiteSearch.tsx`.
- Finder/search matching belongs in dependency-free `lib/discovery.mjs`; taxonomy configuration belongs in `content/taxonomy.json`; production identity belongs in `site.config.json`. Keep these rules centralized and testable instead of scattering them through UI components.
- `app/sitemap.ts` and `app/robots.ts` define crawl-control behavior; `scripts/prepare-pages-export.mjs` emits their static files for GitHub Pages. `lib/site-data.ts` is the registry access layer.
- `.openai/hosting.json` configures Sites. No D1 or R2 is currently needed.
- `.github/workflows/deploy-pages.yml` is the GitHub Pages deployment authority. Repository Pages source must be **GitHub Actions**.
- `site.config.json` is the production source of truth for brand, tagline, origin, base path, and custom domain. Optional `NEXT_PUBLIC_SITE_ORIGIN` and `NEXT_PUBLIC_BASE_PATH` variables may override URL values for non-production previews.
- Internal navigation uses `SiteLink` so static Pages navigation receives the public base path and uses full document requests. Do not reintroduce bare root-relative anchors or `next/link` without verifying static-host behavior.
- Production uses the custom-domain root (`basePath: ""`). Vinext 1.0.0-beta.2 cannot prerender these dynamic App Router routes when framework `basePath` is enabled; preserve the optional `assetPrefix`/post-export compatibility path for repository-path previews unless a verified Vinext upgrade removes the limitation.
- Detailed procedures and the automated/manual coverage boundary live in `docs/QA.md`; Finder rules live in `docs/PROBLEM_FINDER.md`. This file remains the mandatory rule layer.

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

Each registry record supports: `title`, `slug`, `description`, `primary_category`, `secondary_categories`, `symptoms`, `room_or_location`, `system`, `content_type`, `published_date`, `updated_date`, nullable `reviewed_date`, `author`, `reading_time`, `related_articles`, `featured_status`, `search_keywords`, `target_search_intent`, `direct_answer`, `likely_causes`, `safe_checks`, `professional_help`, and an optional original `image` record with source, dimensions, alt text, caption, visual type, and placement. The registry is authoritative; do not duplicate metadata in components.

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
3. Classify the proposal as a new intent, supporting subtopic, overlap requiring explicit differentiation, or duplicate requiring consolidation/update.
4. Prefer updating/expanding the existing canonical page when wording differs but user intent does not.
5. Document a truly new topic in the backlog before publication and evaluate both inbound and outbound internal-link opportunities; add only links that are genuinely useful.

Near-duplicate SEO pages and thin programmatic combinations are prohibited.

## Article-reality preflight (mandatory)

Before drafting any new article, verify from authoritative, manufacturer, utility, code, safety, or otherwise reliable sources that the described symptom is a real and meaningful residential problem. Confirm that it can occur in the system named, identify at least one credible physical or operational mechanism, verify that the homeowner framing is technically accurate, and check whether an existing canonical article already represents the problem better.

Do not publish an invented, contrived, technically implausible, misleading, materially distorted, unsupported, or merely keyword-shaped premise. Search opportunity never overrides factual reality. If the premise fails this gate, stop publication, document what is inaccurate, and recommend a technically valid reframing when one exists.

## Audit-derived permanent guardrails

These mandatory rules derive from the deployed 2026-08-25 site audit. Preserve them unless later evidence supports a documented policy change; never remove a guardrail merely to make a content or feature change pass.

### Problem Finder and search

- After location selection, show only contextually relevant symptom choices. Yard must not expose toilet, dryer, outlet, or unrelated indoor choices; Bathroom favors plumbing/moisture; Attic favors moisture/insulation/pest/HVAC; Whole House may use broad system choices.
- A normal Finder result must match both the selected location context and symptom. A nonmatching suggestion is allowed only in an explicit fallback state and must not be presented as an ordinary match.
- Return approximately three to six strong results when available, never a long generic list. Rank by location, symptom, system, secondary clue, safety relevance, then editorial priority. Editorial boosts may not bypass location/symptom compatibility.
- Finder language must communicate uncertainty: “Start here,” “Possible match,” or equivalent. Never diagnose, claim certainty, or invent a cause.
- Every configured path must return valid published content or an honest recovery state. Never fabricate an article URL, return irrelevant pages to avoid an empty result, or leave a blank panel. Preserve reset/back-to-start behavior, labels, selection state, and live-result announcements.
- Keep the default flow within two to four meaningful selections. Any added step must materially improve relevance. Follow `docs/PROBLEM_FINDER.md` and extend its tests when behavior changes.
- Search priority is exact/near title and target-query match, meaningful multi-term coverage, symptom, category/system, aliases, then conservative typo tolerance. A generic shared token is insufficient; `yard standing water` must not surface an unrelated indoor-water guide. Zero results must offer Finder and browsing recovery.

### Internal discovery and taxonomy

- Every published article must have at least one crawlable inbound link from another indexable page and remain within roughly two to four meaningful homepage clicks. Do not solve crawl depth with giant global link lists.
- Every article must link to its parent hub and provide useful next actions through contextually appropriate related content, symptom/system discovery, the Finder, or search. Do not force an unrelated related-article card when no close page exists.
- When a new article extends a cluster, evaluate reciprocal contextual links from existing pages. Use descriptive natural anchors; prohibit “click here,” “read more,” and repeated exact-match anchors used mechanically.
- Related slugs and all internal article URLs must resolve to published registry records/static routes. Never link live UI to backlog-only content.
- A category or symptom hub may be generated, navigated to, or listed in the sitemap only when registry data supplies substantive published content. Empty classifications may remain in taxonomy/backlog planning, but inactive routes use the custom 404. Hub eligibility must stay registry-driven so content can activate a hub without a manually duplicated page.
- Canonical taxonomy values are lowercase kebab-case and come from the registry plus `content/taxonomy.json`. Normalize aliases in discovery logic; do not fragment canonical metadata into near-synonyms.

### SEO and structured data

- Every indexable route requires a unique title, H1, meta description, and canonical on `https://myhouseisdoingwhat.com`, plus sitemap inclusion and crawlable internal paths. Search and 404 remain `noindex,follow`; the 404 must not emit a canonical.
- Rendered production metadata, structured data, sitemap, and robots must not contain Housewise branding, `github.io`, `chatgpt.site`, repository base paths, or any temporary canonical host.
- Sitemap URLs must exactly match rendered indexable canonicals, contain no duplicates or noindex routes, exclude empty hubs, and use `lastmod` only when supported by actual registry dates. Never fabricate a build-date modification signal.
- Emit WebSite and Organization site identity on the homepage. Article pages emit page-specific Article and BreadcrumbList data that matches visible content. Do not restore sitelinks SearchAction without documented current search-engine evidence.
- Never fabricate ratings, reviews, authors, reviewers, credentials, organizations, or dates in visible content or schema.

### Editorial, safety, trust, and visual review

- Publish a keyword variant only when its expected answer/search intent is meaningfully different. The HVAC humidity, vent-sweating, vent-dripping, attic-duct-sweating, and indoor-air-handler-water topics may coexist only while each answers a distinct observation. A future “AC not removing humidity” page requires explicit differentiation from the house-humidity guide; a generic toilet-gurgling page requires comparison with the washer-drain bubbling guide. Keep evolving examples in `docs/CONTENT_STRATEGY.md`.
- Every substantive article answers near the top, explains uncertainty, avoids filler/keyword stuffing/fake experience/fake statistics, verifies material claims, preserves safety boundaries, and links to useful supporting content.
- Urgent smoke/fire, gas, carbon monoxide, sewage, structural movement, water/electricity, roofing, refrigerant, attic, and crawlspace hazards must not be buried by ordinary discovery copy. Give proportionate stop/escalation language without false reassurance or melodrama; never normalize unsafe DIY work.
- Preserve visible Editorial Policy links, sourcing/review transparency, visual verification, and the statement that external expert review is not claimed when it did not occur. Never invent trust signals.
- Visual factual quality, article accuracy, nuanced safety, intent differentiation, tone, and real device behavior remain mandatory manual reviews. Tests may verify prerequisites, never claim to prove those judgments.

### Interaction, layout, and code stability

- Preserve keyboard operation, visible focus, labels, live regions for dynamic results, at least 44px primary controls, useful alt text, readable contrast, and reduced-motion behavior. Disabled states must remain understandable.
- For layout-affecting changes, check 320, 375, 390, 430, 768, 1024, 1150, 1280, and 1440px. Preserve document/hero horizontal containment, table/image containment, clean heading/breadcrumb wrapping, usable forms, header fit, and the article rail’s 1150px collapse. Do not reintroduce the former 1024px article overflow gap.
- Real iOS rubber-band behavior requires a trusted rendered browser/device check. Static CSS assertions are partial protection only; report unavailable runtime coverage honestly.
- Keep publishing registry-driven, production configuration centralized, and Finder/search logic pure and testable. Avoid broad refactors during ordinary article work and do not add a dependency for trivial UI behavior.

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

## Additional SEO operations

Do not add FAQ schema by default. Add any future Search Console verification token in `app/layout.tsx` under `metadata.verification.google`; verification must not change canonical or indexing behavior.

## Accessibility

Use semantic HTML, explicit form labels, keyboard-operable controls, a skip link, visible `:focus-visible`, at least 44px touch targets for primary controls, meaningful link text, adequate contrast, alt text for informative images, and empty alt text for decorative images. Respect reduced motion. Expandable controls must expose state with `aria-expanded` and associate controlled regions.

## Article visuals and visual accuracy

Every substantive troubleshooting or reference article should contain at least one useful original visual when an accurate visual can materially improve understanding. Its purpose must be to clarify the symptom, explain a physical mechanism, show relevant component relationships, distinguish similar problems, improve comprehension, or provide genuinely useful original media. Never add an image merely to satisfy a quota. If an accurate and useful visual cannot be produced confidently, publishing without an image is preferable to publishing a misleading one; document the exception in the publication notes or relevant backlog.

Visual accuracy is mandatory. No article image may communicate a mechanical, electrical, plumbing, HVAC, structural, roofing, appliance, moisture, pest, or other home-system relationship that is known to be inaccurate or materially misleading. Before acceptance, compare the visual with the article's verified factual explanation and authoritative references where appropriate. An image must not invent components or impossible connections; reverse airflow, water flow, condensate, or refrigerant paths; misrepresent electrical relationships; imply that one visible condition proves a diagnosis; normalize unsafe homeowner work or an obviously unsafe/code-violating installation; mislabel parts; exaggerate damage; place water, mold, electricity, gas, structural damage, pests, or another hazard inconsistently with the explanation; contradict the article; or create false diagnostic certainty. Describe and caption a conceptual illustration as conceptual rather than as a literal equipment schematic.

For every future article visual:

1. Identify the exact concept it must communicate.
2. Classify it as documentary/representational, conceptual, or diagrammatic.
3. Compare it with the article's verified technical claims.
4. Check component relationships, directions, and labels.
5. Remove unnecessary detail that creates opportunities for inaccuracy.
6. Confirm it does not imply diagnostic certainty.
7. Confirm the alt text describes what the image actually shows.
8. Confirm the surrounding text makes no claim unsupported by the visual.
9. Prefer a simpler accurate visual to a complicated questionable one.
10. Record important limitations when appropriate.

Article visuals should be original, high resolution, clean, professional, editorial rather than advertisement-like, consistent with the cream/green brand system, useful on desktop and mobile, free from unnecessary embedded text, watermarks, and stock-photo clichés, and appropriately compressed for the web. Avoid generic confused homeowners, random technicians, suburban houses, wrench poses, and meaningless equipment close-ups unless they materially improve the explanation. Use explicit dimensions, responsive sizing, modern formats where supported, lazy loading below the fold, a descriptive filename, factual alt text, and a concise caption. Accuracy always outranks aesthetics.

## Performance budget

- Static-first HTML; no general UI framework beyond the existing React renderer.
- Target initial route JS under 90 KB gzip; article pages should ship no custom client JavaScript. The 2026-08-25 homepage baseline is approximately 111 KB gzip, so `verify:export` uses a temporary 120 KB regression ceiling. Do not increase that ceiling casually; reduce it after verified bundle improvements.
- Target total above-fold transfer under 500 KB and LCP image under 200 KB when imagery is introduced.
- No layout-dependent ad slot without reserved dimensions. No third-party scripts before explicit approval.
- Use responsive dimensions, modern formats, lazy loading below the fold, and avoid render-blocking fonts. Current typography uses system fonts.
- Target Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile.
- The current 1.96 MB `og.png` is a documented maintenance item and may not grow past the 2 MB regression ceiling. New or replacement social images should normally target 500 KB or less without visible quality loss; document any justified exception.

## Mobile and design system

For layout-affecting work, use the viewport set and manual procedure in the audit-derived rules and `docs/QA.md`. Confirm no overflow; navigation, search, finder, cards, headings, article measure, focus, tables, images, and footer remain usable. Tokens live in `app/globals.css`: off-white paper, charcoal ink, forest green primary, sage surfaces, amber caution, 18px card radius, restrained shadow, and 1180px maximum shell. Avoid gradients, giant heroes, fake social proof, and decorative excess.

## Analytics and ads

Tracking is intentionally absent. Preserve privacy-safe event contracts for `problem_finder_started`, `problem_finder_step`, `problem_finder_completed`, `problem_finder_result_click`, `site_search`, `search_result_click`, `related_article_click`, `category_click`, `article_depth_50`, and `article_depth_90`; depth events remain reserved until instrumentation is selected. Finder events may include selected canonical location/symptom and result slugs shown/clicked, but never free-form personal information. Any vendor requires consent review where applicable, minimal collection, documented retention, and documented vendor IDs. Disabled/dimensioned `.ad-slot` elements are layout seams only: do not activate ads without network approval, privacy updates, and CLS/readability/safety-placement testing. Content and navigation must work without ads.

## Git workflow

- Start from a clean understanding of `git status`; preserve unrelated user changes.
- Use focused commits such as `feat: add problem finder framework` or `docs: expand editorial safeguards`.
- Never rewrite shared history or use destructive reset/checkout to discard user work.
- Run the full verification suite before committing. Do not commit secrets, build output, caches, or local Wrangler state.
- Push deployment changes to `origin main`; confirm the Pages workflow exists remotely and that GitHub Pages uses the GitHub Actions source.
- Never rename the GitHub repository merely to match the public brand. Keep canonicals on `https://myhouseisdoingwhat.com`, and generate the Pages `CNAME` from `site.config.json`.

## Pre-publish checklist

- Duplicate-intent classification completed against registry, backlog, queries, and cluster pages; one canonical record/backlog status updated.
- Direct answer, uncertainty, factual sources, safe checks, stop conditions, dates, metadata, canonical, H1, and review disclosure are complete.
- Parent hub, relevant outbound links, reciprocal/inbound-link opportunities, search metadata, and Finder mapping/fallback were evaluated; no backlog-only link is live.
- Visual usefulness, factual accuracy, alt/caption/dimensions/format/size, or documented accuracy-first no-image exception reviewed.
- Registry/taxonomy/backlog and expected sitemap route are aligned.
- Required responsive containment/accessibility/safety review completed under `docs/QA.md`.
- `npm run lint`, `npm test`, `npm run build`, and `npm run verify:export` pass. Inspect the actual `dist/client` article, hub, 404, assets, sitemap, and robots—not source alone.

## Post-publish checklist

- Confirm GitHub Actions/Pages succeeded and the production URL returns HTTP 200.
- Confirm production canonical, indexability, sitemap entry, structured data, intended hub, search result, and Finder behavior.
- Confirm planned reciprocal/contextual links are live, the working tree is clean, and `origin/main` contains the commit.
- Request indexing only when appropriate; then inspect Search Console after discovery without creating thin keyword variants from isolated impressions.

## Modifying pages and taxonomies

For existing pages, preserve intent and URL; make substantive improvements, update the registry date, and retest related links. Create a category only when it can support a coherent cluster—not to hold one orphan page. Add it to `content/taxonomy.json`, navigation selectively, finder/search metadata, docs, and internal links; registry-driven route and sitemap generation must pick it up without a duplicate page. Never automatically publish the backlog or generate every taxonomy combination.
