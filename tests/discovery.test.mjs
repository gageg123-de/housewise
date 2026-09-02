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
  assert.ok(bathroom.some((item) => item.value === "toilet-gurgling"));
  assert.ok(bathroom.some((item) => item.value === "toilet-water-level"));
  assert.ok(bathroom.some((item) => item.value === "shower-gurgling"));
  assert.ok(bathroom.some((item) => item.value === "noise"));
  assert.ok(!bathroom.some((item) => item.value === "pest-activity"));

  const attic = getFinderSymptomOptions("attic");
  assert.ok(attic.some((item) => item.value === "moisture"));
  assert.ok(attic.some((item) => item.value === "air-handler-sweating"));
  assert.ok(attic.some((item) => item.value === "pest-activity"));
  assert.ok(!attic.some((item) => item.value === "appliance-behavior"));

  const wholeHouse = getFinderSymptomOptions("whole-house");
  assert.ok(wholeHouse.some((item) => item.value === "multiple-drains"));
  assert.ok(wholeHouse.some((item) => item.value === "air-handler-sweating"));
  assert.ok(wholeHouse.some((item) => item.value === "appliance-light-flicker"));

  const kitchen = getFinderSymptomOptions("kitchen");
  assert.ok(kitchen.some((item) => item.value === "appliance-light-flicker"));
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "appliance-light-flicker"));

  const laundry = getFinderSymptomOptions("laundry");
  assert.ok(laundry.some((item) => item.value === "dryer-burning-smell"));
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "dryer-burning-smell"));
});

