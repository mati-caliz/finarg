import { formatBillonesAR, formatMoneyAR, formatNumberAR, formatUsdAR } from "@/lib/numberFormat";

export type GoodWhen = "up" | "down" | "neutral";

export type VariationMode = "pct" | "delta" | "none";

export interface IndicatorDisplay {
  code: string;
  label: string;
  unit?: string;
  href: string;
  goodWhen: GoodWhen;
  preferredSource?: string;
  historySource?: string;
  format: (value: number) => string;
  variation: VariationMode;
  variationSuffix?: string;
  sparkPoints: number;
}

export const SOURCE_LABELS: Record<string, string> = {
  bcra: "BCRA",
  datosgobar: "datos.gob.ar",
  argentinadatos: "Argentina Datos",
  dolarapi: "DolarAPI",
  coingecko: "CoinGecko",
  utdt: "UTDT",
  labrecha: "La Brecha (calculado)",
  iaraf: "IARAF",
  hcdn: "HCDN",
};

export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export const PERIOD_LABELS: Record<string, string> = {
  dollar_official: "diario",
  dollar_blue: "diario",
  country_risk: "diario",
  international_reserves: "diario",
  cpi_monthly: "mensual",
  cpi_yoy: "mensual",
  poverty_persons: "semestral",
  unemployment: "trimestral",
  government_confidence: "mensual",
};

export const FEATURED_INDICATOR_CODES = [
  "dollar_official",
  "dollar_blue",
  "cpi_monthly",
  "country_risk",
  "international_reserves",
  "cpi_yoy",
  "poverty_persons",
  "unemployment",
  "government_confidence",
] as const;

