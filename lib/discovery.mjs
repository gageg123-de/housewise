/**
 * Shared, dependency-free discovery logic for the Problem Finder and site search.
 * The browser components and Node regression tests use the same implementation.
 */

const locationDefinitions = [
  { value: "bathroom", label: "Bathroom", locations: ["bathroom"], systems: ["plumbing", "bathroom", "moisture-and-mold"], symptoms: [
    { value: "leaking", label: "Water, dripping, or dampness", articleSymptoms: ["leaking", "moisture"] },
    { value: "drainage", label: "Slow drain, backup, or clogging", articleSymptoms: ["drainage", "clogging"], preferredSlugs: ["toilet-bubbles-when-washer-drains"] },
    { value: "toilet-gurgling", label: "Toilet gurgling or bubbling without a clear trigger", articleSymptoms: ["noise", "drainage", "clogging"], preferredSlugs: ["toilet-gurgles-randomly"] },
    { value: "toilet-water-level", label: "Toilet water rises when another toilet flushes", articleSymptoms: ["drainage", "clogging", "noise"], preferredSlugs: ["toilet-water-rises-when-another-toilet-flushes"] },
    { value: "shower-gurgling", label: "Shower or tub drain gurgles when the toilet flushes", articleSymptoms: ["noise", "drainage", "clogging"], preferredSlugs: ["shower-drain-gurgles-when-toilet-flushes"] },
    { value: "noise", label: "Gurgling, whistling, or another noise", articleSymptoms: ["noise", "plumbing-behavior"] },
    { value: "smell", label: "Sewer, musty, or another smell", articleSymptoms: ["smell"] },
    { value: "electrical-behavior", label: "Outlet, switch, light, or fan behavior", articleSymptoms: ["electrical-behavior", "vibration"] },
  ] },
  { value: "kitchen", label: "Kitchen", locations: ["kitchen"], systems: ["plumbing", "appliances", "electrical", "kitchen"], symptoms: [
    { value: "leaking", label: "Water or leaking", articleSymptoms: ["leaking", "moisture"] },
    { value: "drainage", label: "Drainage or clogging", articleSymptoms: ["drainage", "clogging"] },
    { value: "appliance-behavior", label: "Appliance behavior", articleSymptoms: ["appliance-behavior"] },
    { value: "dishwasher-drying", label: "Dishwasher leaves dishes or plastics wet", articleSymptoms: ["appliance-behavior"], preferredSlugs: ["dishwasher-not-drying-dishes"] },
    { value: "dishwasher-cleaning", label: "Dishwasher leaves food or dishes dirty", articleSymptoms: ["appliance-behavior"], preferredSlugs: ["dishwasher-not-cleaning-dishes"] },
    { value: "smell", label: "Bad or unusual smell", articleSymptoms: ["smell"] },
    { value: "electrical-behavior", label: "Outlet, light, or electrical behavior", articleSymptoms: ["electrical-behavior"] },
    { value: "appliance-light-flicker", label: "Lights flicker or dim when an appliance runs", articleSymptoms: ["electrical-behavior"], preferredSlugs: ["lights-flicker-when-appliance-turns-on"] },
    { value: "noise", label: "Buzzing, knocking, or another noise", articleSymptoms: ["noise", "vibration"] },
  ] },
  { value: "bedroom", label: "Bedroom", locations: ["bedroom", "living-area"], systems: ["hvac", "electrical", "windows-and-doors"], symptoms: [
    { value: "heat", label: "Too warm, cold, or humid", articleSymptoms: ["heat", "cold", "moisture"] },
    { value: "noise", label: "Noise or vibration", articleSymptoms: ["noise", "vibration"] },
    { value: "leaking", label: "Water, dripping, or a stain", articleSymptoms: ["leaking", "moisture", "discoloration"] },
    { value: "electrical-behavior", label: "Outlet, light, or fan behavior", articleSymptoms: ["electrical-behavior", "vibration"] },
    { value: "smell", label: "Musty or another smell", articleSymptoms: ["smell"] },
  ] },
  { value: "living-area", label: "Living area", locations: ["living-area", "bedroom"], systems: ["hvac", "electrical", "windows-and-doors"], symptoms: [
    { value: "heat", label: "Too warm, cold, or humid", articleSymptoms: ["heat", "cold", "moisture"] },
    { value: "noise", label: "Noise or vibration", articleSymptoms: ["noise", "vibration"] },
    { value: "leaking", label: "Water, dripping, or a stain", articleSymptoms: ["leaking", "moisture", "discoloration"] },
    { value: "electrical-behavior", label: "Outlet, light, or fan behavior", articleSymptoms: ["electrical-behavior", "vibration"] },
    { value: "smell", label: "Musty or another smell", articleSymptoms: ["smell"] },
  ] },
  { value: "garage", label: "Garage", locations: ["garage"], systems: ["garage", "plumbing", "moisture-and-mold", "appliances"], symptoms: [
    { value: "leaking", label: "Water, a puddle, or leaking", articleSymptoms: ["leaking", "moisture"] },
    { value: "smell", label: "Musty, burning, or another smell", articleSymptoms: ["smell"] },
    { value: "appliance-behavior", label: "Water heater or appliance behavior", articleSymptoms: ["appliance-behavior", "heat"] },
    { value: "electrical-behavior", label: "Door, outlet, or electrical behavior", articleSymptoms: ["electrical-behavior"] },
    { value: "noise", label: "Noise or vibration", articleSymptoms: ["noise", "vibration"] },
  ] },
  { value: "laundry", label: "Laundry area", locations: ["laundry"], systems: ["appliances", "plumbing", "electrical"], symptoms: [
    { value: "appliance-behavior", label: "Washer or dryer behavior", articleSymptoms: ["appliance-behavior", "heat"], preferredSlugs: ["dryer-taking-two-cycles"] },
    { value: "dryer-burning-smell", label: "Dryer smells burned, electrical, or unusually hot", articleSymptoms: ["smell", "heat", "appliance-behavior", "electrical-behavior"], preferredSlugs: ["dryer-smells-like-burning"] },
    { value: "drainage", label: "Drainage, backup, or clogging", articleSymptoms: ["drainage", "clogging"] },
    { value: "leaking", label: "Water or leaking", articleSymptoms: ["leaking", "moisture"] },
    { value: "noise", label: "Noise or vibration", articleSymptoms: ["noise", "vibration"] },
    { value: "smell", label: "Musty, burning, or another smell", articleSymptoms: ["smell"] },
  ] },
  { value: "attic", label: "Attic", locations: ["attic"], systems: ["attic-and-insulation", "hvac", "roofing", "pests"], symptoms: [
    { value: "moisture", label: "Moisture, condensation, or staining", articleSymptoms: ["moisture", "leaking", "discoloration"], preferredSlugs: ["ac-ductwork-sweating-in-attic"] },
    { value: "air-handler-sweating", label: "Air-handler cabinet is sweating", articleSymptoms: ["moisture", "leaking"], preferredSlugs: ["air-handler-sweating"] },
    { value: "heat", label: "Heat, cold, or insulation concern", articleSymptoms: ["heat", "cold"] },
    { value: "smell", label: "Musty or another smell", articleSymptoms: ["smell"] },
    { value: "noise", label: "Scratching or another noise", articleSymptoms: ["noise", "pest-activity"] },
    { value: "pest-activity", label: "Pest signs or damage", articleSymptoms: ["pest-activity"] },
  ] },
  { value: "basement", label: "Basement", locations: ["basement"], systems: ["plumbing", "moisture-and-mold", "electrical"], symptoms: [
    { value: "leaking", label: "Water, leaking, or dampness", articleSymptoms: ["leaking", "moisture"] },
    { value: "smell", label: "Musty, sewer, or another smell", articleSymptoms: ["smell"] },
    { value: "drainage", label: "Drainage or backup", articleSymptoms: ["drainage", "clogging"] },
    { value: "electrical-behavior", label: "Electrical behavior", articleSymptoms: ["electrical-behavior"] },
    { value: "crack", label: "Crack or structural movement", articleSymptoms: ["crack"] },
  ] },
  { value: "exterior", label: "Outside the house", locations: ["exterior", "yard"], systems: ["roofing", "yard-and-drainage", "windows-and-doors", "pests"], symptoms: [
    { value: "leaking", label: "Water entry or an exterior leak", articleSymptoms: ["leaking", "moisture"] },
    { value: "drainage", label: "Drainage, gutters, or standing water", articleSymptoms: ["drainage", "moisture"] },
    { value: "crack", label: "Crack, gap, or movement", articleSymptoms: ["crack"] },
    { value: "pest-activity", label: "Pest signs or damage", articleSymptoms: ["pest-activity"] },
    { value: "smell", label: "Unusual smell", articleSymptoms: ["smell"] },
  ] },
  { value: "yard", label: "Yard", locations: ["yard", "exterior"], systems: ["yard-and-drainage", "pests", "plumbing"], symptoms: [
    { value: "drainage", label: "Standing water, soggy ground, or drainage", articleSymptoms: ["drainage", "moisture"] },
    { value: "leaking", label: "Exterior pipe or water leak", articleSymptoms: ["leaking", "moisture"] },
    { value: "pest-activity", label: "Pests, holes, or animal activity", articleSymptoms: ["pest-activity"] },
    { value: "smell", label: "Bad or unusual smell", articleSymptoms: ["smell"] },
    { value: "crack", label: "Erosion, cracking, or movement", articleSymptoms: ["crack", "drainage"] },
  ] },
  { value: "whole-house", label: "Whole house", locations: ["whole-house"], systems: ["hvac", "electrical", "plumbing", "moisture-and-mold"], symptoms: [
    { value: "multiple-drains", label: "Several drains are slow, gurgling, or backing up", articleSymptoms: ["drainage", "clogging", "noise"], preferredSlugs: ["multiple-drains-back-up-at-same-time"] },
    { value: "moisture", label: "Humidity, dampness, or condensation", articleSymptoms: ["moisture"], preferredSlugs: ["house-humid-with-ac-running"] },
    { value: "air-handler-sweating", label: "Air-handler or indoor unit cabinet is sweating", articleSymptoms: ["moisture", "leaking"], preferredSlugs: ["air-handler-sweating"] },
    { value: "hvac-filter", label: "Wet or damaged HVAC filter", articleSymptoms: ["moisture", "leaking"], preferredSlugs: ["ac-filter-wet"] },
    { value: "heat", label: "Temperature or comfort problem", articleSymptoms: ["heat", "cold"] },
    { value: "electrical-behavior", label: "Electrical behavior", articleSymptoms: ["electrical-behavior"] },
    { value: "outlet-buzzing", label: "Outlet buzzes, hums, or sizzles", articleSymptoms: ["noise", "electrical-behavior"], preferredSlugs: ["outlet-buzzing"] },
    { value: "appliance-light-flicker", label: "Lights flicker or dim when equipment starts", articleSymptoms: ["electrical-behavior"], preferredSlugs: ["lights-flicker-when-appliance-turns-on"] },
    { value: "smell", label: "Musty, burning, or another smell", articleSymptoms: ["smell"] },
    { value: "noise", label: "Noise or vibration", articleSymptoms: ["noise", "vibration"] },
    { value: "leaking", label: "Water or leaking", articleSymptoms: ["leaking", "moisture"], preferredSlugs: ["water-around-indoor-ac-unit"] },
  ] },
];

