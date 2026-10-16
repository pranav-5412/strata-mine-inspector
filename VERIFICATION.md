# First working milestone — 16 October 2026

Verified:

- TypeScript check and production build.
- Nine numerical tests: triangle interpolation, outside/missing coverage, grid edge, polygon boundary, untouched ground, known cut area/volume, tolerance, generated scenarios and profile endpoints.
- Dependency audit after updating jsPDF/Vitest: zero reported vulnerabilities.
- Actual browser: baseline has zero findings; latest has B-01 and D-01.
- Finding selection, measurement display and section generation.
- Inspector status and note persist after reload.
- Real browser PDF download; two pages rendered and inspected for clipping, overlap, missing text and footer collisions.
- Inspection layout checked at 1366 x 768, with an independently scrolling inspector panel.
- Browser console inspection returned no warning/error entries during the checked workflow.
- Local production URL returned HTTP 200.

Still pending before competition-ready signoff:

- More realistic terrain detail and a geometrically validated connected access ramp.
- Smooth focus camera transitions, more extensive input/error handling and keyboard accessibility review.
- Repeat judging rehearsals, measured frame-rate testing and an actual disconnected-network rehearsal.
- PDF inclusion of the selected cross-section and report layout refinement.
- Import of real survey files and authoritative approved boundaries.

This record distinguishes a working first implementation from a finished competition submission.

## High-detail terrain update — 16 October 2026

- Shared surface increased from 241 x 241 to 601 x 601 vertices: 4 m grid, 720,000 surface triangles.
- All 11 numerical tests pass, including the ramp centreline continuity check.
- Production build passes with the locally bundled rock texture.
- Browser: baseline zero findings; latest footprint and depth findings retained.
- Natural and survey-change shaders compiled without console warnings/errors during the checked workflow.
- Live viewer reported 240 FPS and approximately 902k rendered triangles in a short stationary sample; this is not a comprehensive performance benchmark.
- Geometric detail changed scenario measurements; the displayed values are recalculated, not copied from the coarse model.
- New renderer includes shadows, triplanar rock texture, instanced scatter, site equipment and eased camera movement.
- Full haul-road engineering validation and disconnected-network rehearsal remain pending.
