# Problem Finder operating contract

`lib/discovery.mjs` is the single source of truth for Problem Finder location definitions, contextual symptom choices, ranking, fallbacks, and site-search weighting. UI components consume that module; do not duplicate matching rules inside React components.

## Required flow

1. Ask where the problem is showing up.
2. Show only symptom choices that make sense for that location.
3. Rank guides only when both the selected location context and selected symptom are compatible.
4. Return no more than six guides. Label suggestions as reading paths, never diagnoses.
5. If no compatible published guide exists, offer the generated site-search path and reset action. Never manufacture an article URL or return an unrelated guide to fill space.

The normal interaction should reach results in two selections. Any future step must materially improve relevance and keep the default flow within two to four meaningful selections.

## Ranking contract

Ranking preserves this order of importance: exact location, compatible location context, symptom overlap, system/category compatibility, preferred cluster match, safety relevance, then editorial/recency tie-breaking. An editorial preference may break a close tie, but it may not bypass location and symptom compatibility.

Expected examples:

- Yard exposes drainage/standing water, exterior leaks, pest activity, smell, and erosion/cracking—not toilet, dryer, or outlet choices.
- Bathroom emphasizes water, drainage, plumbing noise, odor, and relevant electrical behavior.
- Attic emphasizes moisture, temperature/insulation, smell, noise/pests, and relevant HVAC/roofing context.
- Whole House may expose broad humidity, temperature, electrical, smell, noise, and water observations.

## Regression procedure

`tests/discovery.test.mjs` exercises every configured branch and a named matrix covering Yard, Bathroom, Attic, Laundry, and Whole House. It verifies compatible result metadata, the six-result ceiling, known first results, valid registry references, and safe search fallback generation. `tests/guardrails.test.mjs` protects labels, live-result announcements, reset behavior, uncertainty language, and analytics hook names.

When adding a location, symptom, alias, ranking factor, or article:

1. Use canonical kebab-case taxonomy values.
2. Add or update a representative test when behavior changes intentionally.
3. Run `npm test`; do not weaken compatibility checks to accommodate an irrelevant result.
4. Manually verify keyboard use, state reset, mobile control fit, and the honesty of result explanations.

Automated relevance tests cannot decide whether a new phrase is the clearest homeowner wording or whether a technically adjacent guide is editorially useful. Those remain required manual judgments.
