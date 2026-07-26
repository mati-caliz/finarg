import { GAPS, GAP_BY_ID, type GapDef, automaticGapMagnitude, computeGap } from "@/lib/gaps";

const percentGap: GapDef = {
  id: "test-pct",
  label: "Brecha de prueba",
  subtitle: "",
  format: (value) => String(value),
  gapMode: "pct",
  narrowIsGood: true,
  legs: [
    { code: "dollar_blue", source: "dolarapi", label: "Blue" },
    { code: "dollar_official", source: "dolarapi", label: "Oficial" },
  ],
};

const pointsGap: GapDef = { ...percentGap, id: "test-pp", gapMode: "pp" };

describe("computeGap", () => {
  it("measures how much the first leg exceeds the second one", () => {
    const result = computeGap(percentGap, 1500, 1000);

    expect(result.gapValue).toBe(500);
    expect(result.gapPct).toBe(50);
  });

  it("reports a negative gap when the first leg is the lower one", () => {
    const result = computeGap(percentGap, 900, 1000);

    expect(result.gapValue).toBe(-100);
    expect(result.gapPct).toBe(-10);
  });

  it("has no gap when both legs measure the same", () => {
    const result = computeGap(percentGap, 1000, 1000);

    expect(result.gapValue).toBe(0);
    expect(result.gapPct).toBe(0);
  });

  it("does not divide by zero when the baseline leg is zero", () => {
    const result = computeGap(percentGap, 1000, 0);

    expect(result.gapValue).toBe(1000);
    expect(result.gapPct).toBe(0);
  });

  it("uses the absolute baseline so a negative reference keeps the sign of the spread", () => {
    const result = computeGap(percentGap, 50, -50);

    expect(result.gapValue).toBe(100);
    expect(result.gapPct).toBe(200);
  });

  it("formats a percentage gap as a percentage", () => {
    expect(computeGap(percentGap, 1500, 1000).formattedGap).toBe("50,0 %");
  });

  it("formats a rate gap as percentage points", () => {
    expect(computeGap(pointsGap, 30, 22).formattedGap).toBe("8,0 pp");
  });

  it("formats the magnitude, without the sign", () => {
    expect(computeGap(pointsGap, 22, 30).formattedGap).toBe("8,0 pp");
    expect(computeGap(percentGap, 900, 1000).formattedGap).toBe("10,0 %");
  });
});

describe("the curated gaps catalog", () => {
  it("indexes every gap by its id", () => {
    expect(Object.keys(GAP_BY_ID)).toHaveLength(GAPS.length);
    for (const gap of GAPS) {
      expect(GAP_BY_ID[gap.id]).toBe(gap);
    }
  });

  it("has unique ids", () => {
    const ids = GAPS.map((gap) => gap.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("compares two different measurements in every gap", () => {
    for (const gap of GAPS) {
      const [first, second] = gap.legs;
      expect(`${first.code}:${first.source}`).not.toBe(`${second.code}:${second.source}`);
    }
  });

  it("labels both legs so the UI can attribute each measurement", () => {
    for (const gap of GAPS) {
      for (const leg of gap.legs) {
        expect(leg.label.length).toBeGreaterThan(0);
        expect(leg.source.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("the magnitude of an automatic gap", () => {
  it("reports percentage indicators in points, not as a ratio of percentages", () => {
    const magnitude = automaticGapMagnitude("%", 0.6, 24.29);

    expect(magnitude.headline).toBe("0,60 pp");
    expect(magnitude.caption).toContain("más alta");
  });

  it("keeps the relative reading for indicators measured in levels", () => {
    const magnitude = automaticGapMagnitude("ARS", 300, 25);

    expect(magnitude.headline).toBe("25,00 %");
    expect(magnitude.caption).toBe("de discrepancia");
    expect(magnitude.barWidth).toBe(25);
  });

  it("caps the bar so a huge gap cannot overflow its track", () => {
    expect(automaticGapMagnitude("ARS", 10, 900).barWidth).toBe(100);
    expect(automaticGapMagnitude("%", 40, 5).barWidth).toBe(100);
  });

  it("ignores the sign of the spread", () => {
    expect(automaticGapMagnitude("%", -0.6, -24.29).headline).toBe("0,60 pp");
  });
});
