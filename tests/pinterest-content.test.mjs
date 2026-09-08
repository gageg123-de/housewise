import test from "node:test";
import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, rm, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { verifyPinterestContent } from "../scripts/verify-pinterest-content.mjs";

test("every published article has exactly one complete Pinterest package", async () => {
  const result = await verifyPinterestContent({ silent: true });
  assert.equal(result.publishedArticles, result.packages);
  assert.equal(result.needsReview, 0);
});

test("Pinterest validation rejects a published article with a missing image", async () => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "pinterest-content-"));
  try {
    await mkdir(path.join(fixtureRoot, "content"), { recursive: true });
    await mkdir(path.join(fixtureRoot, "content-deployment"), { recursive: true });
    await cp(new URL("../content/articles.json", import.meta.url), path.join(fixtureRoot, "content", "articles.json"));
    await cp(new URL("../content-deployment/pinterest-blog-content", import.meta.url), path.join(fixtureRoot, "content-deployment", "pinterest-blog-content"), { recursive: true });
    await unlink(path.join(fixtureRoot, "content-deployment", "pinterest-blog-content", "appliances", "dishwasher-not-cleaning-dishes", "pin.webp"));
    await assert.rejects(() => verifyPinterestContent({ repoRoot: fixtureRoot, silent: true }), /missing pin\.webp/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
