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
  assert.ok(bathroom.some((item) => item.value === "sink-drain-leak"));
  assert.ok(bathroom.some((item) => item.value === "bath-water-sediment"));
  assert.ok(bathroom.some((item) => item.value === "window-condensation"));
  assert.ok(bathroom.some((item) => item.value === "window-mold"));
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
  assert.ok(wholeHouse.some((item) => item.value === "random-light-flicker"));
  assert.ok(wholeHouse.some((item) => item.value === "outlet-buzzing"));
  assert.ok(wholeHouse.some((item) => item.value === "window-condensation"));
  assert.ok(wholeHouse.some((item) => item.value === "window-mold"));

  const kitchen = getFinderSymptomOptions("kitchen");
  assert.ok(kitchen.some((item) => item.value === "appliance-light-flicker"));
  assert.ok(kitchen.some((item) => item.value === "dishwasher-drying"));
  assert.ok(kitchen.some((item) => item.value === "dishwasher-cleaning"));
  assert.ok(kitchen.some((item) => item.value === "sink-drain-leak"));
  assert.ok(kitchen.some((item) => item.value === "window-condensation"));
  assert.ok(getFinderSymptomOptions("bedroom").some((item) => item.value === "window-condensation"));
  assert.ok(getFinderSymptomOptions("living-area").some((item) => item.value === "window-condensation"));
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "appliance-light-flicker"));
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "random-light-flicker"));
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "dishwasher-drying"));
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "dishwasher-cleaning"));
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "window-condensation"));

  const laundry = getFinderSymptomOptions("laundry");
  assert.ok(laundry.some((item) => item.value === "dryer-burning-smell"));
  assert.ok(laundry.some((item) => item.value === "dryer-shuts-off"));
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "dryer-burning-smell"));
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "dryer-shuts-off"));
});

