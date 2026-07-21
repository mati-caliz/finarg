import { PROVINCE_CENTROIDS, projectCentroid } from "@/lib/argentina";

describe("argentina", () => {
  it("has the 24 jurisdictions", () => {
    expect(Object.keys(PROVINCE_CENTROIDS)).toHaveLength(24);
  });

  it("projects within the viewport bounds", () => {
    const width = 190;
    const height = 430;
    for (const centroid of Object.values(PROVINCE_CENTROIDS)) {
      const point = projectCentroid(centroid, width, height);
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(width);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(height);
    }
  });

  it("places northern provinces above southern ones", () => {
    const jujuy = projectCentroid(PROVINCE_CENTROIDS.Jujuy, 190, 430);
    const santaCruz = projectCentroid(PROVINCE_CENTROIDS["Santa Cruz"], 190, 430);
    expect(jujuy.y).toBeLessThan(santaCruz.y);
  });

  it("places western provinces left of eastern ones", () => {
    const mendoza = projectCentroid(PROVINCE_CENTROIDS.Mendoza, 190, 430);
    const misiones = projectCentroid(PROVINCE_CENTROIDS.Misiones, 190, 430);
    expect(mendoza.x).toBeLessThan(misiones.x);
  });
});
