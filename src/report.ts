import { jsPDF } from "jspdf";
import { site, number } from "./model";
import type { Finding, SurveyKey } from "./model";
export type Review = { status: string; note: string };
export function exportReport(
  findings: Finding[],
  survey: SurveyKey,
  reviews: Record<string, Review>,
  image?: string,
) {
  const doc = new jsPDF();
  let y = 20,
    page = 1;
  const footer = () => {
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(
      "STRATA | Inspection evidence | Generated survey scenario",
      16,
      286,
    );
    doc.text(String(page), 194, 286, { align: "right" });
  };
  const ensure = (height: number) => {
    if (y + height > 270) {
      footer();
      doc.addPage();
      page++;
      y = 20;
    }
  };
  const line = (text: string, size = 10) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 176) as string[];
    for (const item of lines) {
      ensure(7);
      doc.text(item, 16, y);
      y += 6;
    }
  };
  doc.setTextColor(25, 55, 48);
  line("STRATA / MINE INSPECTION", 19);
  y += 4;
  line(`${site.name} | ${site.id}`, 13);
  line(
    `Survey: ${site.dates[survey]} | Exported: ${new Date().toLocaleString("en-IN")}`,
  );
  line(
    `Findings: ${findings.length} | Vertical tolerance: ${site.tolerance} m | Sampling: 4 m cells`,
  );
  y += 4;
  if (image) {
    try {
      const dimensions = doc.getImageProperties(image),
        height = Math.min(95, (176 * dimensions.height) / dimensions.width);
      doc.addImage(image, "PNG", 16, y, 176, height);
      y += height + 6;
    } catch {
      line("Scene image unavailable. Numerical evidence follows.");
    }
  }
  line("DATA AND METHOD", 12);
  line(site.source);
  line(
    "Horizontal: local X/Z metres. Elevation: local vertical reference. Reference ground is the pre-excavation model. Approved footprint and -155 m permitted surface are configured scenario inputs.",
  );
  line(
    "Area and volume are estimates from 4 m cell-centre sampling. Surface interpolation matches rendered mesh triangles. Boundary findings require excavation outside the permitted footprint; depth findings require a vertical exceedance above the 2 m tolerance. Volume totals from different finding types must not be added because they may overlap.",
  );
  y += 6;
  if (!findings.length)
    line(
      "No sampled exceedances were found for the selected survey. This does not establish regulatory compliance.",
    );
  for (const finding of findings) {
    ensure(55);
    doc.setTextColor(25, 55, 48);
    line(`${finding.id} / ${finding.title}`, 12);
    doc.setTextColor(45);
    line(
      `Area: ${number(finding.area)} m2 | Maximum ${finding.kind === "depth" ? "depth exceedance" : "excavation depth outside footprint"}: ${number(finding.max, 1)} m`,
    );
    line(
      `Estimated ${finding.kind === "depth" ? "volume below permitted surface" : "excavated volume outside footprint"}: ${number(finding.volume)} m3`,
    );
    line(
      `Peak sample coordinate: X ${number(finding.point.x, 1)} m, Z ${number(finding.point.z, 1)} m`,
    );
    line(`Review: ${reviews[finding.id]?.status ?? "Unreviewed"}`);
    line(`Inspector note: ${reviews[finding.id]?.note || "No note recorded."}`);
    y += 7;
  }
  footer();
  doc.save(`STRATA-${site.id}-${survey}-inspection.pdf`);
}
