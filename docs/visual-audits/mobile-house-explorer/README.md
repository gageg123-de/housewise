# Mobile House Explorer visual audit

Date: 2026-11-05  
Starting commit: `2f945160ffde928102e07389e21dfe027ca8c4d4`  
Rollback tag: `house-explorer-before-mobile-redesign-2026-11-05`

## Approach

Three approaches were evaluated before implementation:

1. Crop a second mobile-specific image. This could maximize the house at small widths, but it would add another asset and risk visual drift between mobile and desktop.
2. Focus the existing detailed artwork inside a shallower mobile viewport. This preserves the exact architectural artwork, hotspot relationships, and one-image download while allowing a substantially larger mobile presentation.
3. Replace the artwork with a simplified mobile illustration. This would be the lightest composition, but it would weaken the premium visual continuity and require a second alignment system.

The implementation uses option 2. On screens up to 700px, the existing 3:2 artwork, visual highlights, and direct hotspots share one 112%-wide transformed layer inside a clipped 4:3 stage. The former two-column room grid becomes a 44px horizontal chip rail, and the initially unselected recommendation card sits directly below it. Desktop Detailed Explorer, Explorer V1, and Classic mode retain their existing compositions.

## Measured layout change

Measurements were taken in the in-app Chromium browser. Browser scrollbars account for the 15px difference between the requested outer width and document client width.

| Requested width | Baseline explorer section | Redesigned explorer section | Baseline stage | Redesigned visual stage | Initial recommendation card |
| --- | ---: | ---: | ---: | ---: | ---: |
| 320px | 1,431px | 785px | 269 × 452px | 277 × 208px | 156px |
| 375px | 1,386px | 791px | 324 × 488px | 332 × 249px | 156px |
| 390px | 1,396px | 778px | 339 × 498px | 347 × 260px | 156px |
| 430px | 1,350px | 808px | 379 × 525px | 387 × 290px | 156px |
| 700px | 1,462px | 960px | 649 × 705px | 657 × 493px | 131px |

The old stage height included a large two-column selector below a comparatively small image. The redesigned stage is the house itself; the nine-choice selector is a separate 50px rail. At 390px, the initial explorer section is 618px shorter (44%) while the rendered house is wider and the first recommendation is directly adjacent to the controls. Selecting Kitchen produces a 1,075px section, still materially shorter than the 1,396px baseline.

## Visual evidence

The `baseline/` directory contains production screenshots from the starting commit. The `after/` directory contains the local exported build at all required breakpoints:

- 320, 375, 390, 430, 600, 700, 768, 1024, and 1440px initial states
- Kitchen-selected states at 375, 390, 430, and 1440px
- 390px Classic and Explorer V1 restoration-mode checks
- full-page and explorer-section views

## Manual findings

- All nine mobile markers remain within the focused artwork and select the expected room.
- The direct marker and room-rail states remain synchronized.
- Every primary mobile marker and chip has at least a 44px effective target; markers are 45px so the 0.985 entrance scale never reduces them below 44px.
- No tested width introduced document-level horizontal overflow.
- Mobile opens with no preselected diagnosis path; desktop retains the existing Roof / Attic initial state.
- The shared art layer keeps the image, highlights, and hotspots aligned through the preserved entrance animation.
- Reduced-motion mode renders the art at normal scale with zero-duration marker and rail transitions.
- The 768px, 1024px, and 1440px screenshots confirm the existing non-mobile composition is unchanged.

Interactive browser checks covered every hotspot, the horizontal rail, keyboard activation, recommendation links, one-time entrance motion, reduced motion, and the required responsive widths. Real iOS rubber-band behavior was not available in this environment and remains a device-only limitation.

The mandatory refinement pass moved the edge-adjacent HVAC, Windows, Roof / Attic, and Front Door targets inward, separated the HVAC and Garage target centers, and gave every Detailed marker the same centered absolute positioning before and after selection. The final 320, 375, 390, and 430px rendered checks confirm every full 45px target remains inside the clipped visual stage in both states.
