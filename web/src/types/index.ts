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
  displayOrder?: number;
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
  subscription: SubscriptionResponse;
}

export type SubscriptionPlan = "FREE" | "PREMIUM" | "PROFESSIONAL";
export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "EXPIRED"
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED";
export type BillingPeriod = "MONTHLY" | "YEARLY";

export interface PlanFeatures {
  dailyCalculations: number;
  maxAlerts: number;
  apiRequestsPerDay: number;
  hasAdvancedFeatures: boolean;
  hasExportData: boolean;
  hasApiAccess: boolean;
  isUnlimitedCalculations: boolean;
  isUnlimitedAlerts: boolean;
}

export interface UsageLimits {
  calculationsUsedToday: number;
  calculationsLimit: number;
  alertsUsed: number;
  alertsLimit: number;
  apiRequestsToday: number;
  apiRequestsLimit: number;
  canUseCalculator: boolean;
  canCreateAlert: boolean;
  canMakeApiRequest: boolean;
}

export interface SubscriptionResponse {
  id?: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  startDate: string;
  endDate: string;
  cancelledAt?: string;
  priceAtPurchase?: number;
  features: PlanFeatures;
  currentUsage: UsageLimits;
}

export interface CreateSubscriptionRequest {
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  paymentMethodId?: string;
}

export interface PlanPricing {
  plan: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  features: PlanFeatures;
  highlights: string[];
  recommended: boolean;
}

export interface PricingResponse {
  plans: PlanPricing[];
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
  displayPercentage?: number;
}

export interface TopInvestmentRatesResponse {
  topWallets: RateDTO[];
  topBanks: RateDTO[];
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

export interface Letra {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  currency: string;
  lastUpdate: string;
  maturityDate?: string;
}

export interface Caucion {
  days: number;
  ticker: string;
  rate: number;
  change: number;
  changePercent: number;
  minRate: number;
  maxRate: number;
  lastUpdate: string;
}

export type NewsCategory =
  | "EXCHANGE_RATE"
  | "MONETARY_POLICY"
  | "INFLATION"
  | "RESERVES"
  | "FISCAL_POLICY"
  | "FINANCIAL_MARKETS"
  | "ECONOMY_GENERAL"
  | "CRYPTO"
  | "INTERNATIONAL"
  | "BCRA_BULLETIN"
  | "GOVERNMENT_BULLETIN";

export type AiSentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";

export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  aiSummary: string | null;
  sentiment: AiSentiment | null;
  category: NewsCategory;
  source: string;
  sourceUrl: string;
  imageUrl: string | null;
  isOfficial: boolean;
  country: string;
  publishedDate: string;
  keyPoints: string[];
}

export interface NewsListResponse {
  articles: NewsArticle[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface Holiday {
  date: string;
  name: string;
  type: string;
  isNational: boolean;
  daysUntil: number;
}

export interface FeedbackRequest {
  rating: number;
  comment?: string;
  email?: string;
  url: string;
  timestamp: string;
}

export interface FeedbackResponse {
  id: number;
  rating: number;
  comment?: string;
  email?: string;
  url: string;
  timestamp: string;
  createdAt: string;
}

export interface RateDTO {
  id: string;
  name: string;
  tna: number;
  tea?: number;
  product?: string;
  term?: string;
  date?: string;
  limit?: number;
  logo?: string;
  link?: string;
  isBestRate?: boolean;
}
