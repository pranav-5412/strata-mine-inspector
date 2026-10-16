import { expect, test } from "vitest";
import { fitReportImage } from "./reportImage";
test.each([
  [800, 1200],
  [1920, 1080],
  [2400, 600],
])("fits %i x %i without distortion", (width, height) => {
  const fitted = fitReportImage(width, height);
  expect(fitted.width).toBeLessThanOrEqual(176);
  expect(fitted.height).toBeLessThanOrEqual(95);
  expect(fitted.width / fitted.height).toBeCloseTo(width / height);
});