test("Problem Finder ranks exact location and symptom matches without unrelated leakage", () => {
  assert.equal(rankFinderArticles(registry, "bathroom", "drainage")[0].article.slug, "toilet-bubbles-when-washer-drains");
  assert.equal(rankFinderArticles(registry, "bathroom", "toilet-gurgling")[0].article.slug, "toilet-gurgles-randomly");
  assert.equal(rankFinderArticles(registry, "bathroom", "toilet-water-level")[0].article.slug, "toilet-water-rises-when-another-toilet-flushes");
  assert.equal(rankFinderArticles(registry, "bathroom", "shower-gurgling")[0].article.slug, "shower-drain-gurgles-when-toilet-flushes");
  assert.equal(rankFinderArticles(registry, "bathroom", "sink-drain-leak")[0].article.slug, "sink-leaking-from-drain");
  assert.equal(rankFinderArticles(registry, "bathroom", "bath-water-sediment")[0].article.slug, "sediment-in-bath-water");
  assert.equal(rankFinderArticles(registry, "bathroom", "window-condensation")[0].article.slug, "condensation-inside-windows");
  assert.equal(rankFinderArticles(registry, "bathroom", "window-mold")[0].article.slug, "mold-growing-around-windows");
  assert.equal(rankFinderArticles(registry, "attic", "moisture")[0].article.slug, "ac-ductwork-sweating-in-attic");
  assert.equal(rankFinderArticles(registry, "attic", "air-handler-sweating")[0].article.slug, "air-handler-sweating");
  assert.equal(rankFinderArticles(registry, "whole-house", "moisture")[0].article.slug, "house-humid-with-ac-running");
  assert.equal(rankFinderArticles(registry, "whole-house", "hvac-filter")[0].article.slug, "ac-filter-wet");
  assert.equal(rankFinderArticles(registry, "whole-house", "leaking")[0].article.slug, "water-around-indoor-ac-unit");
  assert.equal(rankFinderArticles(registry, "whole-house", "air-handler-sweating")[0].article.slug, "air-handler-sweating");
  assert.equal(rankFinderArticles(registry, "whole-house", "multiple-drains")[0].article.slug, "multiple-drains-back-up-at-same-time");
  assert.equal(rankFinderArticles(registry, "whole-house", "appliance-light-flicker")[0].article.slug, "lights-flicker-when-appliance-turns-on");
  assert.equal(rankFinderArticles(registry, "whole-house", "random-light-flicker")[0].article.slug, "lights-flicker-randomly");
  assert.equal(rankFinderArticles(registry, "whole-house", "outlet-buzzing")[0].article.slug, "outlet-buzzing");
  assert.equal(rankFinderArticles(registry, "whole-house", "window-condensation")[0].article.slug, "condensation-inside-windows");
  assert.equal(rankFinderArticles(registry, "whole-house", "window-mold")[0].article.slug, "mold-growing-around-windows");
  assert.equal(rankFinderArticles(registry, "kitchen", "appliance-light-flicker")[0].article.slug, "lights-flicker-when-appliance-turns-on");
  assert.equal(rankFinderArticles(registry, "kitchen", "dishwasher-drying")[0].article.slug, "dishwasher-not-drying-dishes");
  assert.equal(rankFinderArticles(registry, "kitchen", "dishwasher-cleaning")[0].article.slug, "dishwasher-not-cleaning-dishes");
  assert.equal(rankFinderArticles(registry, "kitchen", "sink-drain-leak")[0].article.slug, "sink-leaking-from-drain");
  assert.equal(rankFinderArticles(registry, "kitchen", "window-condensation")[0].article.slug, "condensation-inside-windows");
  assert.equal(rankFinderArticles(registry, "bedroom", "window-condensation")[0].article.slug, "condensation-inside-windows");
  assert.equal(rankFinderArticles(registry, "living-area", "window-condensation")[0].article.slug, "condensation-inside-windows");
  assert.equal(rankFinderArticles(registry, "laundry", "appliance-behavior")[0].article.slug, "dryer-taking-two-cycles");
  assert.equal(rankFinderArticles(registry, "laundry", "dryer-burning-smell")[0].article.slug, "dryer-smells-like-burning");
  assert.equal(rankFinderArticles(registry, "laundry", "dryer-shuts-off")[0].article.slug, "dryer-keeps-shutting-off");
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
    ["bathroom", "window-condensation"],
    ["bathroom", "smell"],
    ["bathroom", "noise"],
    ["whole-house", "moisture"],
    ["whole-house", "window-condensation"],
    ["whole-house", "window-mold"],
    ["whole-house", "multiple-drains"],
    ["whole-house", "hvac-filter"],
    ["whole-house", "air-handler-sweating"],
    ["whole-house", "appliance-light-flicker"],
    ["whole-house", "random-light-flicker"],
    ["whole-house", "outlet-buzzing"],
    ["kitchen", "appliance-light-flicker"],
    ["kitchen", "dishwasher-drying"],
    ["kitchen", "dishwasher-cleaning"],
    ["kitchen", "window-condensation"],
    ["bedroom", "window-condensation"],
    ["living-area", "window-condensation"],
    ["laundry", "appliance-behavior"],
    ["laundry", "dryer-burning-smell"],
    ["laundry", "dryer-shuts-off"],
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
  assert.equal(rankFinderArticles(registry, "whole-house", "random-light-flicker")[0].article.slug, "lights-flicker-randomly");
  assert.equal(rankFinderArticles(registry, "laundry", "appliance-behavior")[0].article.slug, "dryer-taking-two-cycles");
  assert.equal(rankFinderArticles(registry, "laundry", "dryer-burning-smell")[0].article.slug, "dryer-smells-like-burning");
  assert.equal(rankFinderArticles(registry, "laundry", "dryer-shuts-off")[0].article.slug, "dryer-keeps-shutting-off");
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

test("every symptom article is reachable through Finder while the register solution guide stays search-only", () => {
  const reachable = new Set();
  for (const { value: location } of finderLocations) {
    for (const symptom of getFinderSymptomOptions(location)) {
      for (const { article } of rankFinderArticles(registry, location, symptom.value)) reachable.add(article.slug);
    }
  }
  assert.deepEqual([...registry.map((article) => article.slug).filter((slug) => !reachable.has(slug))], ["can-replacing-registers-improve-airflow"]);
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
    ["bedroom smells musty", "bedroom-smells-musty"],
    ["musty smell in bedroom", "bedroom-smells-musty"],
    ["bedroom smells damp", "bedroom-smells-musty"],
    ["bedroom smells like mildew", "bedroom-smells-musty"],
    ["bedroom smells musty in morning", "bedroom-smells-musty"],
    ["musty smell near bedroom window", "bedroom-smells-musty"],
    ["room smells musty after rain", "bedroom-smells-musty"],
    ["bedroom smells musty but no mold", "bedroom-smells-musty"],
    ["warm outlet", "outlet-warm"],
    ["outlet buzzing", "outlet-buzzing"],
    ["why does my outlet buzz", "outlet-buzzing"],
    ["electrical outlet buzzing", "outlet-buzzing"],
    ["outlet making buzzing noise", "outlet-buzzing"],
    ["wall outlet buzzing", "outlet-buzzing"],
    ["outlet humming", "outlet-buzzing"],
    ["buzzing sound from outlet", "outlet-buzzing"],
    ["outlet buzzes when something plugged in", "outlet-buzzing"],
    ["lights flicker when appliance turns on", "lights-flicker-when-appliance-turns-on"],
    ["why do my lights flicker when appliance turns on", "lights-flicker-when-appliance-turns-on"],
    ["lights dim when ac turns on", "lights-flicker-when-appliance-turns-on"],
    ["lights flicker when refrigerator starts", "lights-flicker-when-appliance-turns-on"],
    ["lights dim when microwave runs", "lights-flicker-when-appliance-turns-on"],
    ["lights flicker when washer starts", "lights-flicker-when-appliance-turns-on"],
    ["lights flicker when dryer runs", "lights-flicker-when-appliance-turns-on"],
    ["lights blink when compressor starts", "lights-flicker-when-appliance-turns-on"],
    ["lights flicker randomly", "lights-flicker-randomly"],
    ["lights randomly flicker", "lights-flicker-randomly"],
    ["house lights flicker randomly", "lights-flicker-randomly"],
    ["lights flicker for no reason", "lights-flicker-randomly"],
    ["lights occasionally flicker", "lights-flicker-randomly"],
    ["lights flicker intermittently", "lights-flicker-randomly"],
    ["random lights flickering in house", "lights-flicker-randomly"],
    ["mold around windows", "mold-growing-around-windows"],
    ["mold growing around window", "mold-growing-around-windows"],
    ["mold on window sill", "mold-growing-around-windows"],
    ["mold around window frame", "mold-growing-around-windows"],
    ["mold around windows in winter", "mold-growing-around-windows"],
    ["mold around bedroom window", "mold-growing-around-windows"],
    ["mold around bathroom window", "mold-growing-around-windows"],
    ["why do my windows get moldy", "mold-growing-around-windows"],
    ["mold on ceiling", "mold-growing-on-ceiling"],
    ["mold growing on ceiling", "mold-growing-on-ceiling"],
    ["ceiling mold", "mold-growing-on-ceiling"],
    ["mold spots on ceiling", "mold-growing-on-ceiling"],
    ["mold on bathroom ceiling", "mold-growing-on-ceiling"],
    ["mold on bedroom ceiling", "mold-growing-on-ceiling"],
    ["mold in ceiling corner", "mold-growing-on-ceiling"],
    ["mold keeps coming back on ceiling", "mold-growing-on-ceiling"],
    ["mold in attic", "mold-in-attic"],
    ["attic mold", "mold-in-attic"],
    ["mold on attic wood", "mold-in-attic"],
    ["mold on roof sheathing", "mold-in-attic"],
    ["mold on attic rafters", "mold-in-attic"],
    ["mold on attic trusses", "mold-in-attic"],
    ["mold growing in attic", "mold-in-attic"],
    ["attic mold from condensation", "mold-in-attic"],
    ["mold in attic but roof not leaking", "mold-in-attic"],
    ["black spots on attic wood", "mold-in-attic"],
    ["water stain on ceiling", "water-stain-on-ceiling"],
    ["why is there a water stain on my ceiling", "water-stain-on-ceiling"],
    ["brown water stain on ceiling", "water-stain-on-ceiling"],
    ["brown spot on ceiling", "water-stain-on-ceiling"],
    ["yellow stain on ceiling", "water-stain-on-ceiling"],
    ["water mark on ceiling", "water-stain-on-ceiling"],
    ["ceiling water stain", "water-stain-on-ceiling"],
    ["old water stain on ceiling", "water-stain-on-ceiling"],
    ["dry water stain on ceiling", "water-stain-on-ceiling"],
    ["ceiling stain below bathroom", "water-stain-on-ceiling"],
    ["ceiling stain getting bigger", "water-stain-on-ceiling"],
    ["ceiling wet after rain", "ceiling-wet-after-rain"],
    ["ceiling gets wet when it rains", "ceiling-wet-after-rain"],
    ["wet spot on ceiling after rain", "ceiling-wet-after-rain"],
    ["ceiling damp after rain", "ceiling-wet-after-rain"],
    ["ceiling leaking when it rains", "ceiling-wet-after-rain"],
    ["ceiling leak only when it rains", "ceiling-wet-after-rain"],
    ["ceiling stain gets darker when it rains", "ceiling-wet-after-rain"],
    ["water coming through ceiling during rain", "ceiling-wet-after-rain"],
    ["ceiling wet after heavy rain", "ceiling-wet-after-rain"],
    ["ceiling leak during wind driven rain", "ceiling-wet-after-rain"],
    ["walls sweating", "walls-sweating"],
    ["why are my walls sweating", "walls-sweating"],
    ["condensation on walls", "walls-sweating"],
    ["water droplets on walls", "walls-sweating"],
    ["interior walls sweating", "walls-sweating"],
    ["walls wet from condensation", "walls-sweating"],
    ["walls sweating in summer", "walls-sweating"],
    ["walls sweating in winter", "walls-sweating"],
    ["bathroom walls sweating", "walls-sweating"],
    ["moisture forming on walls", "walls-sweating"],
    ["wet spot on wall", "wet-spot-on-wall"],
    ["damp spot on wall", "wet-spot-on-wall"],
    ["wet patch on wall", "wet-spot-on-wall"],
    ["wall wet in one spot", "wet-spot-on-wall"],
    ["random wet spot on wall", "wet-spot-on-wall"],
    ["damp patch on interior wall", "wet-spot-on-wall"],
    ["wet spot on drywall", "wet-spot-on-wall"],
    ["moisture spot on wall", "wet-spot-on-wall"],
    ["wall feels wet", "wet-spot-on-wall"],
    ["unexplained wet spot on wall", "wet-spot-on-wall"],
    ["wall wet after rain", "wall-wet-after-rain"],
    ["wall gets wet when it rains", "wall-wet-after-rain"],
    ["wet spot on wall after rain", "wall-wet-after-rain"],
    ["damp wall after rain", "wall-wet-after-rain"],
    ["interior wall wet after rain", "wall-wet-after-rain"],
    ["wall leaking when it rains", "wall-wet-after-rain"],
    ["wall wet during heavy rain", "wall-wet-after-rain"],
    ["wall wet after storm", "wall-wet-after-rain"],
    ["water coming through wall when it rains", "wall-wet-after-rain"],
    ["wall only gets wet when it rains", "wall-wet-after-rain"],
    ["condensation inside windows", "condensation-inside-windows"],
    ["windows wet on inside", "condensation-inside-windows"],
    ["window sweating inside", "condensation-inside-windows"],
    ["moisture on inside of windows", "condensation-inside-windows"],
    ["windows foggy inside", "condensation-inside-windows"],
    ["wet windows in morning", "condensation-inside-windows"],
    ["condensation on interior window glass", "condensation-inside-windows"],
    ["condensation between window panes", "condensation-between-window-panes"],
    ["moisture between window panes", "condensation-between-window-panes"],
    ["fog between double pane windows", "condensation-between-window-panes"],
    ["double pane window fogging", "condensation-between-window-panes"],
    ["condensation inside double pane window", "condensation-between-window-panes"],
    ["water between window panes", "condensation-between-window-panes"],
    ["cloudy between window panes", "condensation-between-window-panes"],
    ["haze between window panes", "condensation-between-window-panes"],
    ["window seal failed", "condensation-between-window-panes"],
    ["foggy insulated glass", "condensation-between-window-panes"],
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
    ["dryer keeps shutting off", "dryer-keeps-shutting-off"],
    ["dryer shuts off mid cycle", "dryer-keeps-shutting-off"],
    ["dryer stops after a few minutes", "dryer-keeps-shutting-off"],
    ["dryer starts then stops", "dryer-keeps-shutting-off"],
    ["dryer keeps stopping", "dryer-keeps-shutting-off"],
    ["dryer turns off while drying", "dryer-keeps-shutting-off"],
    ["dryer stops before cycle finishes", "dryer-keeps-shutting-off"],
    ["dryer stops and starts again later", "dryer-keeps-shutting-off"],
    ["dishwasher not drying dishes", "dishwasher-not-drying-dishes"],
    ["why is my dishwasher not drying dishes", "dishwasher-not-drying-dishes"],
    ["dishwasher leaves dishes wet", "dishwasher-not-drying-dishes"],
    ["dishes wet after dishwasher", "dishwasher-not-drying-dishes"],
    ["dishwasher not drying plastic", "dishwasher-not-drying-dishes"],
    ["dishwasher dishes still wet", "dishwasher-not-drying-dishes"],
    ["dishwasher not drying after cycle", "dishwasher-not-drying-dishes"],
    ["dishwasher not drying properly", "dishwasher-not-drying-dishes"],
    ["dishwasher not cleaning dishes", "dishwasher-not-cleaning-dishes"],
    ["why is my dishwasher not cleaning dishes", "dishwasher-not-cleaning-dishes"],
    ["dishwasher leaves food on dishes", "dishwasher-not-cleaning-dishes"],
    ["dishes still dirty after dishwasher", "dishwasher-not-cleaning-dishes"],
    ["dishwasher not washing properly", "dishwasher-not-cleaning-dishes"],
    ["dishwasher leaves dishes greasy", "dishwasher-not-cleaning-dishes"],
    ["dishwasher top rack not cleaning", "dishwasher-not-cleaning-dishes"],
    ["dishwasher bottom rack not cleaning", "dishwasher-not-cleaning-dishes"],
    ["sediment in bath water", "sediment-in-bath-water"],
    ["particles in bath water", "sediment-in-bath-water"],
    ["grit in bathtub water", "sediment-in-bath-water"],
    ["dirt in bathtub water", "sediment-in-bath-water"],
    ["sand in bath water", "sediment-in-bath-water"],
    ["brown particles in bathtub", "sediment-in-bath-water"],
    ["black specks in bath water", "sediment-in-bath-water"],
    ["white flakes in bathtub water", "sediment-in-bath-water"],
    ["sediment coming from bathtub faucet", "sediment-in-bath-water"],
    ["sink leaking from drain", "sink-leaking-from-drain"],
    ["sink drain leaking", "sink-leaking-from-drain"],
    ["bathroom sink leaking from drain", "sink-leaking-from-drain"],
    ["kitchen sink leaking from drain", "sink-leaking-from-drain"],
    ["sink leaking underneath when draining", "sink-leaking-from-drain"],
    ["sink tailpiece leaking", "sink-leaking-from-drain"],
    ["leak at sink drain pipe", "sink-leaking-from-drain"],
    ["water leaking from drain under sink", "sink-leaking-from-drain"],
    ["dryer takes two cycles", "dryer-taking-two-cycles"],
    ["dryer not drying clothes", "dryer-taking-two-cycles"],
    ["dryer takes forever to dry", "dryer-taking-two-cycles"],
    ["clothes still damp after dryer", "dryer-taking-two-cycles"],
    ["water heater leak", "water-under-water-heater"],
    ["toilet bubblng", "toilet-bubbles-when-washer-drains"],
  ];
  for (const [query, expected] of cases) assert.equal(searchArticles(registry, query)[0]?.slug, expected, query);
  assert.deepEqual(searchArticles(registry, "yard standing water"), []);
  assert.equal(searchArticles(registry, "lights flicker randomly")[0]?.slug, "lights-flicker-randomly");
  assert.equal(searchArticles(registry, "dishwasher not cleaning dishes")[0]?.slug, "dishwasher-not-cleaning-dishes");
  assert.notEqual(searchArticles(registry, "dishwasher not draining")[0]?.slug, "dishwasher-not-drying-dishes");
  assert.notEqual(searchArticles(registry, "dishwasher not draining")[0]?.slug, "dishwasher-not-cleaning-dishes");
  assert.notEqual(searchArticles(registry, "dishwasher leaking")[0]?.slug, "dishwasher-not-cleaning-dishes");
  assert.notEqual(searchArticles(registry, "dishwasher smells bad")[0]?.slug, "dishwasher-not-cleaning-dishes");
  assert.equal(searchArticles(registry, "dishwasher not drying dishes")[0]?.slug, "dishwasher-not-drying-dishes");
  for (const query of ["condensation between window panes", "window leaking when it rains", "mold around windows"]) assert.notEqual(searchArticles(registry, query)[0]?.slug, "condensation-inside-windows", query);
  for (const query of ["condensation inside windows", "condensation on inside of windows", "windows wet inside", "mold around windows", "wet window sill", "window leaking when it rains", "water around window frame", "house humid with ac running"]) assert.notEqual(searchArticles(registry, query)[0]?.slug, "condensation-between-window-panes", query);
  assert.equal(searchArticles(registry, "house humid with ac running")[0]?.slug, "house-humid-with-ac-running");
  assert.equal(searchArticles(registry, "water dripping from ac vent")[0]?.slug, "water-dripping-from-ac-vent");
  for (const query of ["condensation inside windows", "condensation between window panes", "window leaking when it rains", "windows wet in morning", "house humid with ac running", "garage smells musty"]) assert.notEqual(searchArticles(registry, query)[0]?.slug, "mold-growing-around-windows", query);
  assert.notEqual(searchArticles(registry, "charger buzzing")[0]?.slug, "outlet-buzzing");
  for (const query of ["brown hot water", "cloudy water", "black specks in faucet water", "water heater sediment", "sediment in hot water", "bathtub drain clogged", "dirt coming up from bathtub drain", "water heater leaking"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "sediment-in-bath-water", query);
  }
  for (const query of ["sink supply line leaking", "faucet leaking under sink", "sink drains slowly", "sink gurgles", "dishwasher leaking", "garbage disposal leaking"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "sink-leaking-from-drain", query);
  }
  assert.equal(searchArticles(registry, "outlet warm")[0]?.slug, "outlet-warm");
  assert.equal(searchArticles(registry, "lights flicker when appliance starts")[0]?.slug, "lights-flicker-when-appliance-turns-on");
  for (const query of ["lights flicker when appliance turns on", "lights flicker when ac turns on", "lights dim when ac starts", "lights flicker when dryer starts"]) {
    assert.equal(searchArticles(registry, query)[0]?.slug, "lights-flicker-when-appliance-turns-on", query);
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "lights-flicker-randomly", query);
  }
  for (const query of ["dryer not heating", "dryer will not start", "dryer trips breaker"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "dryer-keeps-shutting-off", query);
  }
  for (const query of ["water stain on ceiling", "ceiling wet after rain", "mold around windows", "condensation inside windows", "water dripping from ac vent", "house humid with ac running"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "mold-growing-on-ceiling", query);
  }
  for (const query of ["mold on ceiling", "ceiling mold", "water stain on ceiling", "ceiling wet after rain", "attic damp", "condensation in attic", "frost in attic", "ductwork sweating in attic", "water around air handler", "why is my roof leaking"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "mold-in-attic", query);
  }
  for (const query of ["water stain on ceiling", "mold on ceiling", "water dripping from ceiling", "ceiling sagging", "mold in attic", "attic condensation", "ductwork sweating in attic", "water dripping from ac vent", "water around indoor ac unit", "plumbing leak through ceiling"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "ceiling-wet-after-rain", query);
  }
  for (const query of ["mold on ceiling", "ceiling mold", "ceiling wet after rain", "ceiling stain after rain", "water dripping from ceiling", "ceiling sagging", "ceiling bulging", "mold in attic", "water dripping from ac vent", "water around indoor ac unit"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "water-stain-on-ceiling", query);
  }
  for (const query of ["wet spot on wall", "wall wet after rain", "mold on wall", "mold around windows", "condensation inside windows", "ceiling mold", "water dripping from ac vent", "house humid with ac running"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "walls-sweating", query);
  }
  for (const query of ["walls sweating", "condensation on walls", "wall wet after rain", "mold on wall", "bubbling paint", "soft drywall", "window leaking when it rains", "mold around windows", "condensation inside windows", "water stain on ceiling", "ceiling wet after rain"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "wet-spot-on-wall", query);
  }
  for (const query of ["wet spot on wall", "walls sweating", "condensation on walls", "mold on wall", "bubbling paint", "soft drywall", "window leaking when it rains", "ceiling wet after rain", "water stain on ceiling", "house humid with ac running"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "wall-wet-after-rain", query);
  }
});

