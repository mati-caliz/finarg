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
  baseCurrency?: string;
  hasHistory?: boolean;
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
  totalBasicBasket?: number;
  foodBasicBasket?: number;
  ripteSalary?: number;
  averageSalary?: number;
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

export interface CountryRisk {
  value: number;
  date: string;
}

export interface Government {
  startDate: string;
  endDate: string;
  label: string;
  color: string;
}

export type CompoundingFrequency = "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface CompoundInterestRequest {
  initialCapital: number;
  annualRate: number;
  years: number;
  compoundingFrequency: CompoundingFrequency;
  periodicContribution?: number;
}

export interface CompoundInterestResponse {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  periods: {
    period: number;
    principal: number;
    interest: number;
    total: number;
  }[];
}

export interface ExchangeRateItem {
  type: string;
  name: string;
  baseCurrency: string;
  buy: number;
  sell: number;
  spread: number;
  spreadPercentage: number;
  variation: number;
}

export interface ExchangeRateComparison {
  country: CountryCode;
  rates: ExchangeRateItem[];
  cheapestToBuy: ExchangeRateItem | null;
  cheapestToSell: ExchangeRateItem | null;
  mostExpensiveToBuy: ExchangeRateItem | null;
  mostExpensiveToSell: ExchangeRateItem | null;
}
