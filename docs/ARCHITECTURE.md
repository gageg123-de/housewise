# Architecture

Housewise Guide uses Vinext with React server components and Cloudflare-compatible output. This preserves file-based routes and per-page metadata while keeping article pages static-first and almost entirely free of client JavaScript. It is a practical midpoint between hand-authored HTML and a database-backed CMS for a library expected to grow beyond 2,000 pages.

`content/articles.json` is the canonical publishing registry. `lib/site-data.ts` provides typed lookup, URL, category, and display helpers. One dynamic article template renders every record. Category and symptom hubs query the same data, while search and the finder load the registry in the browser. Adding content therefore does not require duplicating page files.

Routes: `/`, `/find-a-problem/`, `/search/`, `/{category}/`, `/{category}/{article-slug}/`, `/symptoms/{symptom}/`, `/sitemap.xml`, `/robots.txt`, and the framework 404.

Client-side registry loading is acceptable for the starter set. Before the registry becomes large enough to affect transfer or parse time, generate a compact search index during build and lazy-load it only on finder/search routes. Keep authoritative content server-side.

Deployment uses `.openai/hosting.json` and the Sites Vite plugin. D1 and R2 are intentionally disabled. GitHub Pages can host a future static export if route generation, trailing-slash behavior, base paths, and metadata output are verified in that target.
