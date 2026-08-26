# Site-wide audit — 2026-08-25

Scope: static export, registry and backlog, public routes, metadata, schema, sitemap/robots, crawl paths, Problem Finder, search, navigation, trust pages, safety, accessibility, assets, performance, and deployment controls. Findings are classified by likely user/search impact, not visual preference.

## Implemented findings

### High

- **Problem Finder choices were global rather than contextual.** A Yard selection could expose toilet, outlet, or dryer symptoms. Location-specific choices now share one normalized taxonomy, and strict compatible location + symptom matching prevents unrelated results.
- **Finder ranking and empty states were unreliable.** Registry order and exact array filtering could produce weak or empty journeys. Weighted matching now prioritizes exact location and symptom, then system, secondary clues, safety relevance, and editorial priority. Results are capped at six, explain their relationship, and fall back honestly to search rather than inventing a diagnosis or URL.
- **Eight empty category hubs and several empty symptom hubs were indexable.** Empty hubs are no longer generated, linked, or included in the sitemap. Unknown or empty taxonomy routes use the noindex custom 404.
- **Search could reward a weak partial match.** Search now weights title/primary query, requires meaningful multi-term coverage, supports homeowner-language aliases and a conservative one-character typo tolerance, and supplies recovery actions when no guide fits.
- **Article endings could become dead ends.** Every article now offers its parent system, the Problem Finder, and search after related guides.
- **Schema was repeated site-wide and included retired sitelinks-search markup.** WebSite and Organization schema now appear only on the homepage; SearchAction was removed. Article and breadcrumb schema remain page-specific.

### Medium

- **Homepage recency language overstated review status.** “Freshly reviewed guides” became “Recently updated guides” and is ordered by registry update date.
- **Sitemap timestamps implied verification that did not occur.** Non-article routes no longer receive a fabricated build-date `lastmod`; verified article dates remain.
- **Hub symptom navigation used inactive taxonomy values.** Each hub now exposes only symptoms used by its published guides.
- **404 metadata inherited the homepage identity.** The 404 now has a unique title and description, is noindex/follow, and emits no canonical.
- **Editorial-process transparency was incomplete.** The policy now distinguishes research from external expert review, explains source preference and visual verification, and the article byline/footer links to that policy.
- **Interactive controls lacked complete future analytics distinctions.** Privacy-safe data hooks now distinguish finder steps/results and search/related/category clicks without installing analytics or collecting free-form input.
- **Focus/touch details were inconsistent.** Select focus treatment, disabled-state styling, result announcements, and minimum control heights were tightened without changing the visual system or horizontal-overscroll containment.

## Content and taxonomy review

- The HVAC moisture cluster is coherent: the broad indoor-humidity guide, vent-surface sweating guide, and active-dripping guide answer different observable intents and link reciprocally.
- A future “AC not removing humidity” page would substantially overlap the current house-humidity guide unless it is reserved for deeper equipment-performance intent.
- “Why Does My Toilet Bubble When the Washer Drains?” is distinct from a broad spontaneous toilet-gurgling topic, but any future gurgling article needs a duplicate-intent preflight.
- Water around an indoor air handler is distinct from water at a supply vent; roof-stain and rain-leak topics are adjacent but can remain distinct when one is symptom-led and the other source-led.
- Empty systems remain valid backlog classifications but are intentionally absent from public navigation until at least one substantive guide is published.

No published article is orphaned in the exported site. All published records have a parent hub and at least one crawlable inbound path. The single laundry article does not have a same-category peer, so its next-step block supplies hub/finder/search recovery without a forced unrelated card.

## Problem Finder test matrix

| Location | Representative observations checked | Current behavior / content gap |
| --- | --- | --- |
| Yard | standing water/drainage, leak, pest, smell | Only yard/exterior choices appear. No published exact match currently; honest search/start-over recovery is shown. |
| Bathroom | leak, smell, noise, drainage | Plumbing/moisture choices only; drainage ranks the washer/toilet bubbling guide first. |
| Kitchen | appliance, leak, smell, electrical | Kitchen-relevant choices only. Sparse published coverage uses the recovery state rather than unrelated results. |
| Attic | moisture, heat, pest, insulation-related comfort | Attic/HVAC/roofing choices only; moisture ranks the closest HVAC condensation guide while clearly labeling it as a possible match. |
| Whole house | humidity, electrical, smell, temperature | Broad system-level choices only; humidity ranks the house-humidity guide first. |

Every configured location/symptom branch is exercised automatically. Returned guides must pass both the branch's location and symptom compatibility rules; zero-match branches render the documented fallback. Every currently published guide is reachable through at least one valid branch.

## Trust, safety, performance, and images

- The site does not claim external expert review. Dates, source lists, author name, editorial method, limitations, and escalation guidance are visible.
- Finder emergency language surfaces smoke/fire, gas, carbon monoxide, sewage, structural movement, and water/electricity combinations before ordinary matching.
- The static-first design, system fonts, no third-party scripts, reserved inactive ad slot, and existing explicit visual dimensions keep CLS and interaction risks low. The AGENTS.md budget remains: initial route JS under 90 KB gzip, above-fold transfer under 500 KB, LCP images under 200 KB, and CWV targets of LCP 2.5 s, INP 200 ms, CLS 0.1 at p75.
- The humidity article's original 1536×1024 WebP is 173,032 bytes, below the image budget, with intrinsic dimensions, descriptive alt text, a conceptual caption, and lazy loading. The 1.96 MB PNG social card is not an in-page LCP asset but is an optimization opportunity.
- Nine earlier articles intentionally remain without visuals under the documented accuracy-first exception/backlog. No inaccurate visual was retained merely to meet a quota.

## Deferred recommendations

- **High, needs owner input:** replace the Contact page's “no public contact channel” notice with a real monitored address or form after a destination and privacy process are chosen.
- **High, editorial work:** deepen the seven short starter guides with source-backed, intent-specific explanations. Do this article by article; do not bulk-generate filler.
- **Medium:** produce and fact-check useful original visuals for the nine pre-standard guides where a diagram materially clarifies the problem.
- **Medium:** add consent-aware analytics only after choosing a vendor and retention policy; instrument the existing data hooks plus 50%/90% article depth.
- **Medium:** optimize or replace the 1.96 MB social card and confirm visual quality across major sharing crawlers.
- **Low:** remove unused example database/worker scaffolding and dependencies only after confirming they are not needed by the retained Sites integration.
- **Content growth:** populate currently hidden systems from the prioritized backlog before exposing their hubs. Yard queries such as standing water deliberately recover through search today because no matching published guide exists.

## Regression coverage

Automated checks cover required article fields, date formats, registry/topic parity, duplicate routes/slugs, related references, article reachability, contextual finder choices and result relevance, no-result fallback paths, representative search ranking and typo handling, active-only hubs, unique rendered metadata, 404 canonical behavior, stale domains, sitemap completeness/timestamps, inbound article links, source maps, image budgets, and internal static asset/route integrity.