test("between-pane window Finder paths stay separate from exposed-surface condensation", () => {
  for (const location of ["bathroom", "kitchen", "bedroom", "living-area", "whole-house"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "window-between-panes"), location);
    assert.equal(rankFinderArticles(registry, location, "window-between-panes")[0]?.article.slug, "condensation-between-window-panes", location);
  }
  for (const location of ["yard", "garage", "attic", "laundry"]) assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "window-between-panes"), location);
});

test("bedroom musty-smell Finder path is narrow and preserves neighboring odor intents", () => {
  assert.ok(getFinderSymptomOptions("bedroom").some((item) => item.value === "bedroom-musty-smell"));
  assert.equal(rankFinderArticles(registry, "bedroom", "bedroom-musty-smell")[0]?.article.slug, "bedroom-smells-musty");
  for (const query of ["garage smells musty","mold around window","condensation inside windows","house humid with ac running","house smells musty when ac turns on","closet smells musty","carpet smells musty"]) assert.notEqual(searchArticles(registry,query)[0]?.slug,"bedroom-smells-musty",query);
});


test("attic-mold Finder path remains attic-specific and separate from generic attic moisture", () => {
  assert.ok(getFinderSymptomOptions("attic").some((item) => item.value === "attic-mold"));
  assert.equal(rankFinderArticles(registry, "attic", "attic-mold")[0]?.article.slug, "mold-in-attic");
  for (const location of ["yard", "garage", "bathroom", "bedroom", "living-area"]) assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "attic-mold"), location);
});

