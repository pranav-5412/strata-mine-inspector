export function fitReportImage(width: number, height: number) {
  const scale = Math.min(176 / width, 95 / height);
  return { width: width * scale, height: height * scale };
}
