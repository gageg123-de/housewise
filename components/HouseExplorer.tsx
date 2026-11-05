"use client";

import { useState, type CSSProperties } from "react";
import { SiteLink as Link } from "@/components/SiteLink";
import type { HouseHotspot } from "@/lib/house-explorer";

function HouseIllustration({ selected, hovered }: { selected: string | null; hovered: string | null }) {
  const zoneClass = (id: string) => `house-zone${selected === id ? " is-selected" : ""}${hovered === id ? " is-hovered" : ""}`;
  return <svg className="house-art" viewBox="0 0 960 660" role="img" aria-labelledby="house-art-title house-art-description">
    <title id="house-art-title">Isometric cutaway home explorer</title>
    <desc id="house-art-description">A conceptual two-story home cutaway showing an attic, HVAC equipment, bathroom, kitchen, laundry area, living room, windows, front door, and garage.</desc>
    <ellipse className="house-ground" cx="492" cy="570" rx="390" ry="58"/>
    <polygon className="house-foundation-side" points="128,430 493,615 850,430 850,456 493,641 128,456"/>
    <polygon className="house-floor" points="128,430 492,246 850,430 493,615"/>

    <g className={zoneClass("living-room")} data-house-zone="living-room">
      <polygon className="zone-surface living-floor" points="151,438 331,347 510,438 328,530"/>
      <path className="room-wall" d="M151 438V326L331 236V347Z"/>
      <path className="room-wall-light" d="M331 347V236L510 326V438Z"/>
      <path className="sofa" d="M208 413l76-38 64 32-76 39zM208 413v34l64 32v-33M272 446l76-39v34l-76 38"/>
      <path className="coffee-table" d="M352 462l56-28 38 19-56 29zM390 482v18M408 473v18"/>
      <circle className="lamp-shade" cx="190" cy="375" r="16"/><path className="detail-line" d="M190 391v45m-18 9h36"/>
    </g>

    <g className={zoneClass("bathroom")} data-house-zone="bathroom">
      <polygon className="zone-surface bathroom-floor" points="151,327 331,236 444,293 264,384"/>
      <path className="fixture" d="M197 302l58-29 42 21-58 29zM197 302v35l42 21v-35M239 323l58-29v35l-58 29"/>
      <ellipse className="fixture-light" cx="339" cy="310" rx="25" ry="13"/><path className="fixture" d="M314 310v31c0 12 50 12 50 0v-31M326 348v20h27v-20"/>
      <path className="detail-line" d="M172 281l38-19M181 271v-35M210 262v-35"/>
    </g>

    <g className={zoneClass("kitchen")} data-house-zone="kitchen">
      <polygon className="zone-surface kitchen-floor" points="444,293 621,204 797,292 621,382"/>
      <path className="cabinet" d="M520 274l94-47 38 19-94 47zM520 274v49l38 19v-49M558 293l94-47v49l-94 47"/>
      <path className="counter-line" d="M568 277l24-12m-12 3v22"/>
      <path className="appliance" d="M681 257l54-27 35 18-54 27zM681 257v62l35 18v-62M716 275l54-27v62l-54 27"/>
      <path className="appliance-line" d="M729 273v43M741 267v43"/>
      <path className="detail-line" d="M485 291v-54l46-23v54"/>
    </g>

    <g className={zoneClass("laundry")} data-house-zone="laundry">
      <polygon className="zone-surface laundry-floor" points="510,438 621,382 732,438 621,494"/>
      <path className="appliance" d="M548 414l48-24 39 20-48 24zM548 414v56l39 20v-56M587 434l48-24v56l-48 24"/>
      <ellipse className="appliance-window" cx="603" cy="450" rx="14" ry="18"/>
      <path className="appliance" d="M640 414l44-22 35 18-44 22zM640 414v54l35 18v-54M675 432l44-22v54l-44 22"/>
      <path className="detail-line" d="M688 435l18-9M688 446l18-9"/>
    </g>

    <g className={zoneClass("garage")} data-house-zone="garage">
      <polygon className="zone-surface garage-floor" points="621,494 732,438 850,497 738,554"/>
      <path className="garage-wall" d="M732 438V324L850 382V497Z"/>
      <path className="garage-door" d="M755 401l73 36v66l-73-36z"/>
      <path className="garage-lines" d="M755 418l73 36M755 437l73 36M755 456l73 36"/>
      <path className="shelf" d="M659 458l49-24 15 8-49 24zM674 466v43M708 449v43M666 488l49-24"/>
    </g>

    <g className={zoneClass("front-door")} data-house-zone="front-door">
      <path className="zone-surface front-wall" d="M328 530V419L493 502v113Z"/>
      <path className="front-door" d="M390 489l54 27v76l-54-27z"/>
      <circle className="door-knob" cx="431" cy="550" r="4"/>
      <path className="door-step" d="M374 570l70 35 35-18-70-35z"/>
    </g>

    <g className={zoneClass("windows")} data-house-zone="windows">
      <path className="zone-surface window-frame" d="M174 337l87-43v77l-87 43z"/>
      <path className="window-glass" d="M184 341l67-33v55l-67 33z"/>
      <path className="window-line" d="M217 325v55M184 369l67-33"/>
      <path className="zone-surface window-frame" d="M526 234l70-35v54l-70 35z"/>
      <path className="window-glass" d="M536 237l50-25v33l-50 25z"/>
    </g>

    <g className={zoneClass("roof-attic")} data-house-zone="roof-attic">
      <polygon className="attic-wall" points="287,235 489,79 690,235 489,336"/>
      <polygon className="zone-surface roof-left" points="268,230 486,55 500,82 287,257"/>
      <polygon className="zone-surface roof-right" points="486,55 716,214 690,242 500,82"/>
      <path className="rafter" d="M334 222L489 101l148 112M382 246L489 162l103 77M489 101v183"/>
      <path className="duct" d="M398 221c34-12 47-42 83-35s54 42 96 31"/>
      <path className="duct-joint" d="M408 206l11 24M470 177l5 25M540 194l-9 25"/>
      <rect className="attic-box" x="449" y="229" width="63" height="42" rx="5" transform="rotate(-27 480 250)"/>
    </g>

    <g className={zoneClass("hvac")} data-house-zone="hvac">
      <polygon className="zone-surface hvac-pad" points="804,330 864,300 923,330 864,360"/>
      <path className="hvac-unit" d="M815 285l49-25 48 24-48 25zM815 285v62l49 24v-62M864 309l48-25v62l-48 25"/>
      <ellipse className="hvac-fan" cx="864" cy="284" rx="27" ry="13"/>
      <path className="hvac-fan-line" d="M864 271v26M840 284h48M847 276l34 17M847 293l34-17"/>
      <path className="service-line" d="M817 327c-39 10-52 4-70-16"/>
    </g>

    <path className="house-outline" d="M128 430l364 185 358-185M151 438V326l180-90 113 57 45-214 227 135-26 28 42 82 118 58v115"/>
  </svg>;
}

