import type { TranslationKey } from "@/i18n/translations";

export type CountryCode = "ar" | "co" | "br" | "cl" | "uy";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  shortName: string;
  localCurrency: string;
  currencySymbol: string;
  locale: string;
  flag: string;
  features: {
    quotes: boolean;
    gap: boolean;
    inflation: boolean;
    reserves: boolean;
    incomeTax: boolean;
    arbitrage: boolean;
    simulator: boolean;
    repos: boolean;
    rates: boolean;
  };
  currencyTypes: {
    code: string;
    name: string;
    isOfficial: boolean;
    isParallel: boolean;
  }[];
  reservesLabel?: string;
  reservesLabelKey?: TranslationKey;
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  ar: {
    code: "ar",
    name: "Argentina",
    shortName: "ARG",
    localCurrency: "ARS",
    currencySymbol: "$",
    locale: "es-AR",
    flag: "🇦🇷",
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: true,
      incomeTax: true,
      arbitrage: true,
      simulator: true,
      repos: true,
      rates: true,
    },
    currencyTypes: [
      { code: "oficial", name: "Official", isOfficial: true, isParallel: false },
      { code: "blue", name: "Blue", isOfficial: false, isParallel: true },
      { code: "bolsa", name: "MEP/Stock", isOfficial: false, isParallel: false },
      { code: "contadoconliqui", name: "CCL", isOfficial: false, isParallel: false },
      { code: "tarjeta", name: "Card", isOfficial: false, isParallel: false },
      { code: "mayorista", name: "Wholesale", isOfficial: false, isParallel: false },
      { code: "cripto", name: "Crypto", isOfficial: false, isParallel: false },
      { code: "eur_oficial", name: "Euro Oficial", isOfficial: true, isParallel: false },
      { code: "eur_blue", name: "Euro Blue", isOfficial: false, isParallel: true },
      { code: "eur_tarjeta", name: "Euro Tarjeta", isOfficial: false, isParallel: false },
      { code: "brl_oficial", name: "Real Oficial", isOfficial: true, isParallel: false },
      { code: "brl_blue", name: "Real Blue", isOfficial: false, isParallel: true },
      { code: "brl_tarjeta", name: "Real Tarjeta", isOfficial: false, isParallel: false },
      { code: "clp_oficial", name: "Peso Chileno Oficial", isOfficial: true, isParallel: false },
      { code: "clp_blue", name: "Peso Chileno Blue", isOfficial: false, isParallel: true },
      { code: "clp_tarjeta", name: "Peso Chileno Tarjeta", isOfficial: false, isParallel: false },
      { code: "uyu_oficial", name: "Peso Uruguayo Oficial", isOfficial: true, isParallel: false },
      { code: "uyu_blue", name: "Peso Uruguayo Blue", isOfficial: false, isParallel: true },
      { code: "uyu_tarjeta", name: "Peso Uruguayo Tarjeta", isOfficial: false, isParallel: false },
      { code: "cop_oficial", name: "Peso Colombiano Oficial", isOfficial: true, isParallel: false },
      { code: "cop_blue", name: "Peso Colombiano Blue", isOfficial: false, isParallel: true },
      {
        code: "cop_tarjeta",
        name: "Peso Colombiano Tarjeta",
        isOfficial: false,
        isParallel: false,
      },
      {
        code: "pyg_oficial",
        name: "Guaraní Paraguayo Oficial",
        isOfficial: true,
        isParallel: false,
      },
      { code: "pyg_blue", name: "Guaraní Paraguayo Blue", isOfficial: false, isParallel: true },
      {
        code: "pyg_tarjeta",
        name: "Guaraní Paraguayo Tarjeta",
        isOfficial: false,
        isParallel: false,
      },
      { code: "bob_oficial", name: "Peso Boliviano Oficial", isOfficial: true, isParallel: false },
      { code: "bob_blue", name: "Peso Boliviano Blue", isOfficial: false, isParallel: true },
      { code: "bob_tarjeta", name: "Peso Boliviano Tarjeta", isOfficial: false, isParallel: false },
      { code: "cny_oficial", name: "Yuan Oficial", isOfficial: true, isParallel: false },
      { code: "cny_blue", name: "Yuan Blue", isOfficial: false, isParallel: true },
      { code: "cny_tarjeta", name: "Yuan Tarjeta", isOfficial: false, isParallel: false },
    ],
    reservesLabel: "BCRA Reserves",
    reservesLabelKey: "bcraReserves",
  },
  co: {
    code: "co",
    name: "Colombia",
    shortName: "COL",
    localCurrency: "COP",
    currencySymbol: "$",
    locale: "es-CO",
    flag: "🇨🇴",
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: false,
      incomeTax: false,
      arbitrage: false,
      simulator: true,
      repos: false,
      rates: false,
    },
    currencyTypes: [
      { code: "trm", name: "TRM", isOfficial: true, isParallel: false },
      { code: "casas", name: "Exchange Houses", isOfficial: false, isParallel: true },
      { code: "cripto", name: "Crypto P2P", isOfficial: false, isParallel: false },
    ],
    reservesLabel: "BanRep Reserves",
    reservesLabelKey: "banrepReserves",
  },
  br: {
    code: "br",
    name: "Brazil",
    shortName: "BRA",
    localCurrency: "BRL",
    currencySymbol: "R$",
    locale: "pt-BR",
    flag: "🇧🇷",
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: false,
      incomeTax: false,
      arbitrage: false,
      simulator: true,
      repos: false,
      rates: false,
    },
    currencyTypes: [
      { code: "ptax", name: "PTAX (BCB)", isOfficial: true, isParallel: false },
      { code: "comercial", name: "Commercial", isOfficial: false, isParallel: false },
      { code: "turismo", name: "Tourism", isOfficial: false, isParallel: false },
      { code: "paralelo", name: "Parallel", isOfficial: false, isParallel: true },
    ],
    reservesLabel: "BCB Reserves",
    reservesLabelKey: "bcbReserves",
  },
  cl: {
    code: "cl",
    name: "Chile",
    shortName: "CHL",
    localCurrency: "CLP",
    currencySymbol: "$",
    locale: "es-CL",
    flag: "🇨🇱",
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: false,
      incomeTax: false,
      arbitrage: false,
      simulator: true,
      repos: false,
      rates: false,
    },
    currencyTypes: [
      { code: "observado", name: "Observed (BCCh)", isOfficial: true, isParallel: false },
      { code: "informal", name: "Informal", isOfficial: false, isParallel: true },
      { code: "cripto", name: "Crypto P2P", isOfficial: false, isParallel: false },
    ],
    reservesLabel: "BCCh Reserves",
    reservesLabelKey: "bcchReserves",
  },
  uy: {
    code: "uy",
    name: "Uruguay",
    shortName: "URY",
    localCurrency: "UYU",
    currencySymbol: "$U",
    locale: "es-UY",
    flag: "🇺🇾",
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: false,
      incomeTax: false,
      arbitrage: false,
      simulator: true,
      repos: false,
      rates: false,
    },
    currencyTypes: [
      { code: "interbancario", name: "Interbank", isOfficial: true, isParallel: false },
      { code: "billete", name: "Bill", isOfficial: false, isParallel: true },
      { code: "ebrou", name: "eBROU", isOfficial: false, isParallel: false },
    ],
    reservesLabel: "BCU Reserves",
    reservesLabelKey: "bcuReserves",
  },
};

export const COUNTRIES_LIST = Object.values(COUNTRIES);

export function getCountryConfig(code: CountryCode): CountryConfig {
  return COUNTRIES[code];
}

export type PaisCodigo = CountryCode;
export type PaisConfig = CountryConfig;
export const PAISES = COUNTRIES;
export const PAISES_LIST = COUNTRIES_LIST;
export const getPaisConfig = getCountryConfig;
