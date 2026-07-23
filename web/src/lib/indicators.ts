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

export function formatNumberAR(value: number, fractionDigits = 0): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatMoneyAR(value: number, fractionDigits = 0): string {
  return `$ ${formatNumberAR(value, fractionDigits)}`;
}

export function formatUsdAR(value: number, fractionDigits = 0): string {
  return `US$ ${formatNumberAR(value, fractionDigits)}`;
}

export const MILLONES_POR_BILLON = 1_000_000;

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
  iaraf: "IARAF",
  hcdn: "HCDN",
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
    historySource: "argentinadatos",
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
    historySource: "argentinadatos",
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
  ipc_mensual: { label: "Inflación mensual", family: "precios", unit: "%", goodWhen: "down", format: num1 },
  ipc_interanual: { label: "Inflación interanual", family: "precios", unit: "%", goodWhen: "down", format: num1 },
  ipc_nivel_general: { label: "IPC nivel general", family: "precios", unit: "pts", format: num1 },
  expectativas_inflacion_rem: { label: "Inflación esperada (REM)", family: "precios", unit: "%", goodWhen: "down", format: num1 },
  cba_nacional: { label: "Canasta básica total", family: "precios", unit: "ARS", goodWhen: "down", format: money },
  big_mac_ars: { label: "Big Mac (ARS)", family: "precios", unit: "ARS", format: money },
  big_mac_usd: { label: "Big Mac (USD)", family: "precios", unit: "USD", format: (value) => formatUsdAR(value, 2) },
  big_mac_valuacion: { label: "Big Mac sub/sobrevaluación", family: "precios", unit: "%", format: num1 },

  dolar_oficial: { label: "Dólar oficial", family: "dolar", unit: "ARS", goodWhen: "down", format: money },
  dolar_blue: { label: "Dólar blue", family: "dolar", unit: "ARS", goodWhen: "down", format: money },
  dolar_bolsa: { label: "Dólar MEP (bolsa)", family: "dolar", unit: "ARS", goodWhen: "down", format: money },
  dolar_contadoconliqui: { label: "Dólar contado con liqui", family: "dolar", unit: "ARS", goodWhen: "down", format: money },
  dolar_cripto: { label: "Dólar cripto", family: "dolar", unit: "ARS", goodWhen: "down", format: money },
  dolar_mayorista: { label: "Dólar mayorista", family: "dolar", unit: "ARS", goodWhen: "down", format: money },
  dolar_tarjeta: { label: "Dólar tarjeta", family: "dolar", unit: "ARS", goodWhen: "down", format: money },
  riesgo_pais: { label: "Riesgo país", family: "dolar", unit: "pb", goodWhen: "down", format: num0 },
  cripto_btc: { label: "Bitcoin", family: "dolar", unit: "USD", format: usd },
  cripto_eth: { label: "Ethereum", family: "dolar", unit: "USD", format: usd },
  cripto_bnb: { label: "BNB", family: "dolar", unit: "USD", format: usd },
  cripto_xrp: { label: "XRP", family: "dolar", unit: "USD", format: usd },
  cripto_ada: { label: "Cardano", family: "dolar", unit: "USD", format: usd },
  cripto_sol: { label: "Solana", family: "dolar", unit: "USD", format: usd },

  reservas_internacionales: { label: "Reservas internacionales", family: "monetario", unit: "USD M", goodWhen: "up", format: num0 },
  base_monetaria: { label: "Base monetaria", family: "monetario", unit: "ARS", goodWhen: "down", format: billones },
  prestamos_sector_privado: { label: "Préstamos al sector privado", family: "monetario", unit: "ARS", goodWhen: "up", format: billones },
  tasa_tamar: { label: "Tasa TAMAR", family: "monetario", unit: "% TNA", format: num1 },
  tasa_plazo_fijo: { label: "Plazo fijo minorista", family: "monetario", unit: "% TNA", goodWhen: "up", format: num1 },
  tasa_prestamos_personales: { label: "Tasa préstamos personales", family: "monetario", unit: "% TNA", goodWhen: "down", format: num1 },
  tasa_adelantos_cuenta_corriente: { label: "Tasa adelantos cta. cte.", family: "monetario", unit: "% TNA", goodWhen: "down", format: num1 },
  icl: { label: "ICL (alquileres)", family: "monetario", unit: "índice", format: num2 },

  recaudacion_tributaria: { label: "Recaudación tributaria", family: "fiscal", unit: "ARS", goodWhen: "up", format: billones },
  gasto_corriente: { label: "Gasto corriente", family: "fiscal", unit: "ARS", goodWhen: "down", format: billones },
  gasto_capital: { label: "Gasto de capital", family: "fiscal", unit: "ARS", format: billones },
  resultado_primario: { label: "Resultado primario", family: "fiscal", unit: "ARS", goodWhen: "up", format: billones },
  resultado_financiero: { label: "Resultado financiero", family: "fiscal", unit: "ARS", goodWhen: "up", format: billones },
  subsidios_energia: { label: "Subsidios a la energía", family: "fiscal", unit: "ARS", goodWhen: "down", format: billones },
  subsidios_transporte: { label: "Subsidios al transporte", family: "fiscal", unit: "ARS", goodWhen: "down", format: billones },
  tributos_total: { label: "Impuestos vigentes", family: "fiscal", unit: "tributos", goodWhen: "down", format: num0 },
  tributos_nacionales: { label: "Impuestos nacionales", family: "fiscal", unit: "tributos", goodWhen: "down", format: num0 },
  tributos_provinciales: { label: "Impuestos provinciales", family: "fiscal", unit: "tributos", goodWhen: "down", format: num0 },
  tributos_municipales: { label: "Impuestos municipales", family: "fiscal", unit: "tributos", goodWhen: "down", format: num0 },

  emae: { label: "Actividad económica (EMAE)", family: "empleo", unit: "pts", goodWhen: "up", format: num1 },
  produccion_industrial: { label: "Producción industrial (IPI)", family: "empleo", unit: "pts", goodWhen: "up", format: num1 },
  desempleo: { label: "Desempleo", family: "empleo", unit: "%", goodWhen: "down", format: num1 },
  empleo_no_registrado: { label: "Empleo no registrado", family: "empleo", unit: "%", goodWhen: "down", format: num1 },
  empleo_asalariado_privado: { label: "Empleo asalariado privado", family: "empleo", unit: "miles", goodWhen: "up", format: num0 },
  empleo_asalariado_publico: { label: "Empleo asalariado público", family: "empleo", unit: "miles", format: num0 },
  empleo_casas_particulares: { label: "Empleo en casas particulares", family: "empleo", unit: "miles", format: num0 },
  empleo_independiente_autonomo: { label: "Trabajadores autónomos", family: "empleo", unit: "miles", format: num0 },
  empleo_independiente_monotributo: { label: "Monotributistas", family: "empleo", unit: "miles", format: num0 },
  empleo_independiente_monotributo_social: { label: "Monotributistas sociales", family: "empleo", unit: "miles", format: num0 },
  ripte: { label: "Salario (RIPTE)", family: "empleo", unit: "ARS", goodWhen: "up", format: money },
  indice_salarios: { label: "Índice de salarios", family: "empleo", unit: "pts", goodWhen: "up", format: num1 },
  salario_minimo: { label: "Salario mínimo (SMVM)", family: "empleo", unit: "ARS", goodWhen: "up", format: money },

  pobreza_personas: { label: "Pobreza", family: "social", unit: "%", goodWhen: "down", format: num1 },
  confianza_gobierno: { label: "Confianza en el gobierno", family: "social", unit: "pts", goodWhen: "up", format: num2 },
};

