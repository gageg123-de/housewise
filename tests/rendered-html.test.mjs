import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("homepage renders product content and metadata", async () => {
  const response = await render(); const html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /Figure out what’s happening in your home/); assert.match(html, /Home Problem Finder/); assert.match(html, /My House Is Doing What\?/); assert.match(html, /Answers for the weird things your home does/); assert.match(html, /https:\/\/myhouseisdoingwhat\.com\//); assert.match(html, /"@type":"WebSite"/); assert.match(html, /"@type":"Organization"/); assert.doesNotMatch(html, /SearchAction|Freshly reviewed|Housewise|github\.io|chatgpt\.site|codex-preview|react-loading-skeleton/);
});

test("representative article renders its own metadata and answer", async () => {
  const response = await render("/electrical/outlet-warm"); const html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /<title>Why Is My Outlet Warm\? \| My House Is Doing What\?<\/title>/); assert.match(html, /What it usually means/); assert.match(html, /BreadcrumbList/); assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/electrical\/outlet-warm\//); assert.doesNotMatch(html, /Housewise|github\.io|chatgpt\.site|og\.png/);
  assert.doesNotMatch(html, /"@type":"WebSite"|SearchAction/);
});

test("taxonomy routes publish only useful non-empty hubs", async () => {
  const activeCategory = await render("/hvac"); const activeHtml = await activeCategory.text();
  assert.equal(activeCategory.status, 200);
  assert.match(activeHtml, /href="\/symptoms\/moisture\/"/);
  assert.doesNotMatch(activeHtml, /href="\/symptoms\/clogging\/"/);

  const emptyCategory = await render("/roofing"); const emptyCategoryHtml = await emptyCategory.text();
  assert.equal(emptyCategory.status, 404);
  assert.match(emptyCategoryHtml, /Page not found/);

  const activeSymptom = await render("/symptoms/drainage");
  assert.equal(activeSymptom.status, 200);
  const emptySymptom = await render("/symptoms/crack");
  assert.equal(emptySymptom.status, 404);
});

test("404 has distinct noindex metadata and no homepage canonical", async () => {
  const response = await render("/this-guide-does-not-exist"); const html = await response.text();
  assert.equal(response.status, 404);
  assert.match(html, /<title>Page Not Found \| My House Is Doing What\?<\/title>/);
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(html, /rel="canonical"/);
});

test("editorial policy explains sourcing, review status, and original visual checks", async () => {
  const response = await render("/editorial-policy"); const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /primary or authoritative references/);
  assert.match(html, /no external expert review/);
  assert.match(html, /Conceptual illustrations are labeled as conceptual/);
});

test("a second article overrides root social metadata with its record image", async () => {
  const response = await render("/plumbing/toilet-bubbles-when-washer-drains"); const html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /<title>Why Does My Toilet Bubble When the Washer Drains\? \| My House Is Doing What\?<\/title>/); assert.match(html, /washer pumps a substantial flow/); assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/plumbing\/toilet-bubbles-when-washer-drains\//); assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/images\/washer-toilet-shared-drain-pressure\.webp/); assert.doesNotMatch(html, /Housewise|github\.io|chatgpt\.site|og\.png/);
});

test("AC vent dripping guide renders long-form content, metadata, and contextual links", async () => {
  const response = await render("/hvac/water-dripping-from-ac-vent"); const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<title>Why Is Water Dripping From My AC Vent\? \| My House Is Doing What\?<\/title>/);
  assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/hvac\/water-dripping-from-ac-vent\//);
  assert.match(html, /AC vent sweating vs\. water dripping from the vent/i);
  assert.match(html, /href="\/hvac\/ac-vent-sweating\/"/);
  assert.match(html, /ceiling stain expands after rain/i);
  assert.match(html, /BreadcrumbList/);
  assert.match(html, /"@type":"Article"/);
  assert.doesNotMatch(html, /FAQPage|github\.io|chatgpt\.site|og\.png/);
});