test("ceiling-mold Finder paths stay location-specific and separate from window growth", () => {
  for (const location of ["bathroom", "bedroom", "living-area", "whole-house"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "ceiling-mold"), location);
    assert.equal(rankFinderArticles(registry, location, "ceiling-mold")[0]?.article.slug, "mold-growing-on-ceiling", location);
  }
  assert.ok(!getFinderSymptomOptions("yard").some((item) => item.value === "ceiling-mold"));
  assert.ok(!getFinderSymptomOptions("garage").some((item) => item.value === "ceiling-mold"));
});


test("rain-wet ceiling Finder paths remain location-specific and separate from generic stains", () => {
  for (const location of ["bathroom", "bedroom", "living-area", "whole-house"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "ceiling-rain"), location);
    assert.equal(rankFinderArticles(registry, location, "ceiling-rain")[0]?.article.slug, "ceiling-wet-after-rain", location);
  }
  for (const location of ["yard", "garage", "attic"]) assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "ceiling-rain"), location);
});

test("ceiling-stain Finder paths stay narrow and separate from active ceiling hazards", () => {
  for (const location of ["bathroom", "bedroom", "living-area", "whole-house"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "ceiling-stain"), location);
    assert.equal(rankFinderArticles(registry, location, "ceiling-stain")[0]?.article.slug, "water-stain-on-ceiling", location);
  }
  for (const location of ["yard", "garage", "attic"]) assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "ceiling-stain"), location);
});

