# My House Is Doing What?

**Answers for the weird things your home does.**

A static-first, symptom-driven homeowner troubleshooting and reference library. Organic search is the primary acquisition channel, and reader-respectful display advertising is the intended primary monetization model.

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

`npm run build` performs a complete Vinext static export and then prepares GitHub Pages directory routes. The deployable website is `dist/client/`; it contains `index.html`, `404.html`, every registry-derived route, `_next` assets, `CNAME`, `sitemap.xml`, and `robots.txt`. `npm run verify:export` fails if representative pages, custom-domain metadata, or root-path-safe URLs are missing.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy-pages.yml` validates and deploys `dist/client` whenever `main` is pushed. In **Repository Settings → Pages**, select **Source: GitHub Actions**. Do not select **Deploy from a branch**; that mode publishes repository files and can show this README instead of the built site.

Production configuration lives in `site.config.json`:

```text
Brand=My House Is Doing What?
Tagline=Answers for the weird things your home does.
Site origin=https://myhouseisdoingwhat.com
Base path=(empty; production is hosted at /)
Custom domain=myhouseisdoingwhat.com
```

`lib/site-config.ts` exposes this identity to the application. Build scripts read the same configuration, and `scripts/prepare-pages-export.mjs` writes the production `CNAME` into the artifact for portability and inspection. GitHub’s custom Actions deployment treats the Pages custom-domain setting—not that file—as authoritative. Optional `NEXT_PUBLIC_SITE_ORIGIN` and `NEXT_PUBLIC_BASE_PATH` variables support infrastructure previews without changing production defaults in source control.

In **Repository Settings → Pages**, set the custom domain to `myhouseisdoingwhat.com`, enable **Enforce HTTPS** after DNS is valid, and keep **Source: GitHub Actions**. Configure the apex A/AAAA records and optional `www` CNAME documented in `docs/ARCHITECTURE.md`. GitHub Pages redirects its repository URL to the configured custom domain; canonicals remain exclusively on `https://myhouseisdoingwhat.com` to avoid duplicate indexing.

## Important launch replacements

The public brand and domain are final. Before monetization, confirm the operator identity and contact channel, privacy/terms text, Search Console verification, analytics/consent approach, and advertising IDs.

See `docs/ARCHITECTURE.md`, `docs/CONTENT_STRATEGY.md`, `docs/SEO.md`, `docs/PROBLEM_FINDER.md`, `docs/QA.md`, `docs/MONETIZATION.md`, and `docs/ROADMAP.md`.