export type Cadence = "diaria" | "mensual" | "trimestral" | "semestral" | "anual";

const CADENCE_DAILY_EXTRA = new Set([
  "reservas_internacionales",
  "tasa_tamar",
  "tasa_plazo_fijo",
  "tasa_prestamos_personales",
  "tasa_adelantos_cuenta_corriente",
  "prestamos_sector_privado",
  "icl",
]);
const CADENCE_TRIMESTRAL = new Set(["desempleo", "empleo_no_registrado"]);
const CADENCE_SEMESTRAL = new Set(["pobreza_personas"]);
const CADENCE_ANUAL = new Set([
  "big_mac_ars",
  "big_mac_usd",
  "big_mac_valuacion",
  "tributos_total",
  "tributos_nacionales",
  "tributos_provinciales",
  "tributos_municipales",
]);

export function cadenceForCode(code: string): Cadence {
  if (CADENCE_ANUAL.has(code)) {
    return "anual";
  }
  if (CADENCE_SEMESTRAL.has(code)) {
    return "semestral";
  }
  if (CADENCE_TRIMESTRAL.has(code)) {
    return "trimestral";
  }
  if (CADENCE_DAILY_EXTRA.has(code) || INDICATOR_META[code]?.family === "dolar") {
    return "diaria";
  }
  return "mensual";
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
    unit: meta?.unit,
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
};

export const RANGE_MONTHS: Record<string, number> = {
  "1M": 1,
  "6M": 6,
  "1A": 12,
  "5A": 60,
  Máx: Number.POSITIVE_INFINITY,
};