test("localized wall-wet-spot Finder paths stay separate from broad condensation", () => {
  for (const location of ["bathroom", "kitchen", "bedroom", "living-area", "laundry"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "wall-wet-spot"), location);
    assert.equal(rankFinderArticles(registry, location, "wall-wet-spot")[0]?.article.slug, "wet-spot-on-wall", location);
  }
  for (const location of ["yard", "garage", "attic", "exterior", "whole-house"]) assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "wall-wet-spot"), location);
});

test("rain-related wall Finder paths remain narrow and separate from generic wet spots", () => {
  for (const location of ["bathroom", "kitchen", "bedroom", "living-area", "laundry"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "wall-rain"), location);
    assert.equal(rankFinderArticles(registry, location, "wall-rain")[0]?.article.slug, "wall-wet-after-rain", location);
  }
  for (const location of ["yard", "garage", "attic", "exterior", "whole-house"]) assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "wall-rain"), location);
});

test("sweating-wall Finder paths preserve localized leak and mold distinctions", () => {
  for (const location of ["bathroom", "bedroom", "living-area", "whole-house"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "walls-sweating"), location);
    assert.equal(rankFinderArticles(registry, location, "walls-sweating")[0]?.article.slug, "walls-sweating", location);
  }
  for (const location of ["yard", "garage", "attic"]) assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "walls-sweating"), location);
});