export const finderLocations = locationDefinitions.map(({ value, label }) => ({ value, label }));

export function getFinderLocation(value) {
  return locationDefinitions.find((location) => location.value === value);
}

export function getFinderSymptomOptions(location) {
  return getFinderLocation(location)?.symptoms ?? [];
}

export function getFinderFallbackHref(locationValue, symptomValue) {
  const location = getFinderLocation(locationValue);
  const symptom = location?.symptoms.find((item) => item.value === symptomValue);
  const query = [location?.label, symptom?.label].filter(Boolean).join(" ");
  return `/search/?q=${encodeURIComponent(query)}`;
}

export function rankFinderArticles(articles, locationValue, symptomValue) {
  const location = getFinderLocation(locationValue);
  const symptom = location?.symptoms.find((item) => item.value === symptomValue);
  if (!location || !symptom) return [];

  return articles
    .map((article) => {
      const exactLocation = article.room_or_location.includes(location.value);
      const relatedLocation = article.room_or_location.some((item) => location.locations.includes(item));
      const symptomMatches = article.symptoms.filter((item) => symptom.articleSymptoms.includes(item)).length;
      if (!relatedLocation || !symptomMatches) return null;
      const systemMatch = location.systems.includes(article.system) || location.systems.includes(article.primary_category) || article.secondary_categories.some((item) => location.systems.includes(item));
      const score = (exactLocation ? 60 : 45) + symptomMatches * 35 + (systemMatch ? 15 : 0) + (symptom.preferredSlugs?.includes(article.slug) ? 30 : 0) + (article.content_type.includes("safety") ? 4 : 0) + (article.featured_status ? 1 : 0);
      return { article, score, exactLocation, symptomLabel: symptom.label, locationLabel: location.label };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || right.article.updated_date.localeCompare(left.article.updated_date) || left.article.title.localeCompare(right.article.title))
    .slice(0, 6);
}

const stopWords = new Set(["a", "an", "and", "does", "from", "is", "my", "of", "the", "to", "when", "why", "with"]);
const queryAliases = {
  ac: ["hvac", "air conditioner", "cooling"],
  damp: ["moisture", "humid", "musty"],
  dripping: ["drip", "leaking", "water"],
  gurgling: ["bubbling", "noise", "clogging"],
  humid: ["humidity", "moisture", "clammy", "damp"],
  humidity: ["humid", "moisture", "clammy", "damp"],
  leak: ["leaking", "water", "puddle"],
  leaking: ["leak", "water", "puddle"],
  slow: ["taking two cycles", "slow drying", "clogging"],
  warm: ["heat", "hot"],
};

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function editDistance(left, right) {
  if (Math.abs(left.length - right.length) > 1) return 2;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1, previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1));
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

