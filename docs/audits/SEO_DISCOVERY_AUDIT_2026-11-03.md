# Site-wide SEO discovery audit — 2026-11-03

## A. Scope and baseline

This audit reconciled the publishing registry, a fresh static export, the production sitemap and robots file, every production article URL, category hubs, site search, Problem Finder paths, article-to-article links, schema, crawl depth, and Pinterest coverage. No new articles, categories, dependencies, or public routes were created.

- Repository: `B:\Codex\Ad Website`
- Starting commit: `498c2dc393b730a9c71a9e921c76e10ee0310521`
- Published articles: 57
- Content types: 44 diagnostic guides, 7 safety references, 5 symptom guides, and 1 comparison/explanation guide
- Pinterest packages/index rows: 57/57
- Declared tests before this audit: 165
- Static export: 90 HTML files, of which 88 are indexable sitemap URLs
- Production sitemap: HTTP 200 with 88 unique URLs and 57 article `lastmod` values
- Production robots file: HTTP 200

The per-article machine-readable inventory is [seo-discovery-inventory-2026-11-03.json](./seo-discovery-inventory-2026-11-03.json).

## B. Repository-to-production reconciliation

All 57 registry articles had a matching static route, production HTTP 200 response, production canonical, sitemap entry, truthful article `lastmod`, primary-hub card, Article schema, BreadcrumbList schema, site-search record, and Pinterest package. The rendered export contained no broken internal routes, stale production hosts, canonical mismatches, missing primary hubs, or articles beyond two homepage clicks.

The three required spot checks were healthy:

- `/hvac/ac-running-but-not-cooling/`
- `/moisture-and-mold/wall-wet-after-rain/`
- `/moisture-and-mold/front-door-leaking-when-it-rains/`

The register-replacement comparison guide intentionally remains search-only in the Problem Finder because the Finder is symptom-oriented. The other 56 published records are available through at least one valid Finder path.

## C. Prioritized findings

| Priority | Finding | Evidence | Resolution |
| --- | --- | --- | --- |
| P0 | None | No indexability, canonical, sitemap, robots, route, schema, broken-link, orphan, or deployment failure was found. | No speculative P0 change made. |
| P1 | Exact article-title searches failed for the between-pane condensation and breaker-reset guides. | The shared search guard rejected natural H1 wording containing “between my window panes” and “won’t my circuit breaker reset.” | Expanded only those canonical intent gates and added a regression requiring every exact published title to rank its own guide first. |
| P2 | The sink-drain leak guide had no contextual article inbound link. | It was available through hubs, Finder, and search, but no article branch routed a leaking sink drain to it. | Added a narrow link from the dishwasher guide’s sink/disposal branch, distinguishing a leak from slow drainage. |
| P2 | The bedroom musty-odor guide had no contextual article inbound link. | It was available through hubs, Finder, and search, but no article routed an odor-first bedroom pattern to it. | Added a narrow link from the window-mold guide when odor is primary and visible growth is not established. |
| Deferred | The ceiling-fan wobble guide has no contextual article inbound link. | It remains indexable, searchable, Finder-accessible, linked from the Electrical hub and symptom hubs, and at crawl depth 2. | No weak or unrelated backlink was manufactured. Revisit only when a genuinely useful fan/fixture branch exists. |

## D. Before-and-after discovery metrics

| Metric | Before | After |
| --- | ---: | ---: |
| Published articles | 57 | 57 |
| Articles with contextual article inbound links | 54 | 56 |
| Articles with any article-to-article inbound source | 54 | 56 |
| Hub-only articles | 3 | 1 |
| Exact-title search failures | 2 | 0 |
| Contextual article-link edges | 229 | 231 |
| Related-card edges | 235 | 235 |
| Broken internal links | 0 | 0 |
| Maximum article crawl depth | 2 | 2 |
| Finder-covered records | 56 | 56 |
| Pinterest coverage | 57/57 | 57/57 |

## E. Cluster and architecture assessment

### Electrical

The power-loss hierarchy, breaker/GFCI distinctions, panel-noise branch, and flicker branches are well connected and preserve separate intents. The ceiling-fan wobble guide is the only article without an article-to-article inbound source, but it is not orphaned and does not justify an artificial link from outlet, panel, or flicker guides.

### HVAC and moisture

The cluster has strong reciprocal paths among humidity, vent/duct/air-handler moisture, cycling, weak airflow, and inadequate cooling. The AC-not-cooling guide has a natural inbound branch from the cycling guide and remains distinct from warm-air, constant-runtime, outdoor-unit, frozen-coil, and high-load future intents. The new bedroom-odor branch improves cross-cluster navigation without treating odor as proof of mold.

### Plumbing and appliances

Trigger-specific drain guides are well separated from broad multi-fixture backups. The dishwasher drainage guide now sends a visible sink-drain leak to the correct plumbing canonical while preserving slow-drain and multi-drain ownership. Sediment parent/child ownership and hot/cold fixture scope remain intact.

### Rain intrusion

Ceiling, wall, window, and front-door rain patterns remain distinct and connected. Wall Wet After Rain routes opening-specific front-door symptoms to the front-door canonical. None of the rain guides equates the visible wet spot with the hidden entry point.

## F. Verification

- `npm run lint`: pass
- `npm test`: pass, 166/166 tests
- `npm run build`: pass, 90 prerendered routes
- `npm run verify:export`: pass, 90 static HTML files
- `npm run verify:pinterest-content`: pass, 57/57 ready
- `git diff --check`: pass
- Responsive browser containment: pass at 320, 375, 390, 430, 768, 1024, 1150, 1280, and 1440 pixels
- Document/body horizontal overflow: none
- Comparison table: contained by its intended local scroll wrapper at narrow widths
- Article rail: collapsed through 1150px and present at wider desktop widths

The rendered-browser checks covered Chromium behavior. They do not prove real-device iOS Safari rubber-band behavior.

## G. Next five evidence-led opportunities

1. Use Search Console query/page data to decide which low-inbound recent guides merit another contextual branch; do not add links solely from graph counts.
2. Revisit the ceiling-fan wobble guide only when an existing or future fan/fixture guide creates a real alternate-symptom fork.
3. Watch the low-inbound but well-discovered recent canonicals—AC not cooling, front-door rain leakage, recurring GFCI trips, shower pulsing, and whole-house power loss—before expanding or splitting their intents.
4. Replace the temporary Contact-page notice after a monitored destination and privacy process are selected; this requires owner input rather than an SEO-only code change.
5. Optimize or replace the legacy 1.96 MB social card after visual review; it is within the current regression ceiling but remains the clearest shared-asset performance opportunity.

## H. Strategic assessment

The site’s discovery architecture is structurally healthy for its current size. Registry-driven hubs, exact sitemap/canonical parity, two-click article depth, strict Finder compatibility, focused search gates, and one-to-one Pinterest coverage provide a strong foundation for continued growth. The highest-value work now is query-informed editorial depth and selective contextual linking—not new taxonomy, blanket backlink quotas, or near-duplicate articles.