test("window-rain Finder and search paths remain distinct from wall moisture and condensation", () => {
  const positives = [
    "window leaking when it rains",
    "window leaks during rain",
    "rain coming through window",
    "water around window after rain",
    "window leaking during heavy rain",
    "window leaks only when it rains",
    "water at top of window when it rains",
    "water at bottom of window after rain",
    "water leaking beside window during rain",
    "window leaking during wind driven rain",
  ];
  for (const query of positives) assert.equal(searchArticles(registry, query)[0]?.slug, "window-leaking-when-it-rains", query);
  for (const query of ["wall wet after rain", "wet spot on wall", "condensation inside windows", "condensation between window panes", "window sill wet", "mold around windows", "walls sweating", "ceiling wet after rain", "water stain on ceiling"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "window-leaking-when-it-rains", query);
  }
  for (const location of ["bathroom", "kitchen", "bedroom", "living-area", "whole-house"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "window-rain"), location);
    assert.equal(rankFinderArticles(registry, location, "window-rain")[0]?.article.slug, "window-leaking-when-it-rains", location);
  }
  for (const location of ["yard", "garage", "attic", "laundry", "exterior"]) assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "window-rain"), location);
});

test("toilet-triggered sink gurgling Finder and search stay distinct from neighboring drainage intents", () => {
  const positives = [
    "sink gurgles when toilet flushes",
    "sink gurgling when toilet flushes",
    "bathroom sink gurgles when toilet flushes",
    "kitchen sink gurgles when toilet flushes",
    "toilet flush makes sink gurgle",
    "sink bubbles when toilet flushes",
    "sink water rises when toilet flushes",
    "sink makes noise when toilet flushes",
  ];
  for (const query of positives) assert.equal(searchArticles(registry, query)[0]?.slug, "sink-gurgles-when-toilet-flushes", query);
  for (const query of ["shower drain gurgles when toilet flushes", "toilet water rises when another toilet flushes", "toilet gurgles randomly", "toilet bubbles when washer drains", "multiple drains back up", "sink gurgles when washer drains", "sink gurgles", "slow sink"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "sink-gurgles-when-toilet-flushes", query);
  }
  for (const location of ["bathroom", "kitchen"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "sink-toilet-gurgling"), location);
    assert.equal(rankFinderArticles(registry, location, "sink-toilet-gurgling")[0]?.article.slug, "sink-gurgles-when-toilet-flushes", location);
  }
  for (const location of ["yard", "garage", "attic", "laundry", "bedroom", "living-area", "exterior", "whole-house"]) {
    assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "sink-toilet-gurgling"), location);
  }
});

