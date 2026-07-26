import { crossesThreshold, describeAlert, parseThresholdAlert } from "@/lib/feedAlerts";

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("parseThresholdAlert", () => {
  it("returns null when no threshold is asked for", () => {
    expect(parseThresholdAlert(params(""))).toBeNull();
    expect(parseThresholdAlert(params("umbral="))).toBeNull();
  });

  it("defaults to alerting above the threshold", () => {
    expect(parseThresholdAlert(params("umbral=1500"))).toEqual({
      threshold: 1500,
      direction: "arriba",
    });
  });

  it("accepts the argentine decimal comma", () => {
    expect(parseThresholdAlert(params("umbral=2,5"))?.threshold).toBe(2.5);
  });

  it("honours an explicit downward direction", () => {
    expect(parseThresholdAlert(params("umbral=10&direccion=abajo"))?.direction).toBe("abajo");
  });

  it("ignores a direction it does not know", () => {
    expect(parseThresholdAlert(params("umbral=10&direccion=costado"))?.direction).toBe("arriba");
  });

  it("returns null for a threshold that is not a number", () => {
    expect(parseThresholdAlert(params("umbral=mucho"))).toBeNull();
  });
});

describe("crossesThreshold", () => {
  it("fires upward only above the threshold", () => {
    const alert = { threshold: 100, direction: "arriba" } as const;

    expect(crossesThreshold(101, alert)).toBe(true);
    expect(crossesThreshold(100, alert)).toBe(false);
    expect(crossesThreshold(99, alert)).toBe(false);
  });

  it("fires downward only below the threshold", () => {
    const alert = { threshold: 100, direction: "abajo" } as const;

    expect(crossesThreshold(99, alert)).toBe(true);
    expect(crossesThreshold(100, alert)).toBe(false);
    expect(crossesThreshold(101, alert)).toBe(false);
  });
});

describe("describeAlert", () => {
  it("says which way the alert points", () => {
    expect(describeAlert({ threshold: 5, direction: "arriba" }, "5 %")).toContain("supera 5 %");
    expect(describeAlert({ threshold: 5, direction: "abajo" }, "5 %")).toContain("baja de 5 %");
  });
});
