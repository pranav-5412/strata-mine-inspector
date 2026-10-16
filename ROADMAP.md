# Competition roadmap

## Objective

Build a professional, laptop-first 3D inspection workspace for government mining inspectors and officials. Connect excavation changes, horizontal footprint checks, depth-limit checks, cross-sections and inspection evidence in one workflow.

## Dates

- 31 October 2026: user-specified walkthrough submission target.
- 20 November 2026: user-specified start of live judging; the official NRC schedule lists 20–22 November at Noida Indoor Stadium.
- Event references: [Innovation Challenge](https://www.technoxian.com/innovation-contest) and [NRC schedule](https://roboclub.technoxian.com/login).

The current category-specific registration instructions should take precedence if the organizer changes requirements. No submission has been made by this project.

## Completed foundation

- Light inspection dashboard and dark 3D analysis workspace.
- Generated open-pit site with two survey states and a pre-excavation reference.
- Shared 4 m survey/measurement surface, 601 x 601 vertices and 720,000 terrain triangles.
- Irregular terraces, a carved ramp, rock shading/texture and shadows.
- Instanced boulders/shrubs, haul trucks, site buildings and stockpiles.
- Calculated footprint and depth exceedances with connected finding groups.
- Terrain measurement, cross-sections and survey-change overlays.
- Saved review status/notes and downloadable PDF evidence.
- Eased camera focus, camera reset and top view.
- Numerical tests, production build and documented browser checks.

## Before recording

1. Refine terrain composition and material scale based on actual viewing distances.
2. Refine report typography; include a selected cross-section in the exported evidence.
3. Improve keyboard access, dialog focus handling and error feedback.
4. Exercise small changes, boundary-edge cases, missing survey coverage and long notes.
5. Rehearse the entire sequence with the network disconnected.
6. Test sustained frame rate, repeated navigation and browser recovery on the judging laptop.
7. Record the walkthrough with clear narration and captions; review the final submission against the actual organizer requirements.

## Walkthrough sequence

Dashboard → survey A → survey B → reveal footprint breach → inspect measurements → inspect section → review depth finding → record notes → export report.

## Later real-mine milestone

Evaluate an Indian open-pit site, obtain appropriately licensed survey surfaces and authoritative boundaries, validate coordinates/elevation references, and import the data. Gevra is a candidate, not an integrated data source. Support spatially varying permitted excavation surfaces before applying the system to a real approved mine plan.

## Acceptance criteria

- Measurements and the rendered surface use the same geometry/interpolation.
- Known compliant scenarios stay clear and known exceedances are detected.
- Units, survey dates, data provenance and tolerances are available to the inspector.
- All essential controls remain readable at the laptop display settings.
- Reports match the selected survey and stored inspection decisions.
- The presentation workflow succeeds repeatedly without internet access.

## Scope exclusions

No drone control, live sensor integration, underground reconstruction, slope-failure prediction, operational safety certification or regulatory determination is claimed. Inspection efficiency improvements require measurement before making quantitative claims.