test("register replacement search intent stays separate from weak-airflow symptoms and Finder", () => {
  const positives = ["can replacing hvac registers improve airflow", "will new registers improve airflow", "do new air vents improve airflow", "can old registers restrict airflow", "replacing air vents increase airflow", "bigger register improve airflow", "restrictive hvac register", "decorative register airflow", "register size airflow", "old floor registers airflow"];
  for (const query of positives) assert.equal(searchArticles(registry, query)[0]?.slug, "can-replacing-registers-improve-airflow", query);
  for (const query of ["weak airflow from vents", "one room not getting enough air", "hvac register sizing", "should i close vents in unused rooms", "filter restriction", "duct restriction", "duct leakage", "hvac balancing", "return air problems"]) assert.notEqual(searchArticles(registry, query)[0]?.slug, "can-replacing-registers-improve-airflow", query);
  for (const { value: location } of finderLocations) for (const symptom of getFinderSymptomOptions(location)) assert.ok(!rankFinderArticles(registry, location, symptom.value).some(({ article }) => article.slug === "can-replacing-registers-improve-airflow"), `${location}/${symptom.value}`);
});

test("one-vent weak-airflow Finder and search stay distinct from broader airflow intents", () => {
  const positives = [
    "weak airflow from one vent",
    "one vent has weak airflow",
    "one vent barely blowing",
    "one air vent barely blowing",
    "one vent not blowing much air",
    "low airflow one vent",
    "one ac vent weak",
    "one hvac vent weak",
    "one register has less airflow",
    "why is one vent weaker than the others",
    "air barely coming out of one vent",
    "one supply vent weak",
  ];
  for (const query of positives) assert.equal(searchArticles(registry, query)[0]?.slug, "weak-airflow-from-one-vent", query);
  for (const query of ["weak airflow from all vents", "house has weak airflow", "one room not getting enough air", "room stays hot", "replace hvac registers", "register size airflow", "close unused vents", "return vent airflow", "duct leakage", "dirty filter"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "weak-airflow-from-one-vent", query);
  }
  for (const location of ["bedroom", "living-area", "whole-house"]) {
    assert.ok(getFinderSymptomOptions(location).some((item) => item.value === "one-vent-weak-airflow"), location);
    assert.equal(rankFinderArticles(registry, location, "one-vent-weak-airflow")[0]?.article.slug, "weak-airflow-from-one-vent", location);
  }
  for (const location of ["yard", "garage", "attic", "bathroom", "kitchen", "laundry", "exterior"]) {
    assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "one-vent-weak-airflow"), location);
  }
});

test("breaker-tripping Finder and search preserve neighboring electrical intents", () => {
  const positives = [
    "circuit breaker keeps tripping",
    "breaker keeps tripping",
    "breaker trips repeatedly",
    "breaker keeps flipping",
    "breaker trips immediately",
    "breaker trips after a few minutes",
    "breaker randomly trips",
    "breaker trips when appliance turns on",
    "breaker trips when several things run",
    "GFCI breaker keeps tripping",
    "AFCI breaker keeps tripping",
  ];
  for (const query of positives) assert.equal(searchArticles(registry, query)[0]?.slug, "circuit-breaker-keeps-tripping", query);
  for (const query of ["lights flicker when appliance turns on", "lights flicker randomly", "outlet warm", "outlet buzzing", "GFCI outlet keeps tripping", "breaker will not reset", "breaker won't stay on", "power keeps going out", "one outlet has no power"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "circuit-breaker-keeps-tripping", query);
  }
  assert.ok(getFinderSymptomOptions("whole-house").some((item) => item.value === "breaker-tripping"));
  assert.equal(rankFinderArticles(registry, "whole-house", "breaker-tripping")[0]?.article.slug, "circuit-breaker-keeps-tripping");
  for (const location of ["yard", "garage", "attic", "bathroom", "kitchen", "laundry", "bedroom", "living-area", "exterior"]) {
    assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "breaker-tripping"), location);
  }
});

