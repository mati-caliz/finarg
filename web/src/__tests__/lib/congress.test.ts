import { blocColor, normalizeResult, tallyByBloc } from "@/lib/congress";

describe("normalizeResult", () => {
  it("reads an affirmative result as won", () => {
    expect(normalizeResult("AFIRMATIVO")).toEqual({ label: "afirmativa", won: true });
  });

  it("is case insensitive", () => {
    expect(normalizeResult("Afirmativa").won).toBe(true);
  });

  it("reads anything else as not won", () => {
    expect(normalizeResult("NEGATIVO")).toEqual({ label: "negativa", won: false });
  });

  it("treats a missing result as not won", () => {
    expect(normalizeResult(null)).toEqual({ label: "negativa", won: false });
  });
});

describe("blocColor", () => {
  it("gives each of the first blocs its own series color", () => {
    expect(blocColor(0)).toBe("var(--serie-1)");
    expect(blocColor(5)).toBe("var(--serie-6)");
  });

  it("falls back to a neutral ink for the long tail", () => {
    expect(blocColor(6)).toBe("var(--ink3)");
    expect(blocColor(20)).toBe("var(--ink3)");
  });
});

describe("tallyByBloc", () => {
  it("counts each kind of vote per bloc", () => {
    const tallies = tallyByBloc([
      { bloc: "UxP", vote: "AFIRMATIVO" },
      { bloc: "UxP", vote: "NEGATIVO" },
      { bloc: "UxP", vote: "ABSTENCION" },
      { bloc: "UxP", vote: "AUSENTE" },
    ]);

    expect(tallies).toEqual([
      {
        bloc: "UxP",
        afirmativos: 1,
        negativos: 1,
        abstenciones: 1,
        ausentes: 1,
        total: 4,
      },
    ]);
  });

  it("counts an unknown or missing vote as absent", () => {
    const [tally] = tallyByBloc([
      { bloc: "LLA", vote: null },
      { bloc: "LLA", vote: "" },
    ]);

    expect(tally?.ausentes).toBe(2);
    expect(tally?.total).toBe(2);
  });

  it("groups the deputies without bloc under a single label", () => {
    const [tally] = tallyByBloc([{ bloc: null, vote: "AFIRMATIVO" }]);

    expect(tally?.bloc).toBe("Sin bloque");
  });

  it("orders the blocs from the largest to the smallest", () => {
    const tallies = tallyByBloc([
      { bloc: "Chico", vote: "AFIRMATIVO" },
      { bloc: "Grande", vote: "AFIRMATIVO" },
      { bloc: "Grande", vote: "NEGATIVO" },
      { bloc: "Grande", vote: "NEGATIVO" },
    ]);

    expect(tallies.map((tally) => tally.bloc)).toEqual(["Grande", "Chico"]);
  });

  it("has nothing to tally without votes", () => {
    expect(tallyByBloc([])).toEqual([]);
  });
});
