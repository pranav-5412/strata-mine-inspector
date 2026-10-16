# Graphite, Limestone and Amber

The interface uses warm neutral surfaces so the mine remains the main visual focus.

## Color roles

- Page: `#F3F2ED`; panels: `#FCFCF9`; graphite navigation and viewport: `#242725`.
- Body text: `#252824`; secondary text: `#686D66`; dividers: `#DCDDD5`.
- Primary actions: bronze `#805B28`; permitted boundary: amber `#E5B964`.
- Findings: red `#A83E32` on `#F7E8E3`; reviewed: green `#4F7056`.
- Spatial analysis: pale cyan `#A8D1D0`; baseline: stone `#B8BDB3`.
- Selected terrain point: soft white with a graphite outline, distinct from the dashed amber boundary.

CSS tokens in `src/styles.css` cover interface states. `src/palette.ts` supplies matching colors to Three.js and the section plot. Geological materials, lighting and analytical terrain ramps remain independent from interface branding. Keep corresponding spatial tokens synchronized when making future changes.

## Verification — 16 October 2026

- Production build passes; existing Three.js bundle-size advisory remains.
- All 11 terrain/model tests pass. Model calculations and texture assets were not changed.
- Formatting check passes.
- Visually checked overview, explorer, findings and report preview; explorer, findings and report preview also checked at 1366 × 768.
- Baseline survey shows zero findings; latest survey shows two. Depth finding still reports 22.9 m exceedance and the cross-section displays baseline, latest and permitted elevation.
- Review status persisted through reload, then was restored to Unreviewed after the check.
- Report download action exercised without browser warnings/errors; exported PDF pages were not re-rendered in this palette pass.
- Main color contrast ratios: body 14.51:1, secondary 4.72:1, primary button 5.44:1, dark metadata 7.88:1, finding badge 5.18:1, reviewed status 5.40:1. These are token-pair checks, not a complete accessibility audit.
- Updated README banner and live application screenshots.

This commit also includes the preceding local interface cleanup: direct page titles, survey register, consolidated metrics, accessible active-control attributes and terrain-loading feedback.
