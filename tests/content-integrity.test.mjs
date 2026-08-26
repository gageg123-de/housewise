import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registry = JSON.parse(await readFile(new URL("../content/articles.json", import.meta.url), "utf8"));
const taxonomy = JSON.parse(await readFile(new URL("../content/taxonomy.json", import.meta.url), "utf8"));
const topics = await readFile(new URL("../content/topics.csv", import.meta.url), "utf8");

test("article registry has unique titles, slugs, and canonical paths", () => {
  assert.equal(new Set(registry.map((item) => item.title.toLowerCase())).size, registry.length);
  assert.equal(new Set(registry.map((item) => item.slug)).size, registry.length);
  assert.equal(new Set(registry.map((item) => `${item.primary_category}/${item.slug}`)).size, registry.length);
});

test("article taxonomy uses canonical configured values", () => {
  const categorySlugs = new Set(taxonomy.categories.map((category) => category.slug));
  assert.equal(categorySlugs.size, taxonomy.categories.length);
  for (const category of taxonomy.categories) {
    assert.match(category.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(category.name && category.intro);
  }
  for (const article of registry) {
    assert.ok(categorySlugs.has(article.primary_category), `${article.slug}: unknown primary category`);
    for (const category of article.secondary_categories) assert.ok(categorySlugs.has(category), `${article.slug}: unknown secondary category ${category}`);
    assert.equal(new Set(article.symptoms).size, article.symptoms.length, `${article.slug}: duplicate symptom values`);
    assert.equal(new Set(article.room_or_location).size, article.room_or_location.length, `${article.slug}: duplicate location values`);
  }
});

test("related article slugs resolve and required metadata exists", () => {
  const slugs = new Set(registry.map((item) => item.slug));
  for (const article of registry) {
    for (const field of ["title", "slug", "description", "primary_category", "system", "content_type", "published_date", "updated_date", "author", "target_search_intent", "direct_answer", "professional_help"]) assert.ok(article[field], `${article.slug}: ${field}`);
    for (const related of article.related_articles) assert.ok(slugs.has(related), `${article.slug}: missing related ${related}`);
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(Array.isArray(article.symptoms) && article.symptoms.length > 0);
    assert.ok(Array.isArray(article.room_or_location) && article.room_or_location.length > 0);
    assert.ok(Array.isArray(article.search_keywords) && article.search_keywords.length > 0);
    assert.ok(Array.isArray(article.likely_causes) && article.likely_causes.length > 0);
    assert.ok(Array.isArray(article.safe_checks) && article.safe_checks.length > 0);
    assert.match(article.published_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(article.updated_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(article.updated_date >= article.published_date, `${article.slug}: updated before publication`);
    assert.equal(article.reviewed_date, null, `${article.slug}: unverified expert review date`);
    if (article.image) {
      assert.match(article.image.src, /^\/images\/[a-z0-9-]+\.(?:avif|webp|png|jpe?g)$/);
      assert.ok(article.image.width > 0 && article.image.height > 0);
      assert.ok(article.image.alt && article.image.caption);
      assert.ok(["conceptual", "diagrammatic", "representational"].includes(article.image.kind));
    }
  }
});

test("published topics have one registry record and no article is isolated", () => {
  const publishedRows = topics.split(/\r?\n/).slice(1).filter((row) => row.includes(",published,") && row.trim());
  assert.equal(publishedRows.length, registry.length);
  for (const article of registry) {
    assert.equal(publishedRows.filter((row) => row.includes(`/${article.primary_category}/${article.slug}/`)).length, 1, `${article.slug}: backlog publication mismatch`);
    const samePrimaryCategory = registry.filter((item) => item.primary_category === article.primary_category);
    assert.ok(article.related_articles.length > 0 || samePrimaryCategory.length === 1, `${article.slug}: no related path despite an available category peer`);
  }
});

test("published AC vent dripping guide is distinct and complete", () => {
  const dripping = registry.find((item) => item.slug === "water-dripping-from-ac-vent");
  const sweating = registry.find((item) => item.slug === "ac-vent-sweating");
  assert.ok(dripping);
  assert.ok(sweating);
  assert.equal(dripping.primary_category, "hvac");
  assert.notEqual(dripping.target_search_intent, sweating.target_search_intent);
  assert.ok(dripping.body_sections.some((section) => section.id === "sweating-vs-dripping"));
  assert.ok(dripping.body_sections.some((section) => section.table));
  assert.ok(dripping.sources.every((source) => source.url.startsWith("https://")));
  assert.ok(dripping.related_articles.includes("ac-vent-sweating"));
  assert.ok(sweating.contextual_links.some((link) => link.href === "/hvac/water-dripping-from-ac-vent/"));
  assert.ok(dripping.search_keywords.includes("why is water dripping from my ac vent"));
  assert.ok(dripping.room_or_location.includes("living-area"));
  assert.ok(dripping.symptoms.includes("leaking"));
  assert.match(topics, /^Water dripping from AC vent,why is water dripping from my ac vent,hvac,leaking,living-area,diagnostic,published,high,\/hvac\/water-dripping-from-ac-vent\//m);
  for (const plannedTopic of ["AC ductwork sweating in attic", "Water around indoor AC unit", "AC smells musty when it turns on", "Condensate line keeps clogging", "AC filter is wet"]) assert.match(topics, new RegExp(`^${plannedTopic},`, "m"));
});

test("house humidity guide is distinct, linked, sourced, and image-ready", () => {
  const humidity = registry.find((item) => item.slug === "house-humid-with-ac-running");
  const sweating = registry.find((item) => item.slug === "ac-vent-sweating");
  const dripping = registry.find((item) => item.slug === "water-dripping-from-ac-vent");
  assert.ok(humidity);
  assert.equal(humidity.primary_category, "hvac");
  assert.ok(humidity.secondary_categories.includes("moisture-and-mold"));
  assert.notEqual(humidity.target_search_intent, sweating.target_search_intent);
  assert.notEqual(humidity.target_search_intent, dripping.target_search_intent);
  assert.ok(humidity.body_sections.some((section) => section.id === "how-ac-removes-humidity"));
  assert.ok(humidity.body_sections.some((section) => section.id === "common-reasons" && section.causes.length === 8));
  assert.ok(humidity.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(humidity.image.src, "/images/how-ac-removes-indoor-humidity.webp");
  assert.ok(humidity.image.width > 0 && humidity.image.height > 0 && humidity.image.alt && humidity.image.caption);
  assert.ok(humidity.related_articles.includes("ac-vent-sweating"));
  assert.ok(humidity.related_articles.includes("water-dripping-from-ac-vent"));
  assert.ok(sweating.contextual_links.some((link) => link.href === "/hvac/house-humid-with-ac-running/"));
  assert.ok(dripping.body_sections.some((section) => section.links?.some((link) => link.href === "/hvac/house-humid-with-ac-running/")));
  assert.match(topics, /^AC runs but house stays humid,why is my house humid with the ac running,hvac,moisture,whole-house,diagnostic,published,high,\/hvac\/house-humid-with-ac-running\//m);
});
