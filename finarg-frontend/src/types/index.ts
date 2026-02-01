import type { CountryCode } from "@/config/countries";

export interface Quote {
  type: string;
  country?: CountryCode;
  name: string;
  buy: number;
  sell: number;
  spread: number;
  variation: number;
  lastUpdate: string;
}

export interface Gap {
  country?: CountryCode;
  officialRate: number;
  parallelRate: number;
  gapPercentage: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  trafficLightColor: string;
  description: string;
}

export interface Inflation {
  date: string;
  value: number;
  yearOverYear?: number;
  yearToDate?: number;
}

export interface InflationAdjustment {
  originalAmount: number;
  adjustedAmount: number;
  fromDate: string;
  toDate: string;
  accumulatedInflation?: number;
  cumulativeInflation?: number;
  monthsElapsed: number;
}

export interface ReserveLiability {
  id: string;
  name: string;
  amount: number;
}

export interface Reserves {
  grossReserves: number;
  netReserves: number;
  netReservesBCRA?: number;
  netReservesFMI?: number;
  liabilities: ReserveLiability[];
  liabilitiesBCRA?: ReserveLiability[];
  liabilitiesFMI?: ReserveLiability[];
  date: string;
  dailyVariation: number;
  trend: string;
}

export interface IncomeTaxRequest {
  grossMonthlySalary: number;
  isRetired?: boolean;
  healthInsurance?: number;
  retirement?: number;
  union?: number;
  unionDuesPercent?: number;
  hasSpouse: boolean;
  childrenCount: number;
  childrenWithDisabilitiesCount?: number;
  housingRent?: number;
  domesticService?: number;
  educationExpenses?: number;
  lifeInsurance?: number;
}

export interface IncomeTaxResponse {
  grossMonthlySalary?: number;
  grossAnnualSalary: number;
  monthlyLegalDeductions?: number;
  totalDeductions: number;
  taxableNetIncome: number;
  annualTax: number;
  monthlyTax: number;
  effectiveRate: number;
  monthlyNetSalary: number;
  calculationDetails: {
    nonTaxableMinimum: number;
    specialDeduction: number;
    familyCharges: number;
    personalDeductions: number;
    totalAllowedDeductions: number;
  };
  bracketBreakdown: {
    bracket: number;
    from: number;
    to: number;
    rate: number;
    taxableBase: number;
    bracketTax: number;
  }[];
  deductionBreakdown?: {
    retirement: number;
    healthInsurance: number;
    law19032: number;
    unionDues: number;
    incomeTax: number;
    total: number;
  };
}

export interface SocialIndicators {
  minimumSalary?: number;
  minimumPension?: number;
  canastaBasicaTotal?: number;
  uva?: number;
  cer?: number;
}

export interface Arbitrage {
  sourceType: string;
  targetType: string;
  sourceRate: number;
  targetRate: number;
  spreadPercentage: number;
  estimatedProfitPer1000USD: number;
  description: string;
  steps: string;
  viable: boolean;
  risk: string;
}

export interface SimulationRequest {
  initialAmount: number;
  investmentType: string;
  termDays: number;
  reinvest?: boolean;
  customRate?: number;
}

export interface SimulationResponse {
  investmentType: string;
  initialAmount: number;
  termDays: number;
  nominalAnnualRate: number;
  effectiveAnnualRate: number;
  nominalReturn: number;
  realReturn: number;
  finalAmount: number;
  profitARS: number;
  profitUSD: number;
  dollarReturn: number;
  projection: {
    month: number;
    accumulatedCapital: number;
    monthlyInterest: number;
    estimatedInflation: number;
    realReturn: number;
  }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ExchangeBands {
  floor: number;
  ceiling: number;
  middle: number;
  crawlingPegMonthly: number;
  lastUpdate: string;
  notes?: string;
}
