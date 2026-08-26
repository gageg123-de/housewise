import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { finderLocations, getFinderLocation, getFinderSymptomOptions, rankFinderArticles, searchArticles } from "../lib/discovery.mjs";

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
  assert.equal(rankFinderArticles(registry, "attic", "moisture")[0].article.slug, "ac-vent-sweating");
  assert.equal(rankFinderArticles(registry, "whole-house", "moisture")[0].article.slug, "house-humid-with-ac-running");
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
    ["ac dripping", "water-dripping-from-ac-vent"],
    ["house humid", "house-humid-with-ac-running"],
    ["musty garage", "garage-smells-musty"],
    ["warm outlet", "outlet-warm"],
    ["dryer slow", "dryer-taking-two-cycles"],
    ["water heater leak", "water-under-water-heater"],
    ["toilet bubblng", "toilet-bubbles-when-washer-drains"],
  ];
  for (const [query, expected] of cases) assert.equal(searchArticles(registry, query)[0]?.slug, expected, query);
  assert.deepEqual(searchArticles(registry, "yard standing water"), []);
});
