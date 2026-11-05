import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("article reality remains a mandatory pre-draft publication gate", async () => {
  const agents = await readProjectFile("AGENTS.md");
  assert.match(agents, /Article-reality preflight \(mandatory\)/);
  assert.match(agents, /verify from authoritative, manufacturer, utility, code, safety, or otherwise reliable sources/i);
  assert.match(agents, /Search opportunity never overrides factual reality/i);
  assert.match(agents, /If the premise fails this gate, stop publication/i);
});

test("mobile containment, table containment, and article rail breakpoint remain protected", async () => {
  const css = await readProjectFile("app/globals.css");
  assert.match(css, /html, body\s*\{[^}]*overflow-x:\s*clip[^}]*overscroll-behavior-x:\s*none/s);
  assert.match(css, /\.hero\s*\{[^}]*overflow-x:\s*clip/s);
  assert.match(css, /\.comparison-table-wrap\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/s);
  assert.match(css, /@media \(max-width:\s*1150px\)\s*\{[^}]*\.article-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
});

test("analytics-ready event names remain stable without installing a vendor", async () => {
  const [finder, search, guideCard, home, explorerHome, houseExplorer, agents] = await Promise.all([
    readProjectFile("components/ProblemFinder.tsx"),
    readProjectFile("components/SiteSearch.tsx"),
    readProjectFile("components/GuideCard.tsx"),
    readProjectFile("app/page.tsx"),
    readProjectFile("components/ExplorerHomePage.tsx"),
    readProjectFile("components/HouseExplorer.tsx"),
    readProjectFile("AGENTS.md"),
  ]);
  const implemented = `${finder}\n${search}\n${guideCard}\n${home}\n${explorerHome}\n${houseExplorer}`;
  for (const event of ["problem_finder_started", "problem_finder_step", "problem_finder_completed", "problem_finder_result_click", "site_search", "search_result_click", "related_article_click", "category_click"]) {
    assert.ok(implemented.includes(event), `${event}: missing implementation hook contract`);
  }
  for (const event of ["house_explorer_view", "house_hotspot_select", "house_problem_select", "house_category_click"]) assert.ok(implemented.includes(event), `${event}: missing explorer hook contract`);
  for (const event of ["article_depth_50", "article_depth_90"]) assert.match(agents, new RegExp(`\`${event}\``), `${event}: missing reserved contract`);
  assert.doesNotMatch(implemented, /google-analytics|googletagmanager|segment\.com|plausible\.io|posthog/i);
});

test("house explorer retains keyboard controls, selected state, and live announcements", async () => {
  const houseExplorer = await readProjectFile("components/HouseExplorer.tsx");
  assert.match(houseExplorer, /<button[\s\S]*aria-pressed=/);
  assert.match(houseExplorer, /aria-controls="house-recommendation-panel"/);
  assert.match(houseExplorer, /aria-live="polite"/);
  assert.match(houseExplorer, /Choose an area of the house/);
  assert.match(houseExplorer, /type="button"/);
});

test("homepage variant defaults safely to classic", async () => {
  const [variant, page, classic] = await Promise.all([
    readProjectFile("lib/home-variant.ts"),
    readProjectFile("app/page.tsx"),
    readProjectFile("components/ClassicHomePage.tsx"),
  ]);
  assert.match(variant, /value === "explorer" \? "explorer" : "classic"/);
  assert.match(page, /NEXT_PUBLIC_HOME_VARIANT/);
  assert.match(classic, /Figure out what’s happening in your home/);
  assert.match(classic, /Recently updated guides/);
});

test("house visual variant preserves V1 as the safe fallback", async () => {
  const [variant, explorerHome, houseExplorer, workflow] = await Promise.all([
    readProjectFile("lib/house-visual-variant.ts"),
    readProjectFile("components/ExplorerHomePage.tsx"),
    readProjectFile("components/HouseExplorer.tsx"),
    readProjectFile(".github/workflows/deploy-pages.yml"),
  ]);
  assert.match(variant, /value === "detailed" \? "detailed" : "v1"/);
  assert.match(explorerHome, /NEXT_PUBLIC_HOUSE_EXPLORER_VISUAL/);
  assert.match(houseExplorer, /data-house-visual=\{visualVariant\}/);
  assert.match(houseExplorer, /house-explorer-detailed\.webp/);
  assert.match(houseExplorer, /HouseIllustrationV1/);
  assert.match(workflow, /NEXT_PUBLIC_HOUSE_EXPLORER_VISUAL: detailed/);
  assert.match(workflow, /Verify Explorer V1 restoration mode/);
});

test("Problem Finder and search retain accessible labels, live results, and recovery actions", async () => {
  const [finder, search] = await Promise.all([
    readProjectFile("components/ProblemFinder.tsx"),
    readProjectFile("components/SiteSearch.tsx"),
  ]);
  assert.match(finder, /<label htmlFor="finder-location"/);
  assert.match(finder, /<label htmlFor="finder-symptom"/);
  assert.match(finder, /aria-live="polite"/);
  assert.match(finder, /disabled=\{!location\}/);
  assert.match(finder, /Start over/);
  assert.match(finder, /general educational information, not a diagnosis/);
  assert.match(search, /<label htmlFor="library-search"/);
  assert.match(search, /aria-live="polite"/);
  assert.match(search, /Use the Problem Finder/);
  assert.match(search, /Browse home problems/);
});

test("ad integration stays inactive and layout-reserved", async () => {
  const [articleTemplate, css] = await Promise.all([
    readProjectFile("app/[category]/[slug]/page.tsx"),
    readProjectFile("app/globals.css"),
  ]);
  assert.match(articleTemplate, /className="ad-slot" aria-hidden="true"/);
  assert.match(css, /\.ad-slot\s*\{[^}]*min-height:\s*250px[^}]*display:\s*none/s);
});