export function searchArticles(articles, query) {
  const normalizedQuery = normalize(query);
  const terms = normalizedQuery.split(" ").filter((term) => term && !stopWords.has(term));
  if (!terms.length) return articles;

  return articles
    .map((article) => {
      const title = normalize(article.title);
      const description = normalize(article.description);
      const directAnswer = normalize(article.direct_answer);
      const keywords = article.search_keywords.map(normalize);
      const taxonomy = normalize([article.primary_category, ...article.secondary_categories, article.system, ...article.symptoms, ...article.room_or_location].join(" "));
      const vocabulary = new Set(`${title} ${description} ${directAnswer} ${keywords.join(" ")} ${taxonomy}`.split(" "));
      let score = title.includes(normalizedQuery) ? 50 : 0;
      if (keywords.some((keyword) => keyword.includes(normalizedQuery))) score += 30;
      if (description.includes(normalizedQuery)) score += 10;
      let matchedTerms = 0;

      for (const term of terms) {
        const variants = [term, ...(queryAliases[term] ?? [])].map(normalize);
        const aliases = variants.slice(1);
        const exactTitleMatch = title.includes(term);
        const titleMatch = variants.some((variant) => title.includes(variant));
        const exactKeywordMatch = keywords.some((keyword) => keyword.includes(term));
        const keywordMatch = variants.some((variant) => keywords.some((keyword) => keyword.includes(variant)));
        const taxonomyMatch = variants.some((variant) => taxonomy.includes(variant));
        const bodyMatch = variants.some((variant) => description.includes(variant) || directAnswer.includes(variant));
        const fuzzyMatch = term.length >= 5 && [...vocabulary].some((word) => word.length >= 5 && editDistance(term, word) <= 1);
        if (titleMatch || keywordMatch || taxonomyMatch || bodyMatch || fuzzyMatch) matchedTerms += 1;
        score += exactTitleMatch ? 14 : aliases.some((alias) => title.includes(alias)) ? 10 : exactKeywordMatch ? 11 : keywordMatch ? 8 : taxonomyMatch ? 7 : bodyMatch ? 3 : fuzzyMatch ? 2 : 0;
      }

      const requiredMatches = terms.length === 1 ? 1 : terms.includes("not") ? terms.length : Math.ceil(terms.length * 0.75);
      if (matchedTerms < requiredMatches) return null;
      if (article.content_type.includes("safety")) score += 2;
      return { article, score };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || right.article.updated_date.localeCompare(left.article.updated_date) || left.article.title.localeCompare(right.article.title))
    .map(({ article }) => article);
}
