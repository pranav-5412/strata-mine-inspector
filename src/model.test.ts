import { describe, it, expect } from "vitest";
import {
  sample,
  inside,
  analyze,
  sectionProfile,
  site,
  haulRoadPoint,
  gridResolution,
} from "./model";
import type { Grid, Site } from "./model";
const square = [
  { x: -0.5, z: -0.5 },
  { x: 0.5, z: -0.5 },
  { x: 0.5, z: 0.5 },
  { x: -0.5, z: 0.5 },
];
const grid = (values: number[]): Grid => ({
  size: 3,
  extent: 2,
  values: new Float32Array(values),
});
function fixture(): Site {
  return {
    ...site,
    reference: grid(Array(9).fill(10)),
    baseline: grid(Array(9).fill(10)),
    latest: grid(Array(9).fill(5)),
    boundary: square,
    permittedElevation: 4,
    tolerance: 2,
  };
}
describe("surface interpolation", () => {
  it("matches the two displayed triangles rather than bilinear interpolation", () => {
    const g = { size: 2, extent: 2, values: new Float32Array([0, 10, 20, 0]) };
    expect(sample(g, { x: -0.5, z: -0.5 })).toBe(7.5);
    expect(sample(g, { x: 0.5, z: 0.5 })).toBe(7.5);
  });
  it("returns null outside coverage and when a triangle cell has missing data", () => {
    expect(sample(grid(Array(9).fill(1)), { x: 2, z: 0 })).toBeNull();
    expect(
      sample(grid([NaN, 1, 1, 1, 1, 1, 1, 1, 1]), { x: -0.5, z: -0.5 }),
    ).toBeNull();
  });
  it("samples the maximum grid edges correctly", () => {
    expect(sample(grid([0, 1, 2, 3, 4, 5, 6, 7, 8]), { x: 1, z: 1 })).toBe(8);
  });
});
describe("polygon classification", () => {
  it("includes boundary points and excludes external points", () => {
    expect(inside({ x: 0.5, z: 0 }, square)).toBe(true);
    expect(inside({ x: 0, z: 0 }, square)).toBe(true);
    expect(inside({ x: 0.51, z: 0 }, square)).toBe(false);
  });
});
describe("monitoring evidence", () => {
  it("uses the high detail 4 m surface for measurements", () => {
    expect(gridResolution(site.latest)).toBe(4);
    expect(site.latest.values.length).toBe(601 * 601);
  });
  it("keeps the ramp centreline continuous without bench-sized jumps", () => {
    let maxGrade = 0;
    for (let i = 1; i <= 500; i++) {
      const a = haulRoadPoint((i - 1) / 500),
        b = haulRoadPoint(i / 500),
        ha = sample(site.baseline, a)!,
        hb = sample(site.baseline, b)!;
      maxGrade = Math.max(
        maxGrade,
        Math.abs(ha - hb) / Math.hypot(b.x - a.x, b.z - a.z),
      );
    }
    expect(maxGrade).toBeLessThan(0.2);
  });
  it("does not classify untouched external ground as excavation", () => {
    const s = fixture();
    s.boundary = square.map((p) => ({ x: p.x * 0.1, z: p.z * 0.1 }));
    expect(analyze(s, "baseline")).toHaveLength(0);
  });
  it("calculates exact cell area and volume for a known external cut", () => {
    const s = fixture();
    s.boundary = square.map((p) => ({ x: p.x * 0.1, z: p.z * 0.1 }));
    const f = analyze(s, "latest");
    expect(f).toHaveLength(1);
    expect(f[0].kind).toBe("boundary");
    expect(f[0].area).toBe(4);
    expect(f[0].volume).toBe(20);
    expect(f[0].max).toBe(5);
  });
  it("ignores depth changes at the tolerance and flags greater exceedance", () => {
    const s = fixture();
    s.permittedElevation = 7;
    expect(analyze(s, "latest")).toHaveLength(0);
    s.permittedElevation = 8;
    const f = analyze(s, "latest");
    expect(f[0].kind).toBe("depth");
    expect(f[0].volume).toBe(12);
  });
  it("has compliant baseline and calculated boundary/depth scenario findings", () => {
    expect(analyze(site, "baseline")).toHaveLength(0);
    const f = analyze(site, "latest");
    expect(f.some((v) => v.kind === "boundary")).toBe(true);
    expect(f.some((v) => v.kind === "depth")).toBe(true);
  });
  it("profiles measured terrain endpoints and distances", () => {
    const s = fixture();
    const rows = sectionProfile(s, { x: -1, z: 0 }, { x: 1, z: 0 });
    expect(rows).toHaveLength(181);
    expect(rows[0].distance).toBe(0);
    expect(rows.at(-1)!.distance).toBe(2);
    expect(rows.at(-1)!.latest).toBe(5);
  });
});
