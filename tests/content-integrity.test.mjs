import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registry = JSON.parse(await readFile(new URL("../content/articles.json", import.meta.url), "utf8"));

test("article registry has unique titles, slugs, and canonical paths", () => {
  assert.equal(new Set(registry.map((item) => item.title.toLowerCase())).size, registry.length);
  assert.equal(new Set(registry.map((item) => item.slug)).size, registry.length);
  assert.equal(new Set(registry.map((item) => `${item.primary_category}/${item.slug}`)).size, registry.length);
});

test("related article slugs resolve and required metadata exists", () => {
  const slugs = new Set(registry.map((item) => item.slug));
  for (const article of registry) {
    for (const field of ["title", "slug", "description", "primary_category", "target_search_intent", "direct_answer"]) assert.ok(article[field], `${article.slug}: ${field}`);
    for (const related of article.related_articles) assert.ok(slugs.has(related), `${article.slug}: missing related ${related}`);
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(Array.isArray(article.symptoms) && article.symptoms.length > 0);
  }
});
