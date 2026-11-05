# Premium House Explorer visual audit

This folder records the rendered-page comparison for the architectural House Explorer upgrade.

## Baseline

- Source commit: `5c03945359ba922e87be23c1feebe87fa595bc07`
- Restoration tag: `house-explorer-v1-before-visual-upgrade-2026-11-04`
- Selected zone: Roof / Attic
- Files: `v1-1440.jpg`, `v1-768.jpg`, and `v1-390.jpg`

## Detailed variant

- Build settings: `NEXT_PUBLIC_HOME_VARIANT=explorer` and `NEXT_PUBLIC_HOUSE_EXPLORER_VISUAL=detailed`
- Selected zone: Roof / Attic
- Files: `detailed-1440.jpg`, `detailed-768.jpg`, and `detailed-390.jpg`

The screenshots use 1440 x 1000, 768 x 1000, and 390 x 900 browser viewports. Each image is a screenshot of the actual statically exported homepage in a trusted rendered browser, not an isolated asset mockup.

## Review notes

- The detailed variant keeps the existing nine-zone selection model, recommendation panel, keyboard behavior, live announcements, article links, and classic-homepage fallback.
- The architectural artwork is one fixed-dimension WebP with HTML buttons and CSS state layers above it. The visual itself does not encode navigation or diagnoses.
- The deliberate refinement pass removed a hard selection outline that crossed the facade and moved the Front Door label farther inside the stage.
- Browser checks covered 320, 375, 390, 430, 768, 1024, 1150, 1280, and 1440 pixels.
