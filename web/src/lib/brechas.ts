import { formatMoneyAR, formatNumberAR } from "@/lib/indicators";

export type GapMode = "pct" | "pp";

export interface BrechaLeg {
  code: string;
  source: string;
  historySource?: string;
  label: string;
}

export interface BrechaDef {
  id: string;
  label: string;
  subtitle: string;
  unit?: string;
  format: (value: number) => string;
  gapMode: GapMode;
  narrowIsGood: boolean;
  legs: [BrechaLeg, BrechaLeg];
}

export const BRECHAS: BrechaDef[] = [
  {
    id: "cambiaria",
    label: "Brecha cambiaria (blue)",
    subtitle: "Dólar blue frente al oficial",
    unit: "ARS",
    format: (value) => formatMoneyAR(value),
    gapMode: "pct",
    narrowIsGood: true,
    legs: [
      { code: "dolar_blue", source: "dolarapi", historySource: "argentinadatos", label: "Blue" },
      { code: "dolar_oficial", source: "dolarapi", historySource: "argentinadatos", label: "Oficial" },
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
      { code: "dolar_bolsa", source: "dolarapi", historySource: "argentinadatos", label: "MEP" },
      { code: "dolar_oficial", source: "dolarapi", historySource: "argentinadatos", label: "Oficial" },
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
      { code: "expectativas_inflacion_rem", source: "datosgobar", label: "Esperada (REM 12m)" },
      { code: "ipc_interanual", source: "argentinadatos", label: "Medida (interanual)" },
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
      { code: "reservas_internacionales", source: "bcra", label: "BCRA (diaria)" },
      { code: "reservas_internacionales", source: "datosgobar", label: "datos.gob.ar (mensual)" },
    ],
  },
];

export const BRECHA_BY_ID: Record<string, BrechaDef> = Object.fromEntries(
  BRECHAS.map((brecha) => [brecha.id, brecha]),
);

export interface BrechaGap {
  gapPct: number;
  gapValue: number;
  formattedGap: string;
}

export function computeGap(def: BrechaDef, valueA: number, valueB: number): BrechaGap {
  const gapValue = valueA - valueB;
  const gapPct = valueB !== 0 ? (gapValue / Math.abs(valueB)) * 100 : 0;
  const magnitude = Math.abs(gapValue);
  const formattedGap =
    def.gapMode === "pct"
      ? `${formatNumberAR(Math.abs(gapPct), 1)} %`
      : `${formatNumberAR(magnitude, 1)} pp`;
  return { gapPct, gapValue, formattedGap };
}