test("Problem Finder ranks exact location and symptom matches without unrelated leakage", () => {
  assert.equal(rankFinderArticles(registry, "bathroom", "drainage")[0].article.slug, "toilet-bubbles-when-washer-drains");
  assert.equal(rankFinderArticles(registry, "bathroom", "toilet-gurgling")[0].article.slug, "toilet-gurgles-randomly");
  assert.equal(rankFinderArticles(registry, "bathroom", "toilet-water-level")[0].article.slug, "toilet-water-rises-when-another-toilet-flushes");
  assert.equal(rankFinderArticles(registry, "bathroom", "shower-gurgling")[0].article.slug, "shower-drain-gurgles-when-toilet-flushes");
  assert.equal(rankFinderArticles(registry, "attic", "moisture")[0].article.slug, "ac-ductwork-sweating-in-attic");
  assert.equal(rankFinderArticles(registry, "attic", "air-handler-sweating")[0].article.slug, "air-handler-sweating");
  assert.equal(rankFinderArticles(registry, "whole-house", "moisture")[0].article.slug, "house-humid-with-ac-running");
  assert.equal(rankFinderArticles(registry, "whole-house", "hvac-filter")[0].article.slug, "ac-filter-wet");
  assert.equal(rankFinderArticles(registry, "whole-house", "leaking")[0].article.slug, "water-around-indoor-ac-unit");
  assert.equal(rankFinderArticles(registry, "whole-house", "air-handler-sweating")[0].article.slug, "air-handler-sweating");
  assert.equal(rankFinderArticles(registry, "whole-house", "multiple-drains")[0].article.slug, "multiple-drains-back-up-at-same-time");
  assert.equal(rankFinderArticles(registry, "whole-house", "appliance-light-flicker")[0].article.slug, "lights-flicker-when-appliance-turns-on");
  assert.equal(rankFinderArticles(registry, "kitchen", "appliance-light-flicker")[0].article.slug, "lights-flicker-when-appliance-turns-on");
  assert.equal(rankFinderArticles(registry, "laundry", "appliance-behavior")[0].article.slug, "dryer-taking-two-cycles");
  assert.equal(rankFinderArticles(registry, "laundry", "dryer-burning-smell")[0].article.slug, "dryer-smells-like-burning");
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
    ["bathroom", "toilet-gurgling"],
    ["bathroom", "toilet-water-level"],
    ["bathroom", "shower-gurgling"],
    ["bathroom", "leaking"],
    ["bathroom", "smell"],
    ["bathroom", "noise"],
    ["whole-house", "moisture"],
    ["whole-house", "multiple-drains"],
    ["whole-house", "hvac-filter"],
    ["whole-house", "air-handler-sweating"],
    ["whole-house", "appliance-light-flicker"],
    ["kitchen", "appliance-light-flicker"],
    ["laundry", "appliance-behavior"],
    ["laundry", "dryer-burning-smell"],
    ["attic", "moisture"],
    ["attic", "air-handler-sweating"],
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
  assert.equal(rankFinderArticles(registry, "whole-house", "multiple-drains")[0].article.slug, "multiple-drains-back-up-at-same-time");
  assert.equal(rankFinderArticles(registry, "whole-house", "appliance-light-flicker")[0].article.slug, "lights-flicker-when-appliance-turns-on");
  assert.equal(rankFinderArticles(registry, "laundry", "appliance-behavior")[0].article.slug, "dryer-taking-two-cycles");
  assert.equal(rankFinderArticles(registry, "laundry", "dryer-burning-smell")[0].article.slug, "dryer-smells-like-burning");
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
    ["toilet gurgles randomly", "toilet-gurgles-randomly"],
    ["toilet gurgling for no reason", "toilet-gurgles-randomly"],
    ["toilet bubbles randomly", "toilet-gurgles-randomly"],
    ["toilet makes gurgling noise", "toilet-gurgles-randomly"],
    ["toilet gurgles when nothing is running", "toilet-gurgles-randomly"],
    ["toilet water rises when another toilet flushes", "toilet-water-rises-when-another-toilet-flushes"],
    ["one toilet affects another toilet", "toilet-water-rises-when-another-toilet-flushes"],
    ["toilet bubbles when other toilet flushes", "toilet-water-rises-when-another-toilet-flushes"],
    ["toilet water moves when another toilet flushes", "toilet-water-rises-when-another-toilet-flushes"],
    ["second toilet rises when first toilet flushes", "toilet-water-rises-when-another-toilet-flushes"],
    ["toilet water level rises when upstairs toilet flushes", "toilet-water-rises-when-another-toilet-flushes"],
    ["shower drain gurgles when toilet flushes", "shower-drain-gurgles-when-toilet-flushes"],
    ["shower gurgles when toilet flushes", "shower-drain-gurgles-when-toilet-flushes"],
    ["tub drain gurgles when toilet flushes", "shower-drain-gurgles-when-toilet-flushes"],
    ["shower drain bubbles when toilet flushes", "shower-drain-gurgles-when-toilet-flushes"],
    ["toilet flush makes shower drain gurgle", "shower-drain-gurgles-when-toilet-flushes"],
    ["bath drain gurgles when toilet flushes", "shower-drain-gurgles-when-toilet-flushes"],
    ["multiple drains backing up at same time", "multiple-drains-back-up-at-same-time"],
    ["multiple drains clogged at once", "multiple-drains-back-up-at-same-time"],
    ["several drains backing up", "multiple-drains-back-up-at-same-time"],
    ["all drains backing up", "multiple-drains-back-up-at-same-time"],
    ["multiple drains slow at same time", "multiple-drains-back-up-at-same-time"],
    ["toilet and shower backing up", "multiple-drains-back-up-at-same-time"],
    ["several drains gurgling", "multiple-drains-back-up-at-same-time"],
    ["toilet high pitched refill", "toilet-whistles-after-flushing"],
    ["toilet rises washer drains", "toilet-bubbles-when-washer-drains"],
    ["ac dripping", "water-dripping-from-ac-vent"],
    ["one ac vent condensation", "ac-vent-sweating"],
    ["house humid", "house-humid-with-ac-running"],
    ["attic duct sweating", "ac-ductwork-sweating-in-attic"],
    ["water around indoor ac", "water-around-indoor-ac-unit"],
    ["air handler puddle", "water-around-indoor-ac-unit"],
    ["ac filter wet", "ac-filter-wet"],
    ["wet hvac filter", "ac-filter-wet"],
    ["air filter damp", "ac-filter-wet"],
    ["water on ac filter", "ac-filter-wet"],
    ["filter soaked near air handler", "ac-filter-wet"],
    ["why is my air handler sweating", "air-handler-sweating"],
    ["air handler sweating", "air-handler-sweating"],
    ["air handler condensation", "air-handler-sweating"],
    ["condensation on air handler", "air-handler-sweating"],
    ["air handler sweating in attic", "air-handler-sweating"],
    ["ac unit sweating in attic", "air-handler-sweating"],
    ["indoor ac unit sweating", "air-handler-sweating"],
    ["moisture on air handler", "air-handler-sweating"],
    ["musty garage", "garage-smells-musty"],
    ["warm outlet", "outlet-warm"],
    ["lights flicker when appliance turns on", "lights-flicker-when-appliance-turns-on"],
    ["why do my lights flicker when appliance turns on", "lights-flicker-when-appliance-turns-on"],
    ["lights dim when ac turns on", "lights-flicker-when-appliance-turns-on"],
    ["lights flicker when refrigerator starts", "lights-flicker-when-appliance-turns-on"],
    ["lights dim when microwave runs", "lights-flicker-when-appliance-turns-on"],
    ["lights flicker when washer starts", "lights-flicker-when-appliance-turns-on"],
    ["lights flicker when dryer runs", "lights-flicker-when-appliance-turns-on"],
    ["lights blink when compressor starts", "lights-flicker-when-appliance-turns-on"],
    ["dryer slow", "dryer-taking-two-cycles"],
    ["clothes hot damp", "dryer-taking-two-cycles"],
    ["dryer smells like burning", "dryer-smells-like-burning"],
    ["why does my dryer smell like it's burning", "dryer-smells-like-burning"],
    ["burning smell from dryer", "dryer-smells-like-burning"],
    ["dryer smells burnt", "dryer-smells-like-burning"],
    ["dryer burning smell", "dryer-smells-like-burning"],
    ["dryer smells like burning rubber", "dryer-smells-like-burning"],
    ["dryer smells electrical", "dryer-smells-like-burning"],
    ["dryer smells like burnt lint", "dryer-smells-like-burning"],
    ["dryer takes two cycles", "dryer-taking-two-cycles"],
    ["dryer not drying clothes", "dryer-taking-two-cycles"],
    ["dryer takes forever to dry", "dryer-taking-two-cycles"],
    ["clothes still damp after dryer", "dryer-taking-two-cycles"],
    ["water heater leak", "water-under-water-heater"],
    ["toilet bubblng", "toilet-bubbles-when-washer-drains"],
  ];
  for (const [query, expected] of cases) assert.equal(searchArticles(registry, query)[0]?.slug, expected, query);
  assert.deepEqual(searchArticles(registry, "yard standing water"), []);
  assert.notEqual(searchArticles(registry, "lights flicker randomly")[0]?.slug, "lights-flicker-when-appliance-turns-on");
});
