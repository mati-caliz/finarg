import type { GoodWhen } from "@/components/core";

export type VariationMode = "pct" | "delta" | "none";

export interface IndicatorDisplay {
  code: string;
  label: string;
  unit?: string;
  href: string;
  goodWhen: GoodWhen;
  preferredSource?: string;
  format: (value: number) => string;
  variation: VariationMode;
  variationSuffix?: string;
  sparkPoints: number;
}

export function formatNumberAR(value: number, fractionDigits = 0): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatMoneyAR(value: number, fractionDigits = 0): string {
  return `$ ${formatNumberAR(value, fractionDigits)}`;
}

const MILLONES_POR_BILLON = 1_000_000;

export function formatBillonesAR(valueInMillones: number, fractionDigits = 2): string {
  return `$ ${formatNumberAR(valueInMillones / MILLONES_POR_BILLON, fractionDigits)} billones`;
}

export function formatDateAR(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${day}/${month}/${year}`;
}

export const SOURCE_LABELS: Record<string, string> = {
  bcra: "BCRA",
  datosgobar: "datos.gob.ar",
  argentinadatos: "Argentina Datos",
  dolarapi: "DolarAPI",
  coingecko: "CoinGecko",
  utdt: "UTDT",
};

export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export const PERIOD_LABELS: Record<string, string> = {
  dolar_oficial: "diario",
  dolar_blue: "diario",
  riesgo_pais: "diario",
  reservas_internacionales: "diario",
  ipc_mensual: "mensual",
  ipc_interanual: "mensual",
  pobreza_personas: "semestral",
  desempleo: "trimestral",
  confianza_gobierno: "mensual",
};

export const FEATURED_INDICATOR_CODES = [
  "dolar_oficial",
  "dolar_blue",
  "ipc_mensual",
  "riesgo_pais",
  "reservas_internacionales",
  "ipc_interanual",
  "pobreza_personas",
  "desempleo",
  "confianza_gobierno",
] as const;

export const FEATURED_INDICATORS: IndicatorDisplay[] = [
  {
    code: "dolar_oficial",
    label: "Dólar oficial",
    unit: "ARS",
    href: "/indicador/dolar_oficial",
    goodWhen: "down",
    preferredSource: "dolarapi",
    format: (value) => formatMoneyAR(value),
    variation: "pct",
    sparkPoints: 30,
  },
  {
    code: "dolar_blue",
    label: "Dólar blue",
    unit: "ARS",
    href: "/indicador/dolar_blue",
    goodWhen: "down",
    preferredSource: "dolarapi",
    format: (value) => formatMoneyAR(value),
    variation: "pct",
    sparkPoints: 30,
  },
  {
    code: "ipc_mensual",
    label: "Inflación mensual",
    unit: "%",
    href: "/indicador/ipc_mensual",
    goodWhen: "down",
    preferredSource: "argentinadatos",
    format: (value) => formatNumberAR(value, 1),
    variation: "delta",
    variationSuffix: " pp",
    sparkPoints: 24,
  },
  {
    code: "riesgo_pais",
    label: "Riesgo país",
    unit: "pb",
    href: "/indicador/riesgo_pais",
    goodWhen: "down",
    preferredSource: "argentinadatos",
    format: (value) => formatNumberAR(value),
    variation: "pct",
    sparkPoints: 60,
  },
  {
    code: "reservas_internacionales",
    label: "Reservas internacionales",
    unit: "USD M",
    href: "/indicador/reservas_internacionales",
    goodWhen: "up",
    preferredSource: "bcra",
    format: (value) => formatNumberAR(value),
    variation: "pct",
    sparkPoints: 60,
  },
  {
    code: "ipc_interanual",
    label: "Inflación interanual",
    unit: "%",
    href: "/indicador/ipc_interanual",
    goodWhen: "down",
    preferredSource: "argentinadatos",
    format: (value) => formatNumberAR(value, 1),
    variation: "delta",
    variationSuffix: " pp",
    sparkPoints: 24,
  },
  {
    code: "pobreza_personas",
    label: "Pobreza",
    unit: "%",
    href: "/indicador/pobreza_personas",
    goodWhen: "down",
    preferredSource: "datosgobar",
    format: (value) => formatNumberAR(value, 1),
    variation: "delta",
    variationSuffix: " pp",
    sparkPoints: 12,
  },
  {
    code: "desempleo",
    label: "Desempleo",
    unit: "%",
    href: "/indicador/desempleo",
    goodWhen: "down",
    preferredSource: "datosgobar",
    format: (value) => formatNumberAR(value, 1),
    variation: "delta",
    variationSuffix: " pp",
    sparkPoints: 16,
  },
  {
    code: "confianza_gobierno",
    label: "Confianza en el gobierno",
    unit: "pts",
    href: "/indicador/confianza_gobierno",
    goodWhen: "up",
    preferredSource: "utdt",
    format: (value) => formatNumberAR(value, 2),
    variation: "delta",
    variationSuffix: " pts",
    sparkPoints: 24,
  },
];

export const INDICATOR_BY_CODE: Record<string, IndicatorDisplay> = Object.fromEntries(
  FEATURED_INDICATORS.map((indicator) => [indicator.code, indicator]),
);

export function getIndicatorDisplay(code: string): IndicatorDisplay {
  return (
    INDICATOR_BY_CODE[code] ?? {
      code,
      label: code,
      href: `/indicador/${code}`,
      goodWhen: "down",
      format: (value) => formatNumberAR(value, 2),
      variation: "pct",
      sparkPoints: 60,
    }
  );
}

export const SOURCE_METHODOLOGY: Record<string, string> = {
  bcra: "Serie diaria oficial del BCRA (reservas internacionales, variable monetaria).",
  datosgobar:
    "Serie publicada en el portal datos.gob.ar a partir de fuentes oficiales (INDEC, BCRA, Ministerio de Economía).",
  argentinadatos:
    "Datos históricos compilados por Argentina Datos a partir de publicaciones oficiales del INDEC y el mercado.",
  dolarapi: "Cotización de referencia publicada por DolarAPI.",
  coingecko: "Precio de mercado informado por CoinGecko.",
  utdt: "Índice de Confianza en el Gobierno (ICG) de la Escuela de Gobierno de la UTDT, escala 0 a 5.",
};

export const RANGE_MONTHS: Record<string, number> = {
  "1M": 1,
  "6M": 6,
  "1A": 12,
  "5A": 60,
  Máx: Number.POSITIVE_INFINITY,
};
