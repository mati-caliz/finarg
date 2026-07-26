import { COMPARE_BASE, commonMonths, indexToBase } from "@/lib/compare";
import type { IndicatorPoint } from "@/lib/labrechaApi";

function point(date: string, value: string): IndicatorPoint {
  return { date, value, source: "test", meta: {} };
}

describe("commonMonths", () => {
  it("keeps only the months both series measured, in order", () => {
    const left = [point("2026-01-31", "100"), point("2026-02-28", "110")];
    const right = [point("2026-02-15", "50"), point("2026-03-31", "60")];

    expect(commonMonths(left, right)).toEqual(["2026-02"]);
  });

  it("is empty when the series never overlap", () => {
    const left = [point("2024-01-31", "100")];
    const right = [point("2026-01-31", "100")];

    expect(commonMonths(left, right)).toEqual([]);
  });

  it("collapses several readings of the same month into one", () => {
    const left = [point("2026-01-05", "100"), point("2026-01-28", "120")];
    const right = [point("2026-01-31", "50")];

    expect(commonMonths(left, right)).toEqual(["2026-01"]);
  });
});

describe("indexToBase", () => {
  it("puts both series at the same base so only the pace is compared", () => {
    const points = [point("2026-01-31", "200"), point("2026-02-28", "300")];
    const indexed = indexToBase(points, ["2026-01", "2026-02"]);

    expect(indexed?.values).toEqual([COMPARE_BASE, 150]);
    expect(indexed?.changePct).toBe(50);
    expect(indexed?.baseDate).toBe("2026-01");
  });

  it("leaves a hole instead of inventing a value for a month without data", () => {
    const points = [point("2026-01-31", "100"), point("2026-03-31", "150")];
    const indexed = indexToBase(points, ["2026-01", "2026-02", "2026-03"]);

    expect(indexed?.values).toEqual([COMPARE_BASE, null, 150]);
  });

  it("refuses to index when the base month is zero", () => {
    expect(indexToBase([point("2026-01-31", "0")], ["2026-01"])).toBeNull();
  });

  it("refuses to index without any common month", () => {
    expect(indexToBase([point("2026-01-31", "100")], [])).toBeNull();
  });

  it("uses the last reading of the base month", () => {
    const points = [point("2026-01-05", "100"), point("2026-01-30", "200")];
    const indexed = indexToBase(points, ["2026-01"]);

    expect(indexed?.firstValue).toBe(200);
  });
});
