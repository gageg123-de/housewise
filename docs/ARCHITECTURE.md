# Architecture

Housewise Guide uses Vinext with React server components at build time and a full static export at runtime. This preserves file-based routes and per-page metadata while deploying plain HTML, CSS, JavaScript, and assets to GitHub Pages. It is a practical midpoint between hand-authored HTML and a database-backed CMS for a library expected to grow beyond 2,000 pages.

`content/articles.json` is the canonical publishing registry. `lib/site-data.ts` provides typed lookup, URL, category, and display helpers. One dynamic article template renders every record. Category and symptom hubs query the same data, while search and the finder load the registry in the browser. Adding content therefore does not require duplicating page files.

Routes: `/`, `/find-a-problem/`, `/search/`, `/{category}/`, `/{category}/{article-slug}/`, `/symptoms/{symptom}/`, `/sitemap.xml`, `/robots.txt`, and the framework 404.

Client-side registry loading is acceptable for the starter set. Before the registry becomes large enough to affect transfer or parse time, generate a compact search index during build and lazy-load it only on finder/search routes. Keep authoritative content server-side.

## GitHub Pages output

`next.config.ts` enables `output: "export"`. Vinext prerenders the registry-derived dynamic routes, and `scripts/prepare-pages-export.mjs` converts flat route files into directory entry points, relocates prefixed `_next` assets to the artifact root, and writes static `robots.txt` and `sitemap.xml`. The final artifact is `dist/client/`.

The repository lives at `/housewise/`, but GitHub Pages mounts the artifact root at that path. Therefore HTML requests use `/housewise/_next/...` while the files remain at `dist/client/_next/...`. `scripts/verify-static-export.mjs` validates this relationship and rejects missing routes, unprefixed root URLs, or doubled base paths.

Vinext 1.0.0-beta.2 currently returns 404/308 during dynamic prerender when framework `basePath` or `trailingSlash` is enabled. The project keeps those framework options unset/false, uses `assetPrefix`, emits base-aware full-document `SiteLink` anchors, and prepares directory routes after export. Re-test this workaround before removing it during a Vinext upgrade.

`.github/workflows/deploy-pages.yml` installs Node 24 dependencies, lints, tests, rebuilds, verifies, uploads `dist/client`, and deploys with GitHub’s Pages actions. `.openai/hosting.json` remains for the existing Sites integration but is not involved in GitHub Pages deployment.

For a future custom domain, change `NEXT_PUBLIC_SITE_ORIGIN` and clear `NEXT_PUBLIC_BASE_PATH` in the workflow. The application URL helpers, canonicals, structured data, sitemap, assets, and links will follow those values on the next build.
