import { sectionProfile, site, number } from "./model";
import type { Point } from "./model";
export default function SectionChart({ points }: { points: [Point, Point] }) {
  const rows = sectionProfile(site, ...points),
    maxDistance = rows.at(-1)!.distance;
  const low =
    Math.floor(
      Math.min(
        site.permittedElevation,
        ...rows.flatMap((r) => [r.baseline ?? Infinity, r.latest ?? Infinity]),
      ) / 50,
    ) *
      50 -
    20;
  const high =
    Math.ceil(
      Math.max(
        ...rows.flatMap((r) => [
          r.baseline ?? -Infinity,
          r.latest ?? -Infinity,
        ]),
      ) / 50,
    ) *
      50 +
    20;
  const x = (v: number) => 60 + (v / Math.max(maxDistance, 1)) * 680,
    y = (v: number) => 185 - ((v - low) / (high - low)) * 150;
  const path = (key: "baseline" | "latest") =>
    rows
      .map((r, i) => `${i ? "L" : "M"}${x(r.distance)},${y(r[key] ?? low)}`)
      .join(" ");
  return (
    <div className="section-chart">
      <div className="section-chart-heading">
        <div>
          <span className="eyebrow">SECTION A — B</span>
          <h3>Excavation profile</h3>
        </div>
        <span className="small">True scale values · independent plot axes</span>
      </div>
      <svg
        viewBox="0 0 800 235"
        role="img"
        aria-label="Cross-section comparing baseline, latest survey, and permitted elevation"
      >
        <defs>
          <linearGradient id="section-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#63b3aa" stopOpacity=".2" />
            <stop offset="100%" stopColor="#63b3aa" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => {
          const value = low + ((high - low) * i) / 3;
          return (
            <g key={i}>
              <line
                x1="60"
                x2="740"
                y1={y(value)}
                y2={y(value)}
                stroke="#314845"
              />
              <text x="50" y={y(value) + 4} textAnchor="end">
                {number(value)}
              </text>
            </g>
          );
        })}
        <path
          d={`${path("latest")}L740,185L60,185Z`}
          fill="url(#section-fill)"
        />
        <line
          x1="60"
          x2="740"
          y1={y(site.permittedElevation)}
          y2={y(site.permittedElevation)}
          stroke="#e7b868"
          strokeDasharray="6 5"
        />
        <path
          d={path("baseline")}
          fill="none"
          stroke="#879b98"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d={path("latest")}
          fill="none"
          stroke="#85d1c6"
          strokeWidth="2.5"
        />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={x(t * maxDistance)} y="205" textAnchor="middle">
            {number(t * maxDistance)} m
          </text>
        ))}
        <text x="400" y="228" textAnchor="middle">
          Distance along section
        </text>
        <text x="12" y="110" transform="rotate(-90 12 110)" textAnchor="middle">
          Elevation (m)
        </text>
      </svg>
      <div className="section-legend">
        <span>
          <i className="dot mint" />
          Latest survey
        </span>
        <span>
          <i className="dot gray" />
          Baseline
        </span>
        <span>
          <i className="dot amber" />
          Permitted elevation: −155 m
        </span>
      </div>
    </div>
  );
}
