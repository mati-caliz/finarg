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

export interface Crypto {
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  lastUpdate: string;
}

export type PropertyType = "APARTMENT" | "HOUSE" | "PH" | "LAND" | "OFFICE" | "COMMERCIAL";
export type OperationType = "SALE" | "RENT";
export type PropertyCondition = "NEW" | "GOOD" | "REFURBISH" | "CONSTRUCTION";

export interface PropertyFilter {
  cityCode: string;
  neighborhoodCode?: string;
  propertyType?: PropertyType;
  operationType?: OperationType;
  minPrice?: number;
  maxPrice?: number;
  minSurfaceM2?: number;
  maxSurfaceM2?: number;
  currency?: string;
  portalSource?: string;
  sortBy?: string;
  page?: number;
  size?: number;
}

export interface City {
  code: string;
  name: string;
  country: string;
  isActive: boolean;
}

export interface Neighborhood {
  code: string;
  name: string;
  cityCode: string;
  zoneName?: string;
  isActive: boolean;
}

export interface Property {
  id: number;
  externalId: string;
  portalSource: string;
  propertyType: PropertyType;
  operationType: OperationType;
  neighborhoodName: string;
  address?: string;
  surfaceM2: number;
  coveredSurfaceM2?: number;
  bedrooms: number;
  bathrooms: number;
  currentPrice: number;
  pricePerM2: number;
  currency: string;
  expenses?: number;
  condition?: PropertyCondition;
  priceDate: string;
  lastSeenAt: string;
}

export interface PriceStatistics {
  averagePricePerM2: number;
  medianPricePerM2: number;
  minPricePerM2: number;
  maxPricePerM2: number;
  averageTotalPrice: number;
  medianTotalPrice: number;
  propertiesCount: number;
  totalSurfaceM2Analyzed: number;
}

export interface PropertyPriceResponse {
  cityCode: string;
  cityName: string;
  neighborhoodCode?: string;
  neighborhoodName?: string;
  propertyType?: PropertyType;
  operationType?: OperationType;
  currency: string;
  statistics: PriceStatistics;
  properties: Property[];
  calculatedAt: string;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ROIRequest {
  propertyPrice: number;
  monthlyRent: number;
  monthlyExpenses?: number;
  annualAppreciationPercent?: number;
  downPaymentPercent?: number;
  mortgageInterestRate?: number;
  mortgageYears?: number;
  annualPropertyTax?: number;
  annualMaintenanceCosts?: number;
  currency: string;
  analysisYears?: number;
}

export interface BuyScenario {
  totalInitialCost: number;
  downPayment: number;
  mortgageAmount: number;
  monthlyMortgagePayment: number;
  totalMortgageInterest: number;
  totalPropertyTaxPaid: number;
  totalMaintenancePaid: number;
  propertyValueAtEnd: number;
  totalEquityBuilt: number;
  netWorthAtEnd: number;
  totalCostOverYears: number;
  annualizedROI: number;
}

export interface RentScenario {
  totalRentPaid: number;
  totalExpensesPaid: number;
  investmentValue: number;
  investmentReturns: number;
  netWorthAtEnd: number;
  totalCostOverYears: number;
}

export interface ROIComparison {
  netWorthDifference: number;
  percentageDifference: number;
  betterOption: "BUY" | "RENT";
  monthlyCostDifference: number;
}

export interface ROIResponse {
  buyScenario: BuyScenario;
  rentScenario: RentScenario;
  comparison: ROIComparison;
  breakEvenYear: number | null;
  recommendation: string;
  calculatedAt: string;
}

export type PriceType = "BUY" | "SELL";

export interface CurrencyConversionRequest {
  fromCountry: string;
  fromCurrency: string;
  toCountry: string;
  toCurrency: string;
  amount: number;
  fromPriceType: PriceType;
  toPriceType: PriceType;
}

export interface ConversionRate {
  rate: number;
  fromPriceType: string;
  toPriceType: string;
  fromQuotePrice: number;
  toQuotePrice: number;
  isDirectConversion: boolean;
  intermediaryCurrency?: string;
}

export interface ConversionMetadata {
  fromSpread: number;
  toSpread: number;
  fromSpreadPercentage: number;
  toSpreadPercentage: number;
  totalSpreadPercentage: number;
  estimatedCommission: number;
  effectiveRate: number;
}

export interface CurrencyConversionResponse {
  fromAmount: number;
  toAmount: number;
  fromCurrency: string;
  toCurrency: string;
  fromCountry: string;
  toCountry: string;
  conversionRate: ConversionRate;
  metadata: ConversionMetadata;
  timestamp: string;
}

export interface ConversionHistory extends CurrencyConversionResponse {
  id: string;
}

export interface CurrencyOption {
  country: CountryCode;
  countryName: string;
  currencyCode: string;
  currencyName: string;
  baseCurrency: string;
  flag: string;
}

export interface Stock {
  ticker: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  currency: string;
  lastUpdate: string;
}

export interface Cedear {
  symbol: string;
  ticker: string;
  companyName: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  currency: string;
  lastUpdate: string;
}

export interface Bond {
  ticker: string;
  name: string;
  issuer: string;
  maturity: string;
  yieldPercent: number;
  price: number;
  currency: string;
  rating: string;
  lastUpdate: string;
}

export interface Etf {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  aum?: number;
  expenseRatio?: number;
  currency: string;
  lastUpdate: string;
}

export interface Metal {
  metalType: string;
  unit: string;
  priceUsd: number;
  change24h: number;
  changePercent24h: number;
  lastUpdate: string;
}
