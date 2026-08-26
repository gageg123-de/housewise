# Architecture

My House Is Doing What? uses Vinext with React server components at build time and a full static export at runtime. This preserves file-based routes and per-page metadata while deploying plain HTML, CSS, JavaScript, and assets to GitHub Pages. It is a practical midpoint between hand-authored HTML and a database-backed CMS for a library expected to grow beyond 2,000 pages.

`content/articles.json` is the canonical publishing registry. `lib/site-data.ts` provides typed lookup, URL, category, and display helpers. One dynamic article template renders every record. Category and symptom hubs query the same data, while search and the finder load the registry in the browser. Adding content therefore does not require duplicating page files.

Optional article visuals are also registry-driven. The image record stores the public path, intrinsic dimensions, factual alt text, conceptual/diagrammatic/representational classification, caption, and the body section after which the visual renders. Static files live under `public/images/`; article metadata reuses the same primary visual with an absolute production URL.

Routes: `/`, `/find-a-problem/`, `/search/`, `/{category}/`, `/{category}/{article-slug}/`, `/symptoms/{symptom}/`, `/sitemap.xml`, `/robots.txt`, and the framework 404.

Client-side registry loading is acceptable for the starter set. Before the registry becomes large enough to affect transfer or parse time, generate a compact search index during build and lazy-load it only on finder/search routes. Keep authoritative content server-side.

## GitHub Pages output

`next.config.ts` enables `output: "export"`. Vinext prerenders the registry-derived dynamic routes, and `scripts/prepare-pages-export.mjs` converts flat route files into directory entry points, relocates prefixed `_next` assets to the artifact root, and writes static `robots.txt` and `sitemap.xml`. The final artifact is `dist/client/`.

Production is served from the custom-domain root, so routes and assets use `/hvac/`, `/_next/...`, and similar root paths. `site.config.json` centralizes the brand, tagline, production origin, empty production base path, and custom domain. `scripts/verify-static-export.mjs` validates linked routes/assets, production canonicals, sitemap URLs, robots, and CNAME.

Vinext 1.0.0-beta.2 currently returns 404/308 during dynamic prerender when framework `basePath` or `trailingSlash` is enabled. Production keeps the framework base path empty. The optional `assetPrefix`, base-aware full-document `SiteLink` anchors, and post-export relocation preserve compatibility for repository-path previews. Re-test this workaround before removing it during a Vinext upgrade.

`.github/workflows/deploy-pages.yml` installs Node 24 dependencies, lints, tests, rebuilds, verifies, uploads `dist/client`, and deploys with GitHub’s Pages actions. `.openai/hosting.json` remains for the existing Sites integration but is not involved in GitHub Pages deployment.

## Custom domain and DNS

The export writes `dist/client/CNAME` with `myhouseisdoingwhat.com` for artifact portability and auditability. GitHub ignores CNAME files for custom Actions workflows, so the repository’s Pages custom-domain setting remains authoritative. In GitHub **Settings → Pages**, keep the source on GitHub Actions, enter `myhouseisdoingwhat.com` as the custom domain, wait for the DNS check, and then enable Enforce HTTPS.

At the DNS provider, create apex (`@`) A records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`; create apex AAAA records for `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, and `2606:50c0:8003::153`. For `www`, create a CNAME to `gageg123-de.github.io` and redirect/forward `www` to the apex through GitHub Pages. Do not use wildcard DNS records.

Once GitHub accepts the custom domain, its repository Pages URL remains infrastructure but redirects to the custom domain. Every canonical, Open Graph URL, JSON-LD URL, and sitemap entry remains on `https://myhouseisdoingwhat.com`, preventing the infrastructure URL from becoming a second canonical host.
