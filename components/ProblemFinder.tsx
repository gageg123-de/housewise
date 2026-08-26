"use client";
import { useMemo, useState } from "react";
import { SiteLink as Link } from "@/components/SiteLink";
import registry from "@/content/articles.json";
import { finderLocations, getFinderFallbackHref, getFinderSymptomOptions, rankFinderArticles } from "@/lib/discovery.mjs";
import { articleUrl, type Article } from "@/lib/site-data";

export default function ProblemFinder() {
  const [location, setLocation] = useState("");
  const [symptom, setSymptom] = useState("");
  const symptomOptions = useMemo(() => getFinderSymptomOptions(location), [location]);
  const matches = useMemo(() => rankFinderArticles(registry as Article[], location, symptom), [location, symptom]);
  const fallbackHref = getFinderFallbackHref(location, symptom);

  function resetFinder() {
    setLocation("");
    setSymptom("");
  }

  return <div className="finder-panel" data-analytics-surface="problem_finder">
    <div className="finder-step">
      <label htmlFor="finder-location"><span>Step 1</span> Where’s the problem showing up?</label>
      <select id="finder-location" value={location} onChange={(event) => { setLocation(event.target.value); setSymptom(""); }} data-analytics-event="problem_finder_started">
        <option value="">Choose a location</option>
        {finderLocations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </div>
    <div className="finder-step">
      <label htmlFor="finder-symptom"><span>Step 2</span> {location ? "Got it. What’s it doing?" : "What are you noticing?"}</label>
      <select id="finder-symptom" value={symptom} onChange={(event) => setSymptom(event.target.value)} disabled={!location} aria-describedby="finder-symptom-help" data-analytics-event="problem_finder_step" data-selected-location={location}>
        <option value="">{location ? "Choose what you notice" : "Choose a location first"}</option>
        {symptomOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <span className="sr-only" id="finder-symptom-help">The available observations change to fit the selected location.</span>
    </div>
    <section className="finder-results" aria-live="polite" aria-atomic="true">
      <p className="eyebrow">Your next step</p>
      <h2>{location && symptom ? "Here are the closest guides to start with." : "Tell us what your house is doing."}</h2>
      {!location ? <p>Start with the room or area. The next choices will stay relevant to that location.</p> : !symptom ? <p>Choose the description that comes closest. You can change either selection at any time.</p> : matches.length ? <>
        <p className="finder-summary">These are reading suggestions based on your selections, not a diagnosis.</p>
        <div className="result-list" data-analytics-event="problem_finder_completed" data-location={location} data-symptom={symptom} data-result-count={matches.length}>{matches.map(({ article, locationLabel, symptomLabel }, index) => <Link href={articleUrl(article)} key={article.slug} data-analytics-event="problem_finder_result_click" data-location={location} data-symptom={symptom} data-result-slug={article.slug}>
          <span className="result-kicker">{index === 0 ? "Start here" : "Possible match"} · {locationLabel} + {symptomLabel}</span>
          <strong>{article.title}</strong>
          <span>{article.description}</span>
        </Link>)}</div>
        <button className="text-button" type="button" onClick={resetFinder}>Not quite right? Start over</button>
      </> : <div className="empty-state">
        <strong>We don’t have an exact guide for that yet.</strong>
        <p>That combination is still useful—it tells us where the library has a gap. Try another description, search the full library, or start over.</p>
        <div className="empty-actions"><Link href={fallbackHref}>Search these words</Link><button className="text-button" type="button" onClick={resetFinder}>Start over</button></div>
      </div>}
    </section>
    <p className="finder-note">This navigator offers general educational information, not a diagnosis. For smoke, fire, gas odor, a carbon monoxide alarm, sewage, structural movement, or water near electricity, leave the area when appropriate and seek qualified or emergency help.</p>
  </div>;
}
