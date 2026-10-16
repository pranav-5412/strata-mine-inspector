export type Point = { x: number; z: number };
export type SurveyKey = "baseline" | "latest";
export type Grid = { size: number; extent: number; values: Float32Array };
export type Finding = {
  id: string;
  kind: "boundary" | "depth";
  title: string;
  area: number;
  volume: number;
  max: number;
  point: Point;
  cells: number[];
};
export type Site = {
  name: string;
  id: string;
  source: string;
  reference: Grid;
  baseline: Grid;
  latest: Grid;
  boundary: Point[];
  permittedElevation: number;
  tolerance: number;
  dates: Record<SurveyKey, string>;
};
export function gridPoint(grid: Grid, index: number): Point {
  const step = grid.extent / (grid.size - 1);
  return {
    x: (index % grid.size) * step - grid.extent / 2,
    z: Math.floor(index / grid.size) * step - grid.extent / 2,
  };
}
// Same diagonal and barycentric interpolation as the displayed terrain mesh.
export function sample(grid: Grid, { x, z }: Point): number | null {
  const step = grid.extent / (grid.size - 1),
    u = (x + grid.extent / 2) / step,
    v = (z + grid.extent / 2) / step;
  if (u < 0 || v < 0 || u > grid.size - 1 || v > grid.size - 1) return null;
  const i = Math.min(grid.size - 2, Math.floor(u)),
    j = Math.min(grid.size - 2, Math.floor(v)),
    tx = u - i,
    tz = v - j,
    a = j * grid.size + i;
  const h00 = grid.values[a],
    h10 = grid.values[a + 1],
    h01 = grid.values[a + grid.size],
    h11 = grid.values[a + grid.size + 1];
  if (![h00, h10, h01, h11].every(Number.isFinite)) return null;
  return tx + tz <= 1
    ? h00 + (h10 - h00) * tx + (h01 - h00) * tz
    : h11 + (h01 - h11) * (1 - tx) + (h10 - h11) * (1 - tz);
}
export function inside(point: Point, polygon: Point[]): boolean {
  let result = false;
  const { x, z } = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j],
      b = polygon[i],
      cross = (x - a.x) * (b.z - a.z) - (z - a.z) * (b.x - a.x);
    if (
      Math.abs(cross) < 1e-7 &&
      x >= Math.min(a.x, b.x) - 1e-7 &&
      x <= Math.max(a.x, b.x) + 1e-7 &&
      z >= Math.min(a.z, b.z) - 1e-7 &&
      z <= Math.max(a.z, b.z) + 1e-7
    )
      return true;
    if (
      a.z > z !== b.z > z &&
      x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x
    )
      result = !result;
  }
  return result;
}
const smooth = (a: number, b: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const pitShape = (a: number) =>
  1 +
  0.065 * Math.sin(a * 3) +
  0.035 * Math.cos(a * 5) +
  0.018 * Math.sin(a * 9);
export function pitRadius(x: number, z: number) {
  const a = Math.atan2(z / 620, (x + 150) / 790);
  return Math.hypot((x + 150) / 790, z / 620) / pitShape(a);
}
export function haulRoadPoint(t: number): Point {
  const a = -0.25 + t * Math.PI * 2.5,
    r = 0.98 - t * 0.75,
    shape = pitShape(a);
  return {
    x: -150 + 790 * r * shape * Math.cos(a),
    z: 620 * r * shape * Math.sin(a),
  };
}
const ground = (x: number, z: number) => {
  const r = pitRadius(x, z),
    outer = smooth(1.08, 1.75, r);
  const hills =
    54 * Math.exp(-((x + 950) ** 2 + (z - 780) ** 2) / 220000) +
    38 * Math.exp(-((x - 740) ** 2 + (z - 980) ** 2) / 170000);
  return (
    122 +
    6 * Math.sin(x * 0.003) * Math.cos(z * 0.003) +
    3 * Math.sin((x + z) * 0.006) +
    outer *
      (hills +
        12 * Math.sin(x * 0.009) * Math.cos(z * 0.006) +
        5 * Math.sin(x * 0.021 + z * 0.013))
  );
};
function terrain(x: number, z: number) {
  const a = Math.atan2(z / 620, (x + 150) / 790),
    r = pitRadius(x, z);
  const original = ground(x, z);
  if (r >= 1) return original;
  const raw = Math.min(252, (1 - r) * 345),
    step = raw / 18;
  const bench = Math.floor(step) * 18 + smooth(0.76, 1, step % 1) * 18;
  const roadT = Math.min(1, Math.max(0, (0.98 - r) / 0.75)),
    roadAngle = -0.25 + roadT * Math.PI * 2.5;
  const angleDiff = Math.atan2(
    Math.sin(a - roadAngle),
    Math.cos(a - roadAngle),
  );
  // Convert angular separation to distance perpendicular to the spiral.
  const roadDistance =
    (Math.abs(angleDiff) * Math.max(0.2, r) * 690) /
    Math.sqrt(1 + ((r * Math.PI * 2.5) / 0.75) ** 2);
  const blend = (1 - smooth(16, 32, roadDistance)) * smooth(0.2, 0.25, r);
  const depth = bench * (1 - blend) + raw * blend;
  const wall = smooth(0.7, 0.9, step % 1) * (1 - blend);
  const weathering =
    (Math.sin(x * 0.19 + z * 0.12) + 0.5 * Math.sin(x * 0.43 - z * 0.27)) *
    wall *
    0.85;
  const floor = raw >= 252 ? 0.35 * Math.sin(x * 0.15) * Math.cos(z * 0.13) : 0;
  return original - depth + weathering + floor;
}
export function createSite(): Site {
  const size = 601,
    extent = 2400,
    reference: Grid = { size, extent, values: new Float32Array(size * size) },
    baseline: Grid = { size, extent, values: new Float32Array(size * size) },
    latest: Grid = { size, extent, values: new Float32Array(size * size) };
  for (let i = 0; i < size * size; i++) {
    const { x, z } = gridPoint(reference, i),
      h = terrain(x, z);
    reference.values[i] = ground(x, z);
    baseline.values[i] = h;
    const east = Math.hypot((x - 710) / 230, (z - 30) / 155),
      deep = Math.hypot((x + 170) / 140, (z + 60) / 100);
    const eastCut = east < 1 ? 95 * Math.pow(1 - east * east, 0.65) : 0,
      deepCut = deep < 1 ? 42 * (1 - deep * deep) : 0;
    latest.values[i] = Math.min(h, ground(x, z) - eastCut) - deepCut;
  }
  const boundary = Array.from({ length: 80 }, (_, i) => {
    const a = (i / 80) * Math.PI * 2;
    return { x: -150 + 900 * Math.cos(a), z: 710 * Math.sin(a) };
  });
  return {
    name: "Aravalli Open-Pit",
    id: "STR-014",
    source:
      "Procedurally generated terrain and survey scenarios. Local engineering coordinates; not a surveyed Indian mine.",
    reference,
    baseline,
    latest,
    boundary,
    permittedElevation: -155,
    tolerance: 2,
    dates: { baseline: "2026-09-15", latest: "2026-10-15" },
  };
}
export function analyze(site: Site, key: SurveyKey): Finding[] {
  const grid = site[key],
    n = grid.size - 1,
    step = grid.extent / n,
    findings: Finding[] = [];
  for (const kind of ["boundary", "depth"] as const) {
    const marks = new Map<number, { point: Point; value: number }>();
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const point = {
            x: -grid.extent / 2 + (i + 0.5) * step,
            z: -grid.extent / 2 + (j + 0.5) * step,
          },
          h = sample(grid, point),
          ref = sample(site.reference, point);
        if (h === null || ref === null) continue;
        const value =
          kind === "boundary" ? ref - h : site.permittedElevation - h;
        if (
          value > site.tolerance &&
          (kind === "depth" || !inside(point, site.boundary))
        )
          marks.set(j * n + i, { point, value });
      }
    let count = 0;
    while (marks.size) {
      const first = marks.keys().next().value!;
      const queue = [first],
        cells: number[] = [];
      let area = 0,
        volume = 0,
        max = 0,
        point = { x: 0, z: 0 };
      const firstValue = marks.get(first)!;
      marks.delete(first);
      const values = new Map([[first, firstValue]]);
      for (let q = 0; q < queue.length; q++) {
        const id = queue[q],
          item = values.get(id)!;
        cells.push(id);
        area += step * step;
        volume += item.value * step * step;
        if (item.value > max) {
          max = item.value;
          point = item.point;
        }
        const ix = id % n,
          iz = Math.floor(id / n);
        for (const next of [
          ix > 0 ? id - 1 : -1,
          ix < n - 1 ? id + 1 : -1,
          iz > 0 ? id - n : -1,
          iz < n - 1 ? id + n : -1,
        ]) {
          const v = marks.get(next);
          if (v) {
            marks.delete(next);
            values.set(next, v);
            queue.push(next);
          }
        }
      }
      findings.push({
        id: `${kind === "boundary" ? "B" : "D"}-${String(++count).padStart(2, "0")}`,
        kind,
        title:
          kind === "boundary"
            ? "Eastern footprint exceedance"
            : "Lower bench depth exceedance",
        area,
        volume,
        max,
        point,
        cells,
      });
    }
  }
  return findings.sort((a, b) => b.area - a.area);
}
export function sectionProfile(site: Site, a: Point, b: Point) {
  const distance = Math.hypot(b.x - a.x, b.z - a.z),
    count = Math.max(
      181,
      Math.ceil(distance / (site.latest.extent / (site.latest.size - 1))) + 1,
    );
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1),
      point = { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
    return {
      distance: t * distance,
      baseline: sample(site.baseline, point),
      latest: sample(site.latest, point),
    };
  });
}
export const gridResolution = (grid: Grid) => grid.extent / (grid.size - 1);
export const site = createSite();
export const number = (value: number, digits = 0) =>
  value.toLocaleString("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
