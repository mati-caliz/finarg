import { formatMoneyAR, formatNumberAR } from "@/lib/indicators";

export type GapMode = "pct" | "pp";

export interface GapLeg {
  code: string;
  source: string;
  historySource?: string;
  label: string;
}

export interface GapDef {
  id: string;
  label: string;
  subtitle: string;
  unit?: string;
  format: (value: number) => string;
  gapMode: GapMode;
  narrowIsGood: boolean;
  legs: [GapLeg, GapLeg];
}

export const GAPS: GapDef[] = [
  {
    id: "cambiaria",
    label: "Brecha cambiaria (blue)",
    subtitle: "Dólar blue frente al oficial",
    unit: "ARS",
    format: (value) => formatMoneyAR(value),
    gapMode: "pct",
    narrowIsGood: true,
    legs: [
      { code: "dollar_blue", source: "dolarapi", historySource: "argentinadatos", label: "Blue" },
      { code: "dollar_official", source: "dolarapi", historySource: "argentinadatos", label: "Oficial" },
    ],
  },
  {
    id: "financiera",
    label: "Brecha financiera (MEP)",
    subtitle: "Dólar MEP (bolsa) frente al oficial",
    unit: "ARS",
    format: (value) => formatMoneyAR(value),
    gapMode: "pct",
    narrowIsGood: true,
    legs: [
      { code: "dollar_mep", source: "dolarapi", historySource: "argentinadatos", label: "MEP" },
      { code: "dollar_official", source: "dolarapi", historySource: "argentinadatos", label: "Oficial" },
    ],
  },
  {
    id: "inflacion-esperada",
    label: "Inflación esperada vs. medida",
    subtitle: "Expectativa del REM (12m) frente a la inflación interanual medida",
    unit: "%",
    format: (value) => formatNumberAR(value, 1),
    gapMode: "pp",
    narrowIsGood: false,
    legs: [
      { code: "inflation_expectations_rem", source: "datosgobar", label: "Esperada (REM 12m)" },
      { code: "cpi_yoy", source: "argentinadatos", label: "Medida (interanual)" },
    ],
  },
  {
    id: "reservas",
    label: "Reservas: BCRA vs. datos.gob.ar",
    subtitle: "La misma serie medida por dos fuentes oficiales",
    unit: "USD M",
    format: (value) => formatNumberAR(value),
    gapMode: "pct",
    narrowIsGood: false,
    legs: [
      { code: "international_reserves", source: "bcra", label: "BCRA (diaria)" },
      { code: "international_reserves", source: "datosgobar", label: "datos.gob.ar (mensual)" },
    ],
  },
];

export const GAP_BY_ID: Record<string, GapDef> = Object.fromEntries(
  GAPS.map((gap) => [gap.id, gap]),
);

export interface GapResult {
  gapPct: number;
  gapValue: number;
  formattedGap: string;
}

export function computeGap(def: GapDef, valueA: number, valueB: number): GapResult {
  const gapValue = valueA - valueB;
  const gapPct = valueB !== 0 ? (gapValue / Math.abs(valueB)) * 100 : 0;
  const magnitude = Math.abs(gapValue);
  const formattedGap =
    def.gapMode === "pct"
      ? `${formatNumberAR(Math.abs(gapPct), 1)} %`
      : `${formatNumberAR(magnitude, 1)} pp`;
  return { gapPct, gapValue, formattedGap };
}
