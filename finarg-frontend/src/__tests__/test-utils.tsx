import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';

export { customRender as render };

export const mockQuote = (overrides = {}) => ({
  type: 'BLUE',
  name: 'Dólar Blue',
  buy: 1000,
  sell: 1050,
  spread: 50,
  variation: 2.5,
  lastUpdate: new Date().toISOString(),
  ...overrides,
});

export const mockGap = (overrides = {}) => ({
  officialRate: 900,
  parallelRate: 1050,
  gapPercentage: 16.67,
  level: 'MEDIUM' as const,
  trafficLightColor: '#f59e0b',
  description: 'Moderate gap',
  ...overrides,
});

export const mockReserves = (overrides = {}) => ({
  grossReserves: 28000000000,
  netReserves: 5000000000,
  chinaSwap: 18000000000,
  bankReserves: 10000000000,
  governmentDeposits: 2000000000,
  date: new Date().toISOString(),
  dailyVariation: 100000000,
  trend: 'UP',
  ...overrides,
});

export const mockInflation = (overrides = {}) => ({
  date: new Date().toISOString(),
  value: 4.2,
  yearOverYear: 142.5,
  yearToDate: 85.3,
  ...overrides,
});

export const mockArbitrage = (overrides = {}) => ({
  sourceType: 'OFFICIAL',
  targetType: 'BLUE',
  sourceRate: 900,
  targetRate: 1050,
  spreadPercentage: 16.67,
  estimatedProfitPer1000USD: 166700,
  description: 'Buy official, sell blue',
  steps: '1. Buy USD official 2. Sell in blue market',
  viable: true,
  risk: 'MEDIUM',
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: true,
  ...overrides,
});

export const mockIncomeTaxResponse = (overrides = {}) => ({
  grossAnnualSalary: 12000000,
  totalDeductions: 3000000,
  taxableNetIncome: 9000000,
  annualTax: 2700000,
  monthlyTax: 225000,
  effectiveRate: 22.5,
  monthlyNetSalary: 775000,
  calculationDetails: {
    nonTaxableMinimum: 1500000,
    specialDeduction: 500000,
    familyCharges: 800000,
    personalDeductions: 200000,
    totalAllowedDeductions: 3000000,
  },
  bracketBreakdown: [
    { bracket: 1, from: 0, to: 500000, rate: 5, taxableBase: 500000, bracketTax: 25000 },
    { bracket: 2, from: 500000, to: 1000000, rate: 9, taxableBase: 500000, bracketTax: 45000 },
  ],
  ...overrides,
});

export const mockSimulationResponse = (overrides = {}) => ({
  investmentType: 'FIXED_TERM',
  initialAmount: 1000000,
  termDays: 30,
  nominalAnnualRate: 110,
  effectiveAnnualRate: 185.3,
  nominalReturn: 9.04,
  realReturn: -2.5,
  finalAmount: 1090400,
  profitARS: 90400,
  profitUSD: 86,
  dollarReturn: -5.2,
  projection: [
    { month: 1, accumulatedCapital: 1090400, monthlyInterest: 90400, estimatedInflation: 4.2, realReturn: 4.84 },
    { month: 2, accumulatedCapital: 1188970, monthlyInterest: 98570, estimatedInflation: 4.0, realReturn: 5.04 },
  ],
  ...overrides,
});

export const mockCotizacion = mockQuote;
export const mockBrecha = mockGap;
export const mockReservas = mockReserves;
export const mockInflacion = mockInflation;
export const mockArbitraje = mockArbitrage;
export const mockGananciasResponse = mockIncomeTaxResponse;
export const mockSimulacionResponse = mockSimulationResponse;