export const FEATURED_INDICATORS: IndicatorDisplay[] = [
  {
    code: "dollar_official",
    label: "Dólar oficial",
    unit: "ARS",
    href: "/indicador/dollar_official",
    goodWhen: "down",
    preferredSource: "dolarapi",
    historySource: "argentinadatos",
    format: (value) => formatMoneyAR(value),
    variation: "pct",
    sparkPoints: 30,
  },
  {
    code: "dollar_blue",
    label: "Dólar blue",
    unit: "ARS",
    href: "/indicador/dollar_blue",
    goodWhen: "down",
    preferredSource: "dolarapi",
    historySource: "argentinadatos",
    format: (value) => formatMoneyAR(value),
    variation: "pct",
    sparkPoints: 30,
  },
  {
    code: "cpi_monthly",
    label: "Inflación mensual",
    unit: "%",
    href: "/indicador/cpi_monthly",
    goodWhen: "down",
    preferredSource: "argentinadatos",
    format: (value) => formatNumberAR(value, 1),
    variation: "delta",
    variationSuffix: " pp",
    sparkPoints: 24,
  },
  {
    code: "country_risk",
    label: "Riesgo país",
    unit: "pb",
    href: "/indicador/country_risk",
    goodWhen: "down",
    preferredSource: "argentinadatos",
    format: (value) => formatNumberAR(value),
    variation: "pct",
    sparkPoints: 60,
  },
  {
    code: "international_reserves",
    label: "Reservas internacionales",
    unit: "USD M",
    href: "/indicador/international_reserves",
    goodWhen: "up",
    preferredSource: "bcra",
    format: (value) => formatNumberAR(value),
    variation: "pct",
    sparkPoints: 60,
  },
  {
    code: "cpi_yoy",
    label: "Inflación interanual",
    unit: "%",
    href: "/indicador/cpi_yoy",
    goodWhen: "down",
    preferredSource: "argentinadatos",
    format: (value) => formatNumberAR(value, 1),
    variation: "delta",
    variationSuffix: " pp",
    sparkPoints: 24,
  },
  {
    code: "poverty_persons",
    label: "Pobreza",
    unit: "%",
    href: "/indicador/poverty_persons",
    goodWhen: "down",
    preferredSource: "datosgobar",
    format: (value) => formatNumberAR(value, 1),
    variation: "delta",
    variationSuffix: " pp",
    sparkPoints: 12,
  },
  {
    code: "unemployment",
    label: "Desempleo",
    unit: "%",
    href: "/indicador/unemployment",
    goodWhen: "down",
    preferredSource: "datosgobar",
    format: (value) => formatNumberAR(value, 1),
    variation: "delta",
    variationSuffix: " pp",
    sparkPoints: 16,
  },
  {
    code: "government_confidence",
    label: "Confianza en el gobierno",
    unit: "pts",
    href: "/indicador/government_confidence",
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

export type IndicatorFamily = "precios" | "dolar" | "monetario" | "fiscal" | "empleo" | "social";

export const INDICATOR_FAMILY_LABELS: Record<IndicatorFamily, string> = {
  precios: "Precios e inflación",
  dolar: "Dólar y mercados",
  monetario: "Monetario y crédito",
  fiscal: "Fiscal e impuestos",
  empleo: "Empleo y actividad",
  social: "Social",
};

export const INDICATOR_FAMILY_ORDER: IndicatorFamily[] = [
  "precios",
  "dolar",
  "monetario",
  "fiscal",
  "empleo",
  "social",
];

export interface IndicatorMeta {
  label: string;
  family: IndicatorFamily;
  unit?: string;
  goodWhen?: GoodWhen;
  format: (value: number) => string;
}

const num0 = (value: number) => formatNumberAR(value);
const num1 = (value: number) => formatNumberAR(value, 1);
const num2 = (value: number) => formatNumberAR(value, 2);
const money = (value: number) => formatMoneyAR(value);
const billones = (value: number) => formatBillonesAR(value);
const usd = (value: number) => formatUsdAR(value, value < 100 ? 2 : 0);

export const INDICATOR_META: Record<string, IndicatorMeta> = {
  cpi_monthly: {
    label: "Inflación mensual",
    family: "precios",
    unit: "%",
    goodWhen: "down",
    format: num1,
  },
  cpi_yoy: {
    label: "Inflación interanual",
    family: "precios",
    unit: "%",
    goodWhen: "down",
    format: num1,
  },
  cpi_level_general: { label: "IPC nivel general", family: "precios", unit: "pts", format: num1 },
  inflation_expectations_rem: {
    label: "Inflación esperada (REM)",
    family: "precios",
    unit: "%",
    goodWhen: "down",
    format: num1,
  },
  basic_basket_national: {
    label: "Canasta básica total",
    family: "precios",
    unit: "ARS",
    goodWhen: "down",
    format: money,
  },
  big_mac_ars: { label: "Big Mac (ARS)", family: "precios", unit: "ARS", format: money },
  big_mac_usd: {
    label: "Big Mac (USD)",
    family: "precios",
    unit: "USD",
    format: (value) => formatUsdAR(value, 2),
  },
  big_mac_valuation: {
    label: "Big Mac sub/sobrevaluación",
    family: "precios",
    unit: "%",
    format: num1,
  },

  dollar_official: {
    label: "Dólar oficial",
    family: "dolar",
    unit: "ARS",
    goodWhen: "down",
    format: money,
  },
  dollar_blue: {
    label: "Dólar blue",
    family: "dolar",
    unit: "ARS",
    goodWhen: "down",
    format: money,
  },
  dollar_mep: {
    label: "Dólar MEP (bolsa)",
    family: "dolar",
    unit: "ARS",
    goodWhen: "down",
    format: money,
  },
  dollar_ccl: {
    label: "Dólar contado con liqui",
    family: "dolar",
    unit: "ARS",
    goodWhen: "down",
    format: money,
  },
  dollar_crypto: {
    label: "Dólar cripto",
    family: "dolar",
    unit: "ARS",
    goodWhen: "down",
    format: money,
  },
  dollar_wholesale: {
    label: "Dólar mayorista",
    family: "dolar",
    unit: "ARS",
    goodWhen: "down",
    format: money,
  },
  dollar_card: {
    label: "Dólar tarjeta",
    family: "dolar",
    unit: "ARS",
    goodWhen: "down",
    format: money,
  },
  country_risk: {
    label: "Riesgo país",
    family: "dolar",
    unit: "pb",
    goodWhen: "down",
    format: num0,
  },
  crypto_btc: { label: "Bitcoin", family: "dolar", unit: "USD", format: usd },
  crypto_eth: { label: "Ethereum", family: "dolar", unit: "USD", format: usd },
  crypto_bnb: { label: "BNB", family: "dolar", unit: "USD", format: usd },
  crypto_xrp: { label: "XRP", family: "dolar", unit: "USD", format: usd },
  crypto_ada: { label: "Cardano", family: "dolar", unit: "USD", format: usd },
  crypto_sol: { label: "Solana", family: "dolar", unit: "USD", format: usd },

  international_reserves: {
    label: "Reservas internacionales",
    family: "monetario",
    unit: "USD M",
    goodWhen: "up",
    format: num0,
  },
  monetary_base: {
    label: "Base monetaria",
    family: "monetario",
    unit: "ARS",
    goodWhen: "down",
    format: billones,
  },
  private_sector_loans: {
    label: "Préstamos al sector privado",
    family: "monetario",
    unit: "ARS",
    goodWhen: "up",
    format: billones,
  },
  rate_tamar: { label: "Tasa TAMAR", family: "monetario", unit: "% TNA", format: num1 },
  rate_time_deposit: {
    label: "Plazo fijo minorista",
    family: "monetario",
    unit: "% TNA",
    goodWhen: "up",
    format: num1,
  },
  rate_personal_loans: {
    label: "Tasa préstamos personales",
    family: "monetario",
    unit: "% TNA",
    goodWhen: "down",
    format: num1,
  },
  rate_overdraft: {
    label: "Tasa adelantos cta. cte.",
    family: "monetario",
    unit: "% TNA",
    goodWhen: "down",
    format: num1,
  },
  icl: { label: "ICL (alquileres)", family: "monetario", unit: "índice", format: num2 },

  tax_revenue: {
    label: "Recaudación tributaria",
    family: "fiscal",
    unit: "ARS",
    goodWhen: "up",
    format: billones,
  },
  current_expenditure: {
    label: "Gasto corriente",
    family: "fiscal",
    unit: "ARS",
    goodWhen: "down",
    format: billones,
  },
  capital_expenditure: {
    label: "Gasto de capital",
    family: "fiscal",
    unit: "ARS",
    format: billones,
  },
  primary_balance: {
    label: "Resultado primario",
    family: "fiscal",
    unit: "ARS",
    goodWhen: "up",
    format: billones,
  },
  financial_balance: {
    label: "Resultado financiero",
    family: "fiscal",
    unit: "ARS",
    goodWhen: "up",
    format: billones,
  },
  energy_subsidies: {
    label: "Subsidios a la energía",
    family: "fiscal",
    unit: "ARS",
    goodWhen: "down",
    format: billones,
  },
  transport_subsidies: {
    label: "Subsidios al transporte",
    family: "fiscal",
    unit: "ARS",
    goodWhen: "down",
    format: billones,
  },
  taxes_total: {
    label: "Impuestos vigentes",
    family: "fiscal",
    unit: "tributos",
    goodWhen: "down",
    format: num0,
  },
  taxes_national: {
    label: "Impuestos nacionales",
    family: "fiscal",
    unit: "tributos",
    goodWhen: "down",
    format: num0,
  },
  taxes_provincial: {
    label: "Impuestos provinciales",
    family: "fiscal",
    unit: "tributos",
    goodWhen: "down",
    format: num0,
  },
  taxes_municipal: {
    label: "Impuestos municipales",
    family: "fiscal",
    unit: "tributos",
    goodWhen: "down",
    format: num0,
  },

  emae: {
    label: "Actividad económica (EMAE)",
    family: "empleo",
    unit: "pts",
    goodWhen: "up",
    format: num1,
  },
  industrial_production: {
    label: "Producción industrial (IPI)",
    family: "empleo",
    unit: "pts",
    goodWhen: "up",
    format: num1,
  },
  unemployment: { label: "Desempleo", family: "empleo", unit: "%", goodWhen: "down", format: num1 },
  informal_employment: {
    label: "Empleo no registrado",
    family: "empleo",
    unit: "%",
    goodWhen: "down",
    format: num1,
  },
  private_wage_employment: {
    label: "Empleo asalariado privado",
    family: "empleo",
    unit: "miles",
    goodWhen: "up",
    format: num0,
  },
  public_wage_employment: {
    label: "Empleo asalariado público",
    family: "empleo",
    unit: "miles",
    format: num0,
  },
  domestic_workers_employment: {
    label: "Empleo en casas particulares",
    family: "empleo",
    unit: "miles",
    format: num0,
  },
  self_employed_autonomous: {
    label: "Trabajadores autónomos",
    family: "empleo",
    unit: "miles",
    format: num0,
  },
  self_employed_monotax: {
    label: "Monotributistas",
    family: "empleo",
    unit: "miles",
    format: num0,
  },
  self_employed_social_monotax: {
    label: "Monotributistas sociales",
    family: "empleo",
    unit: "miles",
    format: num0,
  },
  ripte: { label: "Salario (RIPTE)", family: "empleo", unit: "ARS", goodWhen: "up", format: money },
  wage_index: {
    label: "Índice de salarios",
    family: "empleo",
    unit: "pts",
    goodWhen: "up",
    format: num1,
  },
  minimum_wage: {
    label: "Salario mínimo (SMVM)",
    family: "empleo",
    unit: "ARS",
    goodWhen: "up",
    format: money,
  },
  minimum_wage_real: {
    label: "Salario mínimo a precios constantes",
    family: "empleo",
    unit: "ARS",
    goodWhen: "up",
    format: money,
  },
  pension_minimum: {
    label: "Jubilación mínima",
    family: "social",
    unit: "ARS",
    goodWhen: "up",
    format: money,
  },
  pension_minimum_real: {
    label: "Jubilación mínima a precios constantes",
    family: "social",
    unit: "ARS",
    goodWhen: "up",
    format: money,
  },
  pension_beneficiaries: {
    label: "Jubilaciones y pensiones pagadas",
    family: "social",
    unit: "prestaciones",
    format: num0,
  },
  universal_child_allowance: {
    label: "Asignación Universal por Hijo",
    family: "social",
    unit: "ARS",
    goodWhen: "up",
    format: money,
  },
  implicit_fx_rate: {
    label: "Dólar de convertibilidad",
    family: "monetario",
    unit: "ARS",
    format: money,
  },

  poverty_persons: {
    label: "Pobreza",
    family: "social",
    unit: "%",
    goodWhen: "down",
    format: num1,
  },
  government_confidence: {
    label: "Confianza en el gobierno",
    family: "social",
    unit: "pts",
    goodWhen: "up",
    format: num2,
  },
};

export type Cadence = "daily" | "monthly" | "quarterly" | "biannual" | "annual";

export const CADENCE_LABELS: Record<Cadence, string> = {
  daily: "diaria",
  monthly: "mensual",
  quarterly: "trimestral",
  biannual: "semestral",
  annual: "anual",
};

const CADENCE_DAILY_EXTRA = new Set([
  "international_reserves",
  "implicit_fx_rate",
  "monetary_base",
  "rate_tamar",
  "rate_time_deposit",
  "rate_personal_loans",
  "rate_overdraft",
  "private_sector_loans",
  "icl",
]);
const CADENCE_QUARTERLY = new Set(["unemployment", "informal_employment"]);
const CADENCE_BIANNUAL = new Set(["poverty_persons"]);
const CADENCE_ANNUAL = new Set([
  "big_mac_ars",
  "big_mac_usd",
  "big_mac_valuation",
  "taxes_total",
  "taxes_national",
  "taxes_provincial",
  "taxes_municipal",
]);

export function cadenceForCode(code: string): Cadence {
  if (CADENCE_ANNUAL.has(code)) {
    return "annual";
  }
  if (CADENCE_BIANNUAL.has(code)) {
    return "biannual";
  }
  if (CADENCE_QUARTERLY.has(code)) {
    return "quarterly";
  }
  if (CADENCE_DAILY_EXTRA.has(code) || INDICATOR_META[code]?.family === "dolar") {
    return "daily";
  }
  return "monthly";
}

export function getIndicatorMeta(code: string): IndicatorMeta | undefined {
  return INDICATOR_META[code];
}

export function indicatorLabel(code: string): string {
  return INDICATOR_META[code]?.label ?? INDICATOR_BY_CODE[code]?.label ?? code;
}

export function getIndicatorDisplay(code: string): IndicatorDisplay {
  const featured = INDICATOR_BY_CODE[code];
  if (featured) {
    return featured;
  }
  const meta = INDICATOR_META[code];
  return {
    code,
    label: meta?.label ?? code,
    ...(meta?.unit === undefined ? {} : { unit: meta.unit }),
    href: `/indicador/${code}`,
    goodWhen: meta?.goodWhen ?? "down",
    format: meta?.format ?? ((value) => formatNumberAR(value, 2)),
    variation: "pct",
    sparkPoints: 60,
  };
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
  labrecha:
    "Serie calculada por nosotros a partir de otras dos que sí son de fuente oficial; el detalle del cálculo está en la metadata de cada dato y en /metodologia.",
};

export const DEFAULT_RANGE = "1A";

export const RANGE_MONTHS: Record<string, number> = {
  "1M": 1,
  "6M": 6,
  "1A": 12,
  "5A": 60,
  Máx: Number.POSITIVE_INFINITY,
};
