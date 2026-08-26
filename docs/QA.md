# Quality assurance and regression matrix

`AGENTS.md` is the mandatory rule layer. This document explains how to verify those rules without pretending every editorial or device-level judgment can be automated.

## Commands

- `npm run lint` checks source quality and JSX accessibility rules.
- `npm test` builds and verifies the export, then runs every Node regression test.
- `npm run build` creates the production static export in `dist/client/`.
- `npm run verify:export` checks the already-built artifact: routes, links, crawl depth, metadata, schema, sitemap, assets, host consistency, and regression budgets.

Do not remove or loosen an invariant merely to make a content change pass. Fix the content/data or document a deliberate policy change.

## Regression matrix

| Guardrail | Failure it prevents | Automated? | Test/check |
| --- | --- | --- | --- |
| Finder location filtering | Yard exposing toilet/dryer/outlet problems | Yes | `tests/discovery.test.mjs`: contextual choices and representative matrix |
| Finder result compatibility | Unrelated guides returned to avoid emptiness | Yes | exhaustive configured-path compatibility test |
| Finder fallback integrity | Blank results or fabricated article URLs | Yes | fallback generation/path test; UI recovery assertion |
| Finder wording and accessibility | Missing labels, reset, live results, diagnostic certainty | Partial | `tests/guardrails.test.mjs` plus keyboard/manual copy review |
| Search relevance | Generic-token and over-fuzzy matches | Yes | representative queries and negative `yard standing water` test |
| Registry/taxonomy integrity | Invalid categories, duplicate values, broken related slugs | Yes | `tests/content-integrity.test.mjs` |
| No orphan articles | Published pages with no crawlable inbound path | Yes | `scripts/verify-static-export.mjs` inbound-link and crawl-depth checks |
| Article next steps | Dead-end article endings | Yes | artifact checks for parent hub, Finder, and search links |
| No empty hubs | Thin indexable taxonomy pages | Yes | dynamic taxonomy/artifact/sitemap checks plus rendered 404 test |
| Canonical production host | Duplicate or stale domains | Yes | rendered metadata and export host-consistency checks |
| Unique metadata and H1 | Duplicate snippets or ambiguous page identity | Yes | export uniqueness and exactly-one-H1 checks |
| Sitemap integrity | Missing, duplicate, noindex, empty-hub, or fabricated-date URLs | Yes | exact canonical-set and verified-lastmod checks |
| Structured data placement | Repeated WebSite schema or obsolete SearchAction | Yes | schema placement checks and representative Article/Breadcrumb tests |
| Image prerequisites | Missing dimensions/alt/caption or oversized article assets | Partial | registry/image budget tests; factual visual review remains manual |
| Mobile containment | Sideways document drift and table/image escape | Partial | CSS guardrail test plus manual widths and real iOS review |
| Desktop article layout | 1024px overflow and premature side-rail layout | Partial | 1150px CSS breakpoint test plus manual width review |
| Accessibility | Keyboard, focus, labeling, target-size, or announcement regressions | Partial | lint/source invariants plus manual keyboard/screen-reader review |
| Safety escalation | Urgent hazards buried or unsafe DIY normalized | Partial | Finder safety-copy assertion plus editorial review |
| Performance regression | Shared JS/social assets silently growing | Yes/partial | 120 KB gzip regression ceiling and 2 MB legacy OG ceiling; 90 KB target remains manual work |
| Analytics/ad readiness | Event-name drift, premature vendor/ad activation, CLS | Partial | source-contract tests plus privacy/layout review |

## Mandatory manual viewport review

For layout-affecting changes, inspect 320, 375, 390, 430, 768, 1024, 1150, 1280, and 1440px. Check header fit, heading/breadcrumb wrapping, controls, cards, tables, images, article measure, the 1150px side-rail collapse, footer, focus, and horizontal containment. Preserve `overflow-x: clip`, `overscroll-behavior-x: none`, local hero clipping, and scrollable comparison-table wrappers unless an equivalent fix is proven.

A trusted rendered browser is required to claim actual iOS rubber-band verification. Static CSS tests cannot prove Safari gesture behavior. If that runtime is unavailable, report the limitation rather than substituting a false success claim.

## Mandatory editorial review

Automation cannot reliably prove factual article quality, technical image accuracy, proportional safety judgment, tasteful humor, non-alarmist tone, or true search-intent differentiation. These remain human/editorial gates even when metadata and file checks pass.