test("house humidity guide renders article metadata, cluster links, and its original visual", async () => {
  const response = await render("/hvac/house-humid-with-ac-running"); const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<title>Why Is My House Humid With the AC Running\? \| My House Is Doing What\?<\/title>/);
  assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/hvac\/house-humid-with-ac-running\//);
  assert.match(html, /What does the AC normally do to humidity\?/);
  assert.match(html, /href="\/hvac\/ac-vent-sweating\/"/);
  assert.match(html, /href="\/hvac\/water-dripping-from-ac-vent\/"/);
  assert.match(html, /src="\/images\/how-ac-removes-indoor-humidity\.webp"/);
  assert.match(html, /width="1536" height="1024"/);
  assert.match(html, /Conceptual illustration:/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/images\/how-ac-removes-indoor-humidity\.webp/);
  assert.doesNotMatch(html, /FAQPage|github\.io|chatgpt\.site|og\.png/);
});

test("attic duct condensation guide renders metadata, source distinctions, cluster links, and visual", async () => {
  const response = await render("/hvac/ac-ductwork-sweating-in-attic"); const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<title>Why Is My AC Ductwork Sweating in the Attic\? \| My House Is Doing What\?<\/title>/);
  assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/hvac\/ac-ductwork-sweating-in-attic\//);
  assert.match(html, /Is the duct sweating, or is something actually leaking\?/);
  assert.match(html, /href="\/hvac\/house-humid-with-ac-running\/"/);
  assert.match(html, /href="\/hvac\/ac-vent-sweating\/"/);
  assert.match(html, /href="\/hvac\/water-dripping-from-ac-vent\/"/);
  assert.match(html, /src="\/images\/attic-ac-duct-condensation\.webp"/);
  assert.match(html, /width="1536" height="1024"/);
  assert.match(html, /Conceptual illustration:/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/images\/attic-ac-duct-condensation\.webp/);
  assert.doesNotMatch(html, /FAQPage|SearchAction|github\.io|chatgpt\.site|og\.png/);
});

test("indoor AC water guide renders drainage distinctions, cluster links, schema, and visual", async () => {
  const response = await render("/hvac/water-around-indoor-ac-unit"); const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<title>Why Is There Water Around My Indoor AC Unit\? \| My House Is Doing What\?<\/title>/);
  assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/hvac\/water-around-indoor-ac-unit\//);
  assert.match(html, /Is the water actually coming from the AC\?/);
  assert.match(html, /Could a frozen coil be thawing\?/);
  for (const slug of ["house-humid-with-ac-running", "ac-vent-sweating", "water-dripping-from-ac-vent", "ac-ductwork-sweating-in-attic"]) {
    assert.match(html, new RegExp(`href="/hvac/${slug}/"`));
  }
  assert.match(html, /src="\/images\/indoor-ac-condensate-drainage\.webp"/);
  assert.match(html, /width="1536" height="1024"/);
  assert.match(html, /Conceptual illustration:/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/images\/indoor-ac-condensate-drainage\.webp/);
  assert.doesNotMatch(html, /FAQPage|SearchAction|github\.io|chatgpt\.site|og\.png/);
});

test("water heater leak guide renders its unchanged canonical, safety distinctions, sources, and visual", async () => {
  const response = await render("/plumbing/water-under-water-heater"); const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<title>Why Is There Water Under My Water Heater\? \| My House Is Doing What\?<\/title>/);
  assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/plumbing\/water-under-water-heater\//);
  assert.match(html, /Start with where the water first appears/);
  assert.match(html, /Hot water, gas, pressure, and electricity change the response/);
  assert.match(html, /href="\/hvac\/water-around-indoor-ac-unit\/"/);
  assert.match(html, /src="\/images\/water-heater-leak-source-guide\.webp"/);
  assert.match(html, /width="1536" height="1024"/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.doesNotMatch(html, /FAQPage|SearchAction|github\.io|chatgpt\.site|og\.png/);
});

test("washer-triggered toilet bubbling guide renders drainage distinctions, safety, and conceptual visual", async () => {
  const response = await render("/plumbing/toilet-bubbles-when-washer-drains"); const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /https:\/\/myhouseisdoingwhat\.com\/plumbing\/toilet-bubbles-when-washer-drains\//);
  assert.match(html, /Why the washer can make the toilet bubble/);
  assert.match(html, /Stop the test if wastewater rises or spills/);
  assert.match(html, /href="\/plumbing\/toilet-whistles-after-flushing\/"/);
  assert.match(html, /src="\/images\/washer-toilet-shared-drain-pressure\.webp"/);
  assert.match(html, /width="1536" height="1024"/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.doesNotMatch(html, /FAQPage|SearchAction|github\.io|chatgpt\.site|og\.png/);
});