test("breaker-reset Finder and search preserve recurring-trip and neighboring electrical intents", () => {
  const positives = [
    "circuit breaker won't reset",
    "breaker won't reset",
    "breaker will not reset",
    "breaker won't stay on",
    "breaker keeps flipping off",
    "breaker trips immediately when reset",
    "breaker won't turn back on",
    "breaker won't stay reset",
    "GFCI breaker won't reset",
    "AFCI breaker won't reset",
  ];
  for (const query of positives) assert.equal(searchArticles(registry, query)[0]?.slug, "circuit-breaker-wont-reset", query);
  for (const query of ["circuit breaker keeps tripping", "breaker trips when appliance starts", "GFCI outlet won't reset", "outlet warm", "outlet buzzing", "lights flicker when appliance turns on", "lights flicker randomly", "power out in one room"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "circuit-breaker-wont-reset", query);
  }
  assert.ok(getFinderSymptomOptions("whole-house").some((item) => item.value === "breaker-wont-reset"));
  assert.equal(rankFinderArticles(registry, "whole-house", "breaker-wont-reset")[0]?.article.slug, "circuit-breaker-wont-reset");
  for (const location of ["yard", "garage", "attic", "bathroom", "kitchen", "laundry", "bedroom", "living-area", "exterior"]) {
    assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "breaker-wont-reset"), location);
  }
});

test("one-room power-loss Finder and search preserve narrower and broader outage intents", () => {
  const positives = [
    "why is there no power in one room",
    "no power in one room",
    "one room has no power",
    "power out in one room",
    "one room lost power",
    "no electricity in one room",
    "bedroom has no power",
    "lights and outlets not working in one room",
    "some outlets and lights not working in one room",
    "one room has no power but breaker is not tripped",
  ];
  for (const query of positives) assert.equal(searchArticles(registry, query)[0]?.slug, "no-power-in-one-room", query);
  for (const query of ["one outlet has no power", "GFCI outlet won't reset", "half the house has no power", "whole house has no power", "breaker keeps tripping", "breaker won't reset", "lights flicker randomly", "outlet warm", "outlet buzzing", "electrical panel buzzing"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "no-power-in-one-room", query);
  }
  assert.ok(getFinderSymptomOptions("whole-house").some((item) => item.value === "one-room-no-power"));
  assert.equal(rankFinderArticles(registry, "whole-house", "one-room-no-power")[0]?.article.slug, "no-power-in-one-room");
  for (const location of ["yard", "garage", "attic", "basement", "bathroom", "kitchen", "laundry", "bedroom", "living-area", "exterior"]) {
    assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "one-room-no-power"), location);
  }
});

test("one-outlet power-loss Finder and search preserve broader outage and neighboring electrical intents", () => {
  const positives = [
    "why does one outlet have no power",
    "one outlet has no power",
    "one outlet not working",
    "one electrical outlet not working",
    "dead outlet",
    "one receptacle not working",
    "outlet stopped working",
    "outlet dead but breaker not tripped",
    "one outlet dead rest work",
    "half outlet not working",
    "top outlet works bottom doesn't",
    "outlet controlled by switch",
  ];
  for (const query of positives) assert.equal(searchArticles(registry, query)[0]?.slug, "one-outlet-has-no-power", query);
  for (const query of ["no power in one room", "breaker keeps tripping", "breaker won't reset", "GFCI outlet won't reset", "outlet warm", "outlet buzzing", "half the house has no power", "whole house has no power"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "one-outlet-has-no-power", query);
  }
  assert.ok(getFinderSymptomOptions("whole-house").some((item) => item.value === "one-outlet-no-power"));
  assert.equal(rankFinderArticles(registry, "whole-house", "one-outlet-no-power")[0]?.article.slug, "one-outlet-has-no-power");
  for (const location of ["yard", "garage", "attic", "basement", "bathroom", "kitchen", "laundry", "bedroom", "living-area", "exterior"]) {
    assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "one-outlet-no-power"), location);
  }
});

test("GFCI reset Finder and search preserve breaker, outage, warning, and later-trip intents", () => {
  const positives = [
    "why won't my GFCI outlet reset",
    "GFCI outlet won't reset",
    "GFCI will not reset",
    "GFCI won't stay reset",
    "GFCI reset button won't stay in",
    "GFCI immediately trips after reset",
    "GFCI outlet has no power and won't reset",
    "bathroom GFCI won't reset",
    "kitchen GFCI won't reset",
    "garage GFCI won't reset",
    "GFCI reset button won't latch",
  ];
  for (const query of positives) assert.equal(searchArticles(registry, query)[0]?.slug, "gfci-outlet-wont-reset", query);
  for (const query of ["GFCI outlet keeps tripping later", "GFCI breaker won't reset", "one outlet has no power", "no power in one room", "breaker won't reset", "breaker keeps tripping", "outlet warm", "outlet buzzing"]) {
    assert.notEqual(searchArticles(registry, query)[0]?.slug, "gfci-outlet-wont-reset", query);
  }
  assert.ok(getFinderSymptomOptions("whole-house").some((item) => item.value === "gfci-wont-reset"));
  assert.equal(rankFinderArticles(registry, "whole-house", "gfci-wont-reset")[0]?.article.slug, "gfci-outlet-wont-reset");
  for (const location of ["yard", "garage", "attic", "basement", "bathroom", "kitchen", "laundry", "bedroom", "living-area", "exterior"]) {
    assert.ok(!getFinderSymptomOptions(location).some((item) => item.value === "gfci-wont-reset"), location);
  }
});
