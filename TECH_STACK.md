# STRATA — finalized stack

Decision: 16 October 2026. Laptop-first, offline application; no hosted service required.

| Layer | Choice | Reason |
|---|---|---|
| UI | React 19 + TypeScript | Typed, component-based dashboard and inspection tools |
| Development/build | Vite 7 | Local server and static production output |
| 3D | Three.js + React Three Fiber 9 + Drei 10 | Local terrain geometry, camera controls, ray-based selection and overlays |
| Styling | Custom responsive CSS | Consistent light inspection dashboard and dark analysis workspace |
| Icons | Lucide React | Bundled, consistent icon set |
| Analysis | Pure TypeScript | Testable grid interpolation, footprint/depth checks, connected finding groups and sections |
| Reports | jsPDF | Offline PDF generation |
| Local records | Browser localStorage | Persistent review notes/status without accounts or backend |
| Verification | Vitest + production build + browser inspection | Numerical fixtures and actual interface checks |

Exact installed versions are recorded in package-lock.json. React Three Fiber 9 is paired with React 19. No alpha renderer or paid map service is used.

## Data contract

Site has identity/provenance, baseline/latest/reference elevation grids, a permitted footprint polygon, a permitted elevation, tolerance and survey dates. All surfaces use the same local engineering coordinate system and grid. The present permitted surface is horizontal; a varying real-world permitted excavation surface will need a grid implementation and validation before import.

Mesh and measurements share triangle interpolation. Area/volume estimates use 4 m cell-centre sampling. Groups are four-neighbour connected components. Boundary excavation volume and volume below the depth limit are different quantities and can overlap.

## Intentional limitations of this first implementation

Generated site, not a surveyed Indian mine; not live monitoring. No slope failure prediction. The carved access ramp has a continuous sampled centreline but is not a certified haul-road design. Polygon edges can be smaller than analysis cells. Review records stay in the selected browser and origin; exporting a PDF preserves a readable record. Real-site ingestion, arbitrary permitted depth surfaces, complete missing-coverage reporting and higher precision clipping belong to the real-data milestone.

## High-detail terrain upgrade

601 x 601 shared survey vertices, 4 m spacing, 720,000 terrain triangles (6.25 times the original surface). Bench shapes include irregular contour geometry and weathering. A 23 m visual road ribbon follows a ramp carved into the measured surface. Terrain skirts close the exposed edges. Instanced rocks and vegetation, trucks, site buildings and stockpiles provide scale cues. Shadow mapping, procedural rock strata and a locally bundled albedo texture add surface detail without displacing the measured mesh. The camera eases between inspection positions and honours reduced-motion preferences. A live frame counter reports actual rendering performance rather than a claimed target.
