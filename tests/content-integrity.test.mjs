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
  assert.ok(sweating.body_sections.some((section) => section.links?.some((link) => link.href === "/hvac/water-dripping-from-ac-vent/")));
  assert.ok(dripping.search_keywords.includes("why is water dripping from my ac vent"));
  assert.ok(dripping.room_or_location.includes("living-area"));
  assert.ok(dripping.symptoms.includes("leaking"));
  assert.match(topics, /^Water dripping from AC vent,why is water dripping from my ac vent,hvac,leaking,living-area,diagnostic,published,high,\/hvac\/water-dripping-from-ac-vent\//m);
  for (const plannedTopic of ["AC smells musty when it turns on", "Condensate line keeps clogging", "AC filter is wet"]) assert.match(topics, new RegExp(`^${plannedTopic},`, "m"));
});

test("AC vent sweating guide stays focused on room-side surface condensation", () => {
  const sweating = registry.find((item) => item.slug === "ac-vent-sweating");
  const clusterSlugs = ["water-dripping-from-ac-vent", "house-humid-with-ac-running", "ac-ductwork-sweating-in-attic", "water-around-indoor-ac-unit"];
  assert.ok(sweating);
  assert.equal(sweating.published_date, "2026-08-24");
  assert.equal(sweating.updated_date, "2026-08-27");
  assert.ok(sweating.target_search_intent.includes("room-side AC supply register"));
  assert.ok(sweating.body_sections.some((section) => section.id === "one-or-many" && section.table?.rows.length === 7));
  assert.ok(sweating.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 5));
  assert.ok(sweating.body_sections.some((section) => section.id === "safe-checks" && section.callout));
  const renderedLinks = sweating.body_sections.flatMap((section) => section.links ?? []).map((link) => link.href);
  for (const slug of clusterSlugs) assert.ok(renderedLinks.includes(`/hvac/${slug}/`));
  assert.deepEqual(sweating.related_articles, clusterSlugs);
  assert.equal(sweating.image.src, "/images/ac-register-surface-condensation.webp");
  assert.equal(sweating.image.kind, "conceptual");
  assert.ok(sweating.sources.every((source) => source.url.startsWith("https://")));
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
  assert.ok(sweating.body_sections.some((section) => section.links?.some((link) => link.href === "/hvac/house-humid-with-ac-running/")));
  assert.ok(dripping.body_sections.some((section) => section.links?.some((link) => link.href === "/hvac/house-humid-with-ac-running/")));
  assert.match(topics, /^AC runs but house stays humid,why is my house humid with the ac running,hvac,moisture,whole-house,diagnostic,published,high,\/hvac\/house-humid-with-ac-running\//m);
});

