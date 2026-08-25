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

The build is compatible with OpenAI Sites. The same generated static-first output can be adapted for GitHub Pages, but the Vinext/Cloudflare build and dynamic metadata routes currently assume the Sites deployment pipeline; a GitHub Pages move should add a static export check and base-path configuration first.

## Important launch replacements

`Housewise Guide` and `https://housewise.guide` are temporary working values. Before public launch, confirm the brand/domain, operator identity and contact channel, privacy/terms text, Search Console verification, analytics/consent approach, and advertising IDs.

See `docs/ARCHITECTURE.md`, `docs/CONTENT_STRATEGY.md`, `docs/SEO.md`, `docs/MONETIZATION.md`, and `docs/ROADMAP.md`.
