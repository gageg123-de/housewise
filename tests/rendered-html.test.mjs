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
  assert.equal(response.status, 200); assert.match(html, /Figure out what’s happening in your home/); assert.match(html, /Home Problem Finder/); assert.match(html, /Housewise Guide/); assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("representative article renders its own metadata and answer", async () => {
  const response = await render("/electrical/outlet-warm"); const html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /<title>Why Is My Outlet Warm\? \| Housewise Guide<\/title>/); assert.match(html, /What it usually means/); assert.match(html, /BreadcrumbList/); assert.doesNotMatch(html, /og\.png/);
});

test("a second article overrides root social metadata without the site image", async () => {
  const response = await render("/plumbing/toilet-bubbles-when-washer-drains"); const html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /<title>Why Does My Toilet Bubble When the Washer Drains\? \| Housewise Guide<\/title>/); assert.match(html, /shared drain is partly blocked/); assert.doesNotMatch(html, /og\.png/);
});
