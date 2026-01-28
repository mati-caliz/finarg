export type CountryCode = 'ar' | 'co' | 'br' | 'cl' | 'uy';

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
  };
  currencyTypes: {
    code: string;
    name: string;
    isOfficial: boolean;
    isParallel: boolean;
  }[];
  reservesLabel?: string;
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  ar: {
    code: 'ar',
    name: 'Argentina',
    shortName: 'ARG',
    localCurrency: 'ARS',
    currencySymbol: '$',
    locale: 'es-AR',
    flag: '🇦🇷',
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: true,
      incomeTax: true,
      arbitrage: true,
      simulator: true,
      repos: true,
    },
    currencyTypes: [
      { code: 'oficial', name: 'Official', isOfficial: true, isParallel: false },
      { code: 'blue', name: 'Blue', isOfficial: false, isParallel: true },
      { code: 'bolsa', name: 'MEP/Stock', isOfficial: false, isParallel: false },
      { code: 'contadoconliqui', name: 'CCL', isOfficial: false, isParallel: false },
      { code: 'tarjeta', name: 'Card', isOfficial: false, isParallel: false },
      { code: 'mayorista', name: 'Wholesale', isOfficial: false, isParallel: false },
      { code: 'cripto', name: 'Crypto', isOfficial: false, isParallel: false },
    ],
    reservesLabel: 'BCRA Reserves',
  },
  co: {
    code: 'co',
    name: 'Colombia',
    shortName: 'COL',
    localCurrency: 'COP',
    currencySymbol: '$',
    locale: 'es-CO',
    flag: '🇨🇴',
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: true,
      incomeTax: false,
      arbitrage: false,
      simulator: true,
      repos: false,
    },
    currencyTypes: [
      { code: 'trm', name: 'TRM', isOfficial: true, isParallel: false },
      { code: 'casas', name: 'Exchange Houses', isOfficial: false, isParallel: true },
      { code: 'cripto', name: 'Crypto P2P', isOfficial: false, isParallel: false },
    ],
    reservesLabel: 'BanRep Reserves',
  },
  br: {
    code: 'br',
    name: 'Brazil',
    shortName: 'BRA',
    localCurrency: 'BRL',
    currencySymbol: 'R$',
    locale: 'pt-BR',
    flag: '🇧🇷',
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: true,
      incomeTax: false,
      arbitrage: false,
      simulator: true,
      repos: false,
    },
    currencyTypes: [
      { code: 'ptax', name: 'PTAX (BCB)', isOfficial: true, isParallel: false },
      { code: 'comercial', name: 'Commercial', isOfficial: false, isParallel: false },
      { code: 'turismo', name: 'Tourism', isOfficial: false, isParallel: false },
      { code: 'paralelo', name: 'Parallel', isOfficial: false, isParallel: true },
    ],
    reservesLabel: 'BCB Reserves',
  },
  cl: {
    code: 'cl',
    name: 'Chile',
    shortName: 'CHL',
    localCurrency: 'CLP',
    currencySymbol: '$',
    locale: 'es-CL',
    flag: '🇨🇱',
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: true,
      incomeTax: false,
      arbitrage: false,
      simulator: true,
      repos: false,
    },
    currencyTypes: [
      { code: 'observado', name: 'Observed (BCCh)', isOfficial: true, isParallel: false },
      { code: 'informal', name: 'Informal', isOfficial: false, isParallel: true },
      { code: 'cripto', name: 'Crypto P2P', isOfficial: false, isParallel: false },
    ],
    reservesLabel: 'BCCh Reserves',
  },
  uy: {
    code: 'uy',
    name: 'Uruguay',
    shortName: 'URY',
    localCurrency: 'UYU',
    currencySymbol: '$U',
    locale: 'es-UY',
    flag: '🇺🇾',
    features: {
      quotes: true,
      gap: true,
      inflation: true,
      reserves: true,
      incomeTax: false,
      arbitrage: false,
      simulator: true,
      repos: false,
    },
    currencyTypes: [
      { code: 'interbancario', name: 'Interbank', isOfficial: true, isParallel: false },
      { code: 'billete', name: 'Bill', isOfficial: false, isParallel: true },
      { code: 'ebrou', name: 'eBROU', isOfficial: false, isParallel: false },
    ],
    reservesLabel: 'BCU Reserves',
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