test("attic duct condensation guide is distinct, connected, sourced, and image-ready", () => {
  const atticDuct = registry.find((item) => item.slug === "ac-ductwork-sweating-in-attic");
  const humidity = registry.find((item) => item.slug === "house-humid-with-ac-running");
  const sweating = registry.find((item) => item.slug === "ac-vent-sweating");
  const dripping = registry.find((item) => item.slug === "water-dripping-from-ac-vent");
  assert.ok(atticDuct);
  assert.equal(atticDuct.primary_category, "hvac");
  assert.deepEqual(atticDuct.room_or_location, ["attic"]);
  assert.ok(atticDuct.secondary_categories.includes("moisture-and-mold"));
  assert.ok(atticDuct.secondary_categories.includes("attic-and-insulation"));
  for (const related of [humidity, sweating, dripping]) assert.notEqual(atticDuct.target_search_intent, related.target_search_intent);
  assert.ok(atticDuct.body_sections.some((section) => section.id === "why-attic-ducts-sweat"));
  assert.ok(atticDuct.body_sections.some((section) => section.id === "common-causes" && section.causes.length === 6));
  assert.ok(atticDuct.body_sections.some((section) => section.id === "sweating-or-leaking" && section.table));
  assert.ok(atticDuct.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(atticDuct.image.src, "/images/attic-ac-duct-condensation.webp");
  assert.equal(atticDuct.image.kind, "conceptual");
  assert.ok(atticDuct.image.width > 0 && atticDuct.image.height > 0 && atticDuct.image.alt && atticDuct.image.caption);
  for (const slug of ["house-humid-with-ac-running", "ac-vent-sweating", "water-dripping-from-ac-vent"]) assert.ok(atticDuct.related_articles.includes(slug));
  assert.ok(sweating.body_sections.some((section) => section.links?.some((link) => link.href === "/hvac/ac-ductwork-sweating-in-attic/")));
  assert.ok(dripping.body_sections.some((section) => section.link?.href === "/hvac/ac-ductwork-sweating-in-attic/" || section.links?.some((link) => link.href === "/hvac/ac-ductwork-sweating-in-attic/")));
  assert.ok(humidity.body_sections.some((section) => section.links?.some((link) => link.href === "/hvac/ac-ductwork-sweating-in-attic/")));
  assert.match(topics, /^AC ductwork sweating in attic,why is my ac ductwork sweating in the attic,hvac,moisture,attic,diagnostic,published,high,\/hvac\/ac-ductwork-sweating-in-attic\//m);
});

test("indoor AC water guide is distinct, connected, sourced, and image-ready", () => {
  const indoorWater = registry.find((item) => item.slug === "water-around-indoor-ac-unit");
  const cluster = registry.filter((item) => [
    "house-humid-with-ac-running",
    "ac-vent-sweating",
    "water-dripping-from-ac-vent",
    "ac-ductwork-sweating-in-attic",
    "ac-filter-wet",
  ].includes(item.slug));
  assert.ok(indoorWater);
  assert.equal(indoorWater.primary_category, "hvac");
  assert.ok(indoorWater.secondary_categories.includes("moisture-and-mold"));
  assert.deepEqual(indoorWater.room_or_location, ["whole-house"]);
  assert.ok(indoorWater.symptoms.includes("leaking"));
  assert.ok(indoorWater.symptoms.includes("moisture"));
  for (const article of cluster) assert.notEqual(indoorWater.target_search_intent, article.target_search_intent);
  assert.ok(indoorWater.body_sections.some((section) => section.id === "normal-condensate-path"));
  assert.ok(indoorWater.body_sections.some((section) => section.id === "common-causes" && section.causes.length === 8));
  assert.ok(indoorWater.body_sections.some((section) => section.id === "is-it-from-the-ac" && section.table));
  assert.ok(indoorWater.body_sections.some((section) => section.id === "frozen-coil-clues"));
  assert.ok(indoorWater.body_sections.some((section) => section.id === "safe-checks" && section.callout));
  assert.ok(indoorWater.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(indoorWater.image.src, "/images/indoor-ac-condensate-drainage.webp");
  assert.equal(indoorWater.image.kind, "conceptual");
  assert.equal(indoorWater.image.width, 1536);
  assert.equal(indoorWater.image.height, 1024);
  for (const slug of cluster.map((article) => article.slug)) assert.ok(indoorWater.related_articles.includes(slug));
  for (const article of cluster) {
    const links = [
      ...(article.contextual_links ?? []),
      ...(article.body_sections ?? []).flatMap((section) => [section.link, ...(section.links ?? [])].filter(Boolean)),
    ];
    assert.ok(links.some((link) => link.href === "/hvac/water-around-indoor-ac-unit/"), `${article.slug}: missing reciprocal indoor-unit link`);
  }
  assert.match(topics, /^Water around indoor AC unit,why is there water around my indoor ac unit,hvac,leaking,whole-house,diagnostic,published,high,\/hvac\/water-around-indoor-ac-unit\//m);
  for (const plannedTopic of ["Condensate line keeps clogging", "AC smells musty when it turns on"]) {
    assert.match(topics, new RegExp(`^${plannedTopic},.*?,planned,`, "m"));
  }
});

test("water heater leak guide preserves its canonical intent and adds safety-depth safeguards", () => {
  const waterHeater = registry.find((item) => item.slug === "water-under-water-heater");
  const reliefTopic = topics.split(/\r?\n/).find((row) => row.startsWith("Water heater relief valve drips,"));
  assert.ok(waterHeater);
  assert.equal(waterHeater.primary_category, "plumbing");
  assert.equal(waterHeater.published_date, "2026-08-24");
  assert.equal(waterHeater.updated_date, "2026-08-27");
  assert.ok(reliefTopic?.includes(",planned,"), "narrow relief-valve intent remains planned");
  assert.ok(waterHeater.body_sections.some((section) => section.id === "where-water-starts" && section.table?.rows.length === 6));
  assert.ok(waterHeater.body_sections.some((section) => section.id === "common-sources" && section.causes?.length === 6));
  assert.ok(waterHeater.body_sections.some((section) => section.id === "safe-observations" && section.callout));
  assert.ok(waterHeater.body_sections.some((section) => section.id === "which-professional" && section.subsections?.length === 3));
  assert.ok(waterHeater.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(waterHeater.image.src, "/images/water-heater-leak-source-guide.webp");
  assert.equal(waterHeater.image.kind, "conceptual");
  assert.ok(waterHeater.related_articles.includes("water-around-indoor-ac-unit"));
  const indoorWater = registry.find((item) => item.slug === "water-around-indoor-ac-unit");
  assert.ok(indoorWater.body_sections.some((section) => section.link?.href === "/plumbing/water-under-water-heater/"));
});

test("washer-triggered toilet bubbling guide stays distinct from random gurgling and protects backup safety", () => {
  const bubbling = registry.find((item) => item.slug === "toilet-bubbles-when-washer-drains");
  const randomGurgle = topics.split(/\r?\n/).find((row) => row.startsWith("Toilet gurgles randomly,"));
  assert.ok(bubbling);
  assert.equal(bubbling.published_date, "2026-08-24");
  assert.equal(bubbling.updated_date, "2026-08-28");
  assert.ok(randomGurgle?.includes(",published,"));
  assert.match(bubbling.target_search_intent, /specifically during washing-machine discharge/i);
  assert.ok(bubbling.body_sections.some((section) => section.id === "shared-drain-mechanism"));
  assert.ok(bubbling.body_sections.some((section) => section.id === "likely-causes" && section.causes?.length === 5));
  assert.ok(bubbling.body_sections.some((section) => section.id === "what-the-bowl-does" && section.table?.rows.length === 7));
  assert.ok(bubbling.body_sections.some((section) => section.id === "bubbling-or-backup" && section.callout));
  assert.ok(bubbling.body_sections.some((section) => section.link?.href === "/plumbing/toilet-gurgles-randomly/"));
  assert.ok(bubbling.body_sections.some((section) => section.link?.href === "/plumbing/toilet-whistles-after-flushing/"));
  assert.ok(bubbling.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(bubbling.image.src, "/images/washer-toilet-shared-drain-pressure.webp");
  assert.equal(bubbling.image.kind, "conceptual");
});

test("random toilet gurgling guide owns hidden-trigger intent without absorbing fixture-specific drainage pages", () => {
  const gurgling = registry.find((item) => item.slug === "toilet-gurgles-randomly");
  const washer = registry.find((item) => item.slug === "toilet-bubbles-when-washer-drains");
  const toiletRiseTopic = topics.split(/\r?\n/).find((row) => row.startsWith("Toilet water rises when another toilet flushes,"));
  const topic = topics.split(/\r?\n/).find((row) => row.startsWith("Toilet gurgles randomly,"));
  const showerTopic = topics.split(/\r?\n/).find((row) => row.startsWith("Shower drain gurgles when toilet flushes,"));
  const futureTopics = topics.split(/\r?\n/).filter((row) => /^(Sink gurgles when washer drains),/.test(row));
  assert.ok(gurgling && washer);
  assert.equal(gurgling.published_date, "2026-08-28");
  assert.equal(gurgling.updated_date, "2026-08-28");
  assert.ok(topic?.includes(",published,") && topic.includes("/plumbing/toilet-gurgles-randomly/"));
  assert.ok(toiletRiseTopic?.includes(",published,") && toiletRiseTopic.includes("/plumbing/toilet-water-rises-when-another-toilet-flushes/"));
  assert.ok(showerTopic?.includes(",published,") && showerTopic.includes("/plumbing/shower-drain-gurgles-when-toilet-flushes/"));
  assert.equal(futureTopics.length, 1);
  assert.ok(futureTopics.every((row) => row.includes(",planned,")));
  assert.match(gurgling.target_search_intent, /without an obvious trigger/i);
  assert.ok(gurgling.body_sections.some((section) => section.id === "hidden-trigger"));
  assert.ok(gurgling.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 6));
  assert.ok(gurgling.body_sections.some((section) => section.id === "what-it-is-doing" && section.table?.rows.length === 6));
  assert.ok(gurgling.body_sections.some((section) => section.id === "sewage-safety" && section.callout));
  assert.ok(gurgling.body_sections.some((section) => section.link?.href === "/plumbing/toilet-bubbles-when-washer-drains/"));
  assert.ok(gurgling.body_sections.some((section) => section.link?.href === "/plumbing/toilet-water-rises-when-another-toilet-flushes/"));
  assert.ok(gurgling.body_sections.some((section) => section.link?.href === "/plumbing/toilet-whistles-after-flushing/"));
  assert.ok(washer.related_articles.includes("toilet-gurgles-randomly"));
  assert.ok(gurgling.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(gurgling.image.src, "/images/toilet-hidden-trigger-drain-pressure.webp");
  assert.equal(gurgling.image.kind, "conceptual");
});

test("toilet-to-toilet flush interaction guide owns the known-trigger water-level intent", () => {
  const article = registry.find((item) => item.slug === "toilet-water-rises-when-another-toilet-flushes");
  const random = registry.find((item) => item.slug === "toilet-gurgles-randomly");
  const topic = topics.split(/\r?\n/).find((row) => row.startsWith("Toilet water rises when another toilet flushes,"));
  const protectedTopics = topics.split(/\r?\n/).filter((row) => /^(Sink gurgles when washer drains|Tub backs up when toilet flushes),/.test(row));
  assert.ok(article && random);
  assert.equal(article.published_date, "2026-08-28");
  assert.equal(article.updated_date, "2026-08-28");
  assert.ok(topic?.includes(",published,") && topic.includes("/plumbing/toilet-water-rises-when-another-toilet-flushes/"));
  assert.ok(protectedTopics.length >= 2);
  assert.ok(protectedTopics.every((row) => row.includes(",planned,")));
  assert.match(article.target_search_intent, /flushing one toilet can make another toilet's bowl water rise/i);
  assert.ok(article.body_sections.some((section) => section.id === "what-rise-means" && section.table?.rows.length === 6));
  assert.ok(article.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 6));
  assert.ok(article.body_sections.some((section) => section.id === "timing-clues" && section.table?.rows.length === 5));
  assert.ok(article.body_sections.some((section) => section.id === "stop-using-fixtures" && section.callout));
  assert.ok(article.body_sections.some((section) => section.link?.href === "/plumbing/toilet-gurgles-randomly/"));
  assert.ok(article.body_sections.some((section) => section.links?.some((link) => link.href === "/plumbing/toilet-bubbles-when-washer-drains/")));
  assert.ok(article.body_sections.some((section) => section.link?.href === "/plumbing/shower-drain-gurgles-when-toilet-flushes/"));
  assert.ok(article.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(article.image.src, "/images/toilet-shared-drain-interaction.webp");
  assert.equal(article.image.kind, "conceptual");
  assert.ok(random.related_articles.includes(article.slug));
});

test("toilet-triggered shower gurgling guide stays distinct from sound-only, tub-backup, and multi-drain intents", () => {
  const article = registry.find((item) => item.slug === "shower-drain-gurgles-when-toilet-flushes");
  const toiletRise = registry.find((item) => item.slug === "toilet-water-rises-when-another-toilet-flushes");
  const topic = topics.split(/\r?\n/).find((row) => row.startsWith("Shower drain gurgles when toilet flushes,"));
  const futureTopics = topics.split(/\r?\n/).filter((row) => /^(Tub backs up when toilet flushes|Sink gurgles when washer drains),/.test(row));
  assert.ok(article && toiletRise);
  assert.equal(article.published_date, "2026-08-30");
  assert.equal(article.updated_date, "2026-08-30");
  assert.ok(topic?.includes(",published,") && topic.includes("/plumbing/shower-drain-gurgles-when-toilet-flushes/"));
  assert.equal(futureTopics.length, 2);
  assert.ok(futureTopics.every((row) => row.includes(",planned,")));
  assert.match(article.target_search_intent, /toilet flush can make a shower or tub drain gurgle/i);
  assert.ok(article.body_sections.some((section) => section.id === "why-shower-gurgles"));
  assert.ok(article.body_sections.some((section) => section.id === "sound-or-water" && section.table?.rows.length === 5));
  assert.ok(article.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 7));
  assert.ok(article.body_sections.some((section) => section.id === "timing-clues" && section.table?.rows.length === 4));
  assert.ok(article.body_sections.some((section) => section.id === "urgent-warning" && section.callout));
  assert.ok(article.body_sections.some((section) => section.links?.some((link) => link.href === "/plumbing/toilet-water-rises-when-another-toilet-flushes/")));
  assert.ok(article.body_sections.some((section) => section.links?.some((link) => link.href === "/plumbing/toilet-gurgles-randomly/")));
  assert.ok(article.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(article.image.src, "/images/toilet-shower-shared-drain-gurgling.webp");
  assert.equal(article.image.kind, "conceptual");
  assert.ok(toiletRise.related_articles.includes(article.slug));
});

test("multiple-drain backup guide owns broad multi-fixture intent without absorbing main-sewer or fixture-trigger pages", () => {
  const article = registry.find((item) => item.slug === "multiple-drains-back-up-at-same-time");
  const random = registry.find((item) => item.slug === "toilet-gurgles-randomly");
  const toiletRise = registry.find((item) => item.slug === "toilet-water-rises-when-another-toilet-flushes");
  const shower = registry.find((item) => item.slug === "shower-drain-gurgles-when-toilet-flushes");
  const washer = registry.find((item) => item.slug === "toilet-bubbles-when-washer-drains");
  const topic = topics.split(/\r?\n/).find((row) => row.startsWith("Multiple drains back up at same time,"));
  const protectedTopics = topics.split(/\r?\n/).filter((row) => /^(Tub backs up when toilet flushes|Sink gurgles when washer drains),/.test(row));
  assert.ok(article && random && toiletRise && shower && washer);
  assert.equal(article.published_date, "2026-08-31");
  assert.equal(article.updated_date, "2026-08-31");
  assert.ok(topic?.includes(",published,") && topic.includes("/plumbing/multiple-drains-back-up-at-same-time/"));
  assert.ok(protectedTopics.every((row) => row.includes(",planned,")));
  assert.match(article.target_search_intent, /several fixtures can become slow, gurgle, rise, or back up together/i);
  assert.ok(article.body_sections.some((section) => section.id === "what-counts" && section.table?.rows.length === 5));
  assert.ok(article.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 7));
  assert.ok(article.body_sections.some((section) => section.id === "fixture-pattern" && section.subsections?.length === 5));
  assert.ok(article.body_sections.some((section) => section.id === "timing-clues" && section.table?.rows.length === 4));
  assert.ok(article.body_sections.some((section) => section.id === "stop-water-use" && section.callout));
  for (const slug of ["shower-drain-gurgles-when-toilet-flushes", "toilet-water-rises-when-another-toilet-flushes", "toilet-bubbles-when-washer-drains", "toilet-gurgles-randomly"]) {
    assert.ok(article.body_sections.some((section) => section.links?.some((link) => link.href === `/plumbing/${slug}/`)));
  }
  assert.ok(article.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(article.image.src, "/images/multiple-drains-shared-downstream-restriction.webp");
  assert.equal(article.image.kind, "conceptual");
  assert.equal(article.image.width, 1536);
  assert.equal(article.image.height, 1024);
  assert.ok(random.body_sections.some((section) => section.link?.href === "/plumbing/multiple-drains-back-up-at-same-time/"));
  assert.ok(toiletRise.body_sections.some((section) => section.link?.href === "/plumbing/multiple-drains-back-up-at-same-time/"));
  assert.ok(shower.body_sections.some((section) => section.link?.href === "/plumbing/multiple-drains-back-up-at-same-time/"));
  assert.ok(washer.body_sections.some((section) => section.link?.href === "/plumbing/multiple-drains-back-up-at-same-time/"));
});

test("slow-dryer guide separates airflow, washer, sensor, and heating paths without absorbing burning-odor intent", () => {
  const dryer = registry.find((item) => item.slug === "dryer-taking-two-cycles");
  const burningTopic = topics.split(/\r?\n/).find((row) => row.startsWith("Dryer smells like burning,"));
  assert.ok(dryer);
  assert.equal(dryer.published_date, "2026-08-24");
  assert.equal(dryer.updated_date, "2026-08-27");
  assert.ok(burningTopic?.includes(",planned,"));
  assert.ok(dryer.body_sections.some((section) => section.id === "how-drying-works"));
  assert.ok(dryer.body_sections.some((section) => section.id === "hot-or-cool" && section.table?.rows.length === 7));
  assert.ok(dryer.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 8));
  assert.ok(dryer.body_sections.some((section) => section.id === "safe-checks" && section.callout));
  assert.ok(dryer.body_sections.some((section) => section.id === "when-to-call" && section.subsections?.length === 3));
  assert.ok(dryer.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(dryer.image.src, "/images/dryer-airflow-restriction-guide.webp");
  assert.equal(dryer.image.kind, "conceptual");
});

test("musty-garage guide preserves garage odor intent and avoids treating smell as a mold diagnosis", () => {
  const garage = registry.find((item) => item.slug === "garage-smells-musty");
  const nearbyTopics = topics.split(/\r?\n/).filter((row) => /^(Musty smell after rain|Concrete garage floor sweating|Attic smells musty),/.test(row));
  assert.ok(garage);
  assert.equal(garage.published_date, "2026-08-24");
  assert.equal(garage.updated_date, "2026-08-27");
  assert.equal(nearbyTopics.length, 3);
  assert.ok(nearbyTopics.every((row) => row.includes(",planned,")));
  assert.ok(garage.direct_answer.includes("does not prove mold"));
  assert.ok(garage.body_sections.some((section) => section.id === "timing-and-location" && section.table?.rows.length === 8));
  assert.ok(garage.body_sections.some((section) => section.id === "common-sources" && section.causes?.length === 7));
  assert.ok(garage.body_sections.some((section) => section.id === "safe-checks" && section.callout));
  assert.ok(garage.body_sections.some((section) => section.id === "professional-help" && section.subsections?.length === 3));
  assert.deepEqual(garage.related_articles, ["water-under-water-heater"]);
  assert.ok(garage.sources.every((source) => source.publisher === "U.S. Environmental Protection Agency"));
  assert.equal(garage.image, undefined);
});

test("toilet-whistle guide stays on refill supply noise and separates drainage gurgling", () => {
  const whistle = registry.find((item) => item.slug === "toilet-whistles-after-flushing");
  const randomGurgle = topics.split(/\r?\n/).find((row) => row.startsWith("Toilet gurgles randomly,"));
  assert.ok(whistle);
  assert.equal(whistle.published_date, "2026-08-24");
  assert.equal(whistle.updated_date, "2026-08-27");
  assert.ok(randomGurgle?.includes(",published,"));
  assert.ok(whistle.body_sections.some((section) => section.id === "when-it-whistles" && section.table?.rows.length === 7));
  assert.ok(whistle.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 5));
  assert.ok(whistle.body_sections.some((section) => section.id === "safe-checks" && section.callout));
  assert.ok(whistle.body_sections.some((section) => section.id === "not-a-drain-gurgle" && section.links?.some((link) => link.href === "/plumbing/toilet-bubbles-when-washer-drains/")));
  assert.ok(whistle.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(whistle.image, undefined);
});

test("warm-outlet guide preserves conservative stop-use boundaries without invasive electrical steps", () => {
  const outlet = registry.find((item) => item.slug === "outlet-warm");
  const breakerTopic = topics.split(/\r?\n/).find((row) => row.startsWith("Breaker keeps tripping with nothing plugged in,"));
  assert.ok(outlet);
  assert.equal(outlet.published_date, "2026-08-24");
  assert.equal(outlet.updated_date, "2026-08-27");
  assert.ok(breakerTopic?.includes(",planned,"));
  assert.ok(outlet.body_sections.some((section) => section.id === "warm-or-hot" && section.table?.rows.length === 6));
  assert.ok(outlet.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 6));
  assert.ok(outlet.body_sections.some((section) => section.id === "safe-response" && section.callout?.title.includes("Do not open")));
  assert.ok(outlet.body_sections.some((section) => section.id === "professional-help" && section.subsections?.length === 2));
  const body = JSON.stringify(outlet.body_sections);
  assert.match(body, /do not remove the faceplate/i);
  assert.match(body, /Do not remove the faceplate[^.]+touch wiring[^.]+tighten terminals[^.]+replace the receptacle while energized/i);
  assert.doesNotMatch(body, /step-by-step|open the electrical box|probe the wiring/);
  assert.ok(outlet.sources.some((source) => source.publisher === "U.S. Consumer Product Safety Commission"));
  assert.equal(outlet.image, undefined);
});

test("ceiling-fan guide separates blade imbalance from ceiling-mount movement", () => {
  const fan = registry.find((item) => item.slug === "ceiling-fan-wobbles");
  assert.ok(fan);
  assert.equal(fan.published_date, "2026-08-24");
  assert.equal(fan.updated_date, "2026-08-27");
  assert.match(fan.target_search_intent, /blade-set imbalance from movement at the fan's ceiling attachment/i);
  assert.ok(fan.body_sections.some((section) => section.id === "blades-or-mount" && section.table?.rows.length === 6));
  assert.ok(fan.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 6));
  assert.ok(fan.body_sections.some((section) => section.id === "safe-observations" && section.callout?.title.includes("ceiling attachment")));
  assert.ok(fan.body_sections.some((section) => section.id === "balancing-boundary"));
  assert.ok(fan.body_sections.some((section) => section.id === "when-to-call"));
  const body = JSON.stringify(fan.body_sections);
  assert.match(body, /Do not operate a fan whose canopy[^.]+ceiling attachment visibly moves/i);
  assert.match(body, /Do not remove the canopy, touch wiring, or work from an unstable ladder/i);
  assert.ok(fan.sources.some((source) => source.publisher === "International Code Council"));
  assert.ok(fan.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(fan.image.src, "/images/ceiling-fan-wobble-vs-mount-movement.webp");
  assert.equal(fan.image.kind, "conceptual");
  assert.equal(fan.image.width, 1536);
  assert.equal(fan.image.height, 1024);
});

test("wet AC filter guide stays location-specific and distinct from equipment-water and recurring-drain intent", () => {
  const filter = registry.find((item) => item.slug === "ac-filter-wet");
  const indoorWater = registry.find((item) => item.slug === "water-around-indoor-ac-unit");
  const humidity = registry.find((item) => item.slug === "house-humid-with-ac-running");
  const recurringDrain = topics.split(/\r?\n/).find((row) => row.startsWith("Condensate line keeps clogging,"));
  assert.ok(filter && indoorWater && humidity);
  assert.equal(filter.published_date, "2026-08-28");
  assert.equal(filter.updated_date, "2026-08-28");
  assert.equal(filter.primary_category, "hvac");
  assert.ok(filter.secondary_categories.includes("moisture-and-mold"));
  assert.deepEqual(filter.room_or_location, ["whole-house"]);
  assert.notEqual(filter.target_search_intent, indoorWater.target_search_intent);
  assert.ok(recurringDrain?.includes(",planned,"), "recurring drain-clog intent remains planned");
  assert.ok(filter.body_sections.some((section) => section.id === "filter-location-first" && section.table?.rows.length === 5));
  assert.ok(filter.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 6));
  assert.ok(filter.body_sections.some((section) => section.id === "where-wet" && section.table?.rows.length === 6));
  assert.ok(filter.body_sections.some((section) => section.id === "keep-running-and-replace" && section.callout));
  assert.ok(filter.body_sections.some((section) => section.id === "related-hvac-moisture" && section.links?.length === 5));
  assert.ok(filter.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(filter.image.src, "/images/ac-filter-location-moisture-paths.webp");
  assert.equal(filter.image.kind, "conceptual");
  assert.equal(filter.image.width, 1536);
  assert.equal(filter.image.height, 1024);
  const reciprocalLinks = [indoorWater, humidity].map((article) => (article.body_sections ?? []).flatMap((section) => [section.link, ...(section.links ?? [])].filter(Boolean)));
  assert.ok(reciprocalLinks.every((links) => links.some((link) => link.href === "/hvac/ac-filter-wet/")));
  assert.match(topics, /^AC filter is wet,why is my ac filter wet,hvac,moisture,whole-house,diagnostic,published,high,\/hvac\/ac-filter-wet\//m);
});

test("air-handler sweating guide owns cabinet condensation without absorbing adjacent HVAC moisture intents", () => {
  const airHandler = registry.find((item) => item.slug === "air-handler-sweating");
  const indoorWater = registry.find((item) => item.slug === "water-around-indoor-ac-unit");
  const atticDuct = registry.find((item) => item.slug === "ac-ductwork-sweating-in-attic");
  assert.ok(airHandler && indoorWater && atticDuct);
  assert.equal(airHandler.published_date, "2026-09-02");
  assert.equal(airHandler.updated_date, "2026-09-02");
  assert.equal(airHandler.primary_category, "hvac");
  assert.ok(airHandler.secondary_categories.includes("moisture-and-mold"));
  assert.ok(airHandler.room_or_location.includes("attic"));
  assert.notEqual(airHandler.target_search_intent, indoorWater.target_search_intent);
  assert.notEqual(airHandler.target_search_intent, atticDuct.target_search_intent);
  assert.ok(airHandler.body_sections.some((section) => section.id === "sweating-or-leaking" && section.table?.rows.length === 5));
  assert.ok(airHandler.body_sections.some((section) => section.id === "common-causes" && section.causes?.length === 7));
  assert.ok(airHandler.body_sections.some((section) => section.id === "safe-observations" && section.callout));
  assert.ok(airHandler.sources.length >= 5);
  assert.ok(airHandler.sources.every((source) => source.url.startsWith("https://")));
  assert.equal(airHandler.image.src, "/images/air-handler-cabinet-condensation.webp");
  assert.equal(airHandler.image.kind, "conceptual");
  assert.equal(airHandler.image.width, 1536);
  assert.equal(airHandler.image.height, 1024);
  for (const slug of ["water-around-indoor-ac-unit", "ac-ductwork-sweating-in-attic", "house-humid-with-ac-running", "ac-filter-wet", "ac-vent-sweating", "water-dripping-from-ac-vent"]) {
    assert.ok(airHandler.related_articles.includes(slug));
  }
  for (const article of [indoorWater, atticDuct]) {
    const links = article.body_sections.flatMap((section) => [section.link, ...(section.links ?? [])].filter(Boolean));
    assert.ok(links.some((link) => link.href === "/hvac/air-handler-sweating/"), `${article.slug}: missing reciprocal cabinet link`);
  }
  assert.match(topics, /^Air handler sweating,why is my air handler sweating,hvac,moisture,whole-house,diagnostic,published,high,\/hvac\/air-handler-sweating\//m);
});
