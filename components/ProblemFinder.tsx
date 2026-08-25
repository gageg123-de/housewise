"use client";
import { useMemo, useState } from "react";
import { SiteLink as Link } from "@/components/SiteLink";
import registry from "@/content/articles.json";
import { articleUrl, titleCase, type Article } from "@/lib/site-data";

const locations = ["bathroom", "kitchen", "bedroom", "living-area", "garage", "attic", "basement", "exterior", "yard", "whole-house"];
const symptomOptions = ["noise", "smell", "leaking", "moisture", "heat", "cold", "crack", "electrical-behavior", "drainage", "pest-activity", "appliance-behavior"];

export default function ProblemFinder() {
  const [location, setLocation] = useState(""); const [symptom, setSymptom] = useState("");
  const matches = useMemo(() => (registry as Article[]).filter((article) => (!location || article.room_or_location.includes(location)) && (!symptom || article.symptoms.includes(symptom))).slice(0, 6), [location, symptom]);
  return <div className="finder-panel"><div className="finder-step"><label htmlFor="finder-location"><span>Step 1</span> Where is the problem?</label><select id="finder-location" value={location} onChange={(event) => setLocation(event.target.value)}><option value="">Choose a location</option>{locations.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></div><div className="finder-step"><label htmlFor="finder-symptom"><span>Step 2</span> What are you noticing?</label><select id="finder-symptom" value={symptom} onChange={(event) => setSymptom(event.target.value)}><option value="">Choose a symptom</option>{symptomOptions.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></div><section className="finder-results" aria-live="polite"><p className="eyebrow">Step 3</p><h2>Possible causes and guides</h2>{!location && !symptom ? <p>Choose a location and symptom to see the closest guides.</p> : matches.length ? <div className="result-list">{matches.map((article) => <Link href={articleUrl(article)} key={article.slug}><strong>{article.title}</strong><span>{article.direct_answer}</span></Link>)}</div> : <div className="empty-state"><strong>No close guide yet.</strong><p>Try a broader selection or search the complete library. This tool suggests relevant reading; it does not provide a professional diagnosis.</p><Link href="/search/">Search all guides</Link></div>}</section><p className="finder-note">This navigator offers general educational information, not a diagnosis. Stop and seek qualified help for immediate safety concerns.</p></div>;
}