export function HouseExplorer({ hotspots }: { hotspots: HouseHotspot[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(hotspots[0]?.id ?? null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const selected = hotspots.find((hotspot) => hotspot.id === selectedId) ?? null;
  return <div className="house-explorer" data-analytics-event="house_explorer_view">
    <div className="house-stage">
      <HouseIllustration selected={selectedId} hovered={hoveredId}/>
      <div className="house-hotspot-list" aria-label="Choose an area of the house">
        {hotspots.map((hotspot) => <button
          key={hotspot.id}
          type="button"
          className={`house-hotspot${selectedId === hotspot.id ? " is-selected" : ""}`}
          style={{ "--hotspot-x": `${hotspot.x}%`, "--hotspot-y": `${hotspot.y}%` } as CSSProperties}
          aria-pressed={selectedId === hotspot.id}
          aria-controls="house-recommendation-panel"
          data-analytics-event="house_hotspot_select"
          data-hotspot={hotspot.id}
          onMouseEnter={() => setHoveredId(hotspot.id)}
          onMouseLeave={() => setHoveredId(null)}
          onFocus={() => setHoveredId(hotspot.id)}
          onBlur={() => setHoveredId(null)}
          onClick={() => setSelectedId(hotspot.id)}
        ><span aria-hidden="true"/><b>{hotspot.label}</b></button>)}
      </div>
    </div>
    <aside className="house-recommendations" id="house-recommendation-panel" aria-labelledby="house-panel-title">
      <p className="eyebrow">Selected area</p>
      {selected ? <>
        <div className="house-panel-heading"><h3 id="house-panel-title">{selected.label}</h3><button type="button" className="house-clear" onClick={() => setSelectedId(null)}>Clear</button></div>
        <p>{selected.prompt}</p>
        <ul>{selected.articles.map((article) => <li key={article.slug}><Link href={article.href} data-analytics-event="house_problem_select" data-hotspot={selected.id} data-result-slug={article.slug}><strong>{article.title}</strong><span>{article.description}</span><i aria-hidden="true">→</i></Link></li>)}</ul>
        <Link className="house-category-link" href={selected.categoryHref} data-analytics-event="house_category_click" data-hotspot={selected.id}>{selected.categoryLabel} →</Link>
      </> : <div className="house-empty"><h3 id="house-panel-title">Choose a room or system</h3><p>Select a labeled area on the house to see a short list of real troubleshooting guides.</p></div>}
      <p className="sr-only" aria-live="polite">{selected ? `${selected.label} selected. ${selected.articles.length} ${selected.articles.length === 1 ? "guide" : "guides"} shown.` : "House selection cleared."}</p>
    </aside>
  </div>;
}
