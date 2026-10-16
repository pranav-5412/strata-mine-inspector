# STRATA — 3D Mine Boundary Inspector

A laptop-first inspection website for reviewing mine excavation against a permitted footprint and depth limit. Built for the TechnoXian National Robotics Championship innovation project in Noida, India.

**Workflow:** overview → compare surveys → reveal a breach → inspect its depth and cross-section → record a decision → export evidence.

![STRATA mine inspection workspace with separate exterior soil and gravel](docs/images/strata-exterior-ground.png)

## Project status

Working foundation with a generated open-pit site, numerical monitoring, high-detail 3D rendering and PDF export. It is not a finished competition submission or a live monitoring installation. [Verified checks and remaining work](VERIFICATION.md) are recorded separately.

The initial site, Aravalli Open-Pit, is procedurally generated. Its name and geometry do not identify a surveyed Indian mine. This allows known compliant and breach scenarios to be tested before importing real survey data.

## Features

- Light inspection dashboard and dark 3D mine explorer.
- 601 × 601 surface vertices, 4 m grid spacing and 720,000 terrain triangles.
- Irregular benches, a carved ramp, weathered rock shading, a locally bundled material texture and directional shadows.
- Rocks, vegetation, haul trucks, site buildings and stockpiles for scale.
- Two dated surveys and a pre-excavation reference surface.
- Calculated excavation outside the permitted footprint and below the configured depth limit.
- Terrain selection with elevation, excavation depth and depth exceedance.
- Cross-sections comparing the two survey profiles and permitted elevation.
- Finding review status and inspector notes saved in the browser.
- Offline PDF export with calculations, provenance, review notes and a current terrain image when exported from the explorer.
- Camera reset, top view, smooth focus transitions and a live rendering indicator.

## Quick start

Use Node.js **24 LTS**; development was verified with Node 24.19.0 and npm 11.17.0. The first installation needs internet. No API key, paid map service, cloud database or account is needed to run the app.

```sh
gh repo clone pranav-5412/strata-mine-inspector
cd strata-mine-inspector
npm ci
npm run dev
```

Open the local URL printed by Vite. This repository is private, so cloning requires access to it.

### Production build and Windows launcher

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Open **http://127.0.0.1:4173/**. On Windows, after installation and the first build, double-click **Start STRATA.cmd**. Keep its terminal running while inspecting. If port 4173 is already serving this project, use the existing instance.

Production assets, icons and the rock texture are bundled locally. Review notes belong to the browser and origin; clearing browser storage removes them. Export a PDF to preserve a readable inspection record. An actual disconnected-network rehearsal remains part of competition preparation.

## Judging walkthrough

1. Open the dashboard and enter the mine.
2. Select **A · 15 Sep 2026**: the baseline scenario has no sampled exceedances.
3. Select **B · 15 Oct 2026**, then **Survey change**.
4. Select **Footprint exceedance** to reveal and focus on the changed excavation.
5. Review the affected area, excavation depth and estimated volume.
6. Choose **Inspect cross-section**, or choose **Cross-section** and click two terrain points.
7. Inspect **Depth exceedance** and use **Measure depth** to sample terrain points.
8. Record a review status and note, then export **Report** from the explorer.

## Finalized technology stack

| Layer             | Technology                                          |
| ----------------- | --------------------------------------------------- |
| Interface         | React 19, TypeScript, Vite 7                        |
| 3D rendering      | Three.js, React Three Fiber 9, Drei 10              |
| Appearance        | Custom responsive CSS, Lucide React                 |
| Calculations      | Independent TypeScript grid/polygon operations      |
| Reports           | jsPDF                                               |
| Review records    | Browser localStorage                                |
| Verification      | Vitest, TypeScript production build, browser checks |
| Source formatting | Prettier                                            |

Exact installed versions are recorded in `package-lock.json`. See [TECH_STACK.md](TECH_STACK.md) for the architecture and data contract.

## Source layout

```text
src/
  App.tsx             Dashboard, inspection workflow and review state
  model.ts            Site generation, sampling, findings and profiles
  model.test.ts       Numerical and ramp-continuity fixtures
  MineScene.tsx       Terrain mesh, camera, lighting and overlays
  MineDetails.tsx     Ramp ribbon, scatter, equipment and buildings
  rockMaterial.ts     Triplanar albedo and procedural rock shading
  SectionChart.tsx    Survey cross-section chart
  report.ts           PDF generation
  styles.css          Responsive interface styling
public/materials/     Locally bundled rock material
docs/images/          Project screenshots
```

## Measurement method and limits

The display and measurements share the same triangle-interpolated elevation grid. Findings use 4 m cell-centre sampling, a configured polygon and a 2 m vertical tolerance. Connected flagged cells form review findings.

- **Elevation:** relative to the site's local vertical reference.
- **Excavation depth:** reference ground minus surveyed elevation.
- **Depth exceedance:** permitted elevation minus surveyed elevation, where positive.
- **Footprint finding:** excavation outside the configured permitted footprint above tolerance.

Area/volume estimates are resolution-dependent. Finding types can overlap; their areas and volumes must not be added as unique totals. Decorative rock shading does not displace the measured surface. Review decisions are separate from calculated findings.

The current permitted depth surface is horizontal at −155 m. A real mine may need a varying approved surface. Real deployment requires fresh, aligned and appropriately licensed surveys, validated coordinate/elevation references and authoritative boundaries. This project does not establish regulatory compliance, predict slope failure or certify a haul road.

## Development checks

```sh
npm test
npm run build
npm run format:check
```

The current suite contains 11 tests covering interpolation, coverage, polygon edges, untouched ground, exact fixture area/volume, tolerance, generated findings, section endpoints, grid resolution and ramp continuity. Run `npm run format` when editing source or documentation.

## Documentation and next milestones

- [Architecture and limitations](TECH_STACK.md)
- [Verification record](VERIFICATION.md)
- [Competition roadmap and acceptance criteria](ROADMAP.md)
- [Generated material provenance and exact prompt](ASSETS.md)

The next milestones are report/cross-section refinement, accessibility and recovery checks, repeated offline judging rehearsals, and validated real-mine data import.

## Repository contents and licensing

Source, the dependency lockfile, documentation, screenshots and the generated rock asset are included. Dependencies, production output, temporary QA files, environment files and synced ChatGPT project references are excluded.

This is a private project repository. No open-source license has been selected for the project source. Dependency licenses remain with their respective authors; the generated texture's provenance is documented in ASSETS.md.
