# Housewise Guide

A static-first homeowner problem-solving reference designed for durable organic discovery, useful diagnostic navigation, and eventual reader-friendly display advertising.

## Local development

Requires Node 22.13+ (Node 24 LTS recommended).

```powershell
npm install
npm run dev
```

The content registry is `content/articles.json`. Add or update an article there after following the duplicate-topic process in `AGENTS.md`; dynamic routes generate the corresponding system/article page. The client-side search and Problem Finder consume the same registry.

```powershell
npm run build
npm test
npm run lint
```

`npm run build` performs a complete Vinext static export and then prepares GitHub Pages directory routes. The deployable website is `dist/client/`; it contains `index.html`, `404.html`, every registry-derived route, `_next` assets, `sitemap.xml`, and `robots.txt`. `npm run verify:export` fails if representative pages or base-path-safe URLs are missing.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy-pages.yml` validates and deploys `dist/client` whenever `main` is pushed. In **Repository Settings → Pages**, select **Source: GitHub Actions**. Do not select **Deploy from a branch**; that mode publishes repository files and can show this README instead of the built site.

Current deployment configuration:

```text
NEXT_PUBLIC_SITE_ORIGIN=https://gageg123-de.github.io
NEXT_PUBLIC_BASE_PATH=/housewise
Site URL=https://gageg123-de.github.io/housewise/
```

`lib/site-config.ts` is the application-level URL helper. The workflow environment is the deployment configuration point. Vinext currently cannot prerender dynamic App Router pages while its framework `basePath` option is enabled, so `next.config.ts` uses `assetPrefix` while `SiteLink`, `routePath`, and the post-export preparation script apply the public base path. This keeps the source routes canonical and produces a GitHub Pages-compatible artifact without `/housewise/housewise/` duplication.

For a custom domain, change the workflow environment to the new origin and set `NEXT_PUBLIC_BASE_PATH` to an empty string, configure the domain in GitHub Pages, rebuild, and verify canonicals/sitemap before submitting them to Search Console.

## Important launch replacements

`Housewise Guide` remains a temporary working brand. Before public launch, confirm the final brand/domain, operator identity and contact channel, privacy/terms text, Search Console verification, analytics/consent approach, and advertising IDs.

See `docs/ARCHITECTURE.md`, `docs/CONTENT_STRATEGY.md`, `docs/SEO.md`, `docs/MONETIZATION.md`, and `docs/ROADMAP.md`.
