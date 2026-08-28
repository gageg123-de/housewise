import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { finderLocations, getFinderFallbackHref, getFinderLocation, getFinderSymptomOptions, rankFinderArticles, searchArticles } from "../lib/discovery.mjs";

const registry = JSON.parse(await readFile(new URL("../content/articles.json", import.meta.url), "utf8"));

test("Problem Finder choices are contextual to the selected location", () => {
  const yard = getFinderSymptomOptions("yard");
  assert.deepEqual(yard.map((item) => item.value), ["drainage", "leaking", "pest-activity", "smell", "crack"]);
  assert.ok(!yard.some((item) => item.value === "appliance-behavior" || item.value === "electrical-behavior"));

  const bathroom = getFinderSymptomOptions("bathroom");
  assert.ok(bathroom.some((item) => item.value === "drainage"));
  assert.ok(bathroom.some((item) => item.value === "noise"));
  assert.ok(!bathroom.some((item) => item.value === "pest-activity"));

  const attic = getFinderSymptomOptions("attic");
  assert.ok(attic.some((item) => item.value === "moisture"));
  assert.ok(attic.some((item) => item.value === "pest-activity"));
  assert.ok(!attic.some((item) => item.value === "appliance-behavior"));
});

test("Problem Finder ranks exact location and symptom matches without unrelated leakage", () => {
  assert.equal(rankFinderArticles(registry, "bathroom", "drainage")[0].article.slug, "toilet-bubbles-when-washer-drains");
  assert.equal(rankFinderArticles(registry, "attic", "moisture")[0].article.slug, "ac-ductwork-sweating-in-attic");
  assert.equal(rankFinderArticles(registry, "whole-house", "moisture")[0].article.slug, "house-humid-with-ac-running");
  assert.equal(rankFinderArticles(registry, "whole-house", "leaking")[0].article.slug, "water-around-indoor-ac-unit");
  assert.equal(rankFinderArticles(registry, "laundry", "appliance-behavior")[0].article.slug, "dryer-taking-two-cycles");
  assert.deepEqual(rankFinderArticles(registry, "yard", "drainage"), []);

  for (const { value: locationValue } of finderLocations) {
    const location = getFinderLocation(locationValue);
    for (const symptom of getFinderSymptomOptions(locationValue)) {
      for (const { article } of rankFinderArticles(registry, locationValue, symptom.value)) {
        assert.ok(article.room_or_location.some((item) => location.locations.includes(item)), `${locationValue}/${symptom.value} returned unrelated location ${article.slug}`);
        assert.ok(article.symptoms.some((item) => symptom.articleSymptoms.includes(item)), `${locationValue}/${symptom.value} returned unrelated symptom ${article.slug}`);
      }
    }
  }
});

test("Problem Finder representative matrix stays contextual and bounded", () => {
  const articleSlugs = new Set(registry.map((article) => article.slug));
  const matrix = [
    ["yard", "drainage"],
    ["yard", "leaking"],
    ["yard", "pest-activity"],
    ["yard", "smell"],
    ["bathroom", "drainage"],
    ["bathroom", "leaking"],
    ["bathroom", "smell"],
    ["bathroom", "noise"],
    ["whole-house", "moisture"],
    ["laundry", "appliance-behavior"],
    ["attic", "moisture"],
  ];

  for (const [locationValue, symptomValue] of matrix) {
    const location = getFinderLocation(locationValue);
    const symptom = getFinderSymptomOptions(locationValue).find((item) => item.value === symptomValue);
    assert.ok(location && symptom, `${locationValue}/${symptomValue}: configured path`);
    const results = rankFinderArticles(registry, locationValue, symptomValue);
    assert.ok(results.length <= 6, `${locationValue}/${symptomValue}: too many results`);
    for (const { article } of results) {
      assert.ok(articleSlugs.has(article.slug), `${locationValue}/${symptomValue}: invalid article reference`);
      assert.ok(article.room_or_location.some((item) => location.locations.includes(item)), `${locationValue}/${symptomValue}: unrelated location`);
      assert.ok(article.symptoms.some((item) => symptom.articleSymptoms.includes(item)), `${locationValue}/${symptomValue}: unrelated symptom`);
    }
    if (!results.length) {
      const fallback = getFinderFallbackHref(locationValue, symptomValue);
      assert.match(fallback, /^\/search\/\?q=\S+/);
      assert.ok(![...articleSlugs].some((slug) => fallback.includes(`/${slug}/`)), `${locationValue}/${symptomValue}: fallback fabricated an article URL`);
    }
  }

  assert.match(getFinderSymptomOptions("yard").find((item) => item.value === "drainage").label, /standing water/i);
  assert.equal(rankFinderArticles(registry, "whole-house", "moisture")[0].article.slug, "house-humid-with-ac-running");
  assert.equal(rankFinderArticles(registry, "laundry", "appliance-behavior")[0].article.slug, "dryer-taking-two-cycles");
  assert.equal(rankFinderArticles(registry, "attic", "moisture")[0]?.article.slug, "ac-ductwork-sweating-in-attic");
});

test("every configured Problem Finder path returns valid results or a safe search fallback", () => {
  const slugs = new Set(registry.map((article) => article.slug));
  for (const { value: location } of finderLocations) {
    for (const symptom of getFinderSymptomOptions(location)) {
      assert.doesNotThrow(() => rankFinderArticles(registry, location, symptom.value));
      const results = rankFinderArticles(registry, location, symptom.value);
      if (results.length) {
        assert.ok(results.every(({ article }) => slugs.has(article.slug)));
      } else {
        assert.match(getFinderFallbackHref(location, symptom.value), /^\/search\/\?q=/);
      }
    }
  }
  assert.deepEqual(rankFinderArticles(registry, "not-a-location", "noise"), []);
  assert.equal(getFinderFallbackHref("not-a-location", "noise"), "/search/?q=");
});

test("every published article is reachable through at least one Problem Finder path", () => {
  const reachable = new Set();
  for (const { value: location } of finderLocations) {
    for (const symptom of getFinderSymptomOptions(location)) {
      for (const { article } of rankFinderArticles(registry, location, symptom.value)) reachable.add(article.slug);
    }
  }
  assert.deepEqual([...registry.map((article) => article.slug).filter((slug) => !reachable.has(slug))], []);
});

test("site search ranks realistic homeowner queries and rejects weak partial matches", () => {
  const cases = [
    ["toilet bubbling", "toilet-bubbles-when-washer-drains"],
    ["toilet high pitched refill", "toilet-whistles-after-flushing"],
    ["toilet rises washer drains", "toilet-bubbles-when-washer-drains"],
    ["ac dripping", "water-dripping-from-ac-vent"],
    ["one ac vent condensation", "ac-vent-sweating"],
    ["house humid", "house-humid-with-ac-running"],
    ["attic duct sweating", "ac-ductwork-sweating-in-attic"],
    ["water around indoor ac", "water-around-indoor-ac-unit"],
    ["air handler puddle", "water-around-indoor-ac-unit"],
    ["musty garage", "garage-smells-musty"],
    ["warm outlet", "outlet-warm"],
    ["dryer slow", "dryer-taking-two-cycles"],
    ["clothes hot damp", "dryer-taking-two-cycles"],
    ["water heater leak", "water-under-water-heater"],
    ["toilet bubblng", "toilet-bubbles-when-washer-drains"],
  ];
  for (const [query, expected] of cases) assert.equal(searchArticles(registry, query)[0]?.slug, expected, query);
  assert.deepEqual(searchArticles(registry, "yard standing water"), []);
});
