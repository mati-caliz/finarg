import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type React from "react";
import type { ReactElement } from "react";

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

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";

export { customRender as render };

export const mockQuote = (overrides = {}) => ({
  type: "BLUE",
  name: "Dólar Blue",
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
  level: "MEDIUM" as const,
  trafficLightColor: "#f59e0b",
  description: "Moderate gap",
  ...overrides,
});

export const mockReserves = (overrides = {}) => ({
  grossReserves: 41200,
  netReserves: 2900,
  netReservesBCRA: 2900,
  netReservesFMI: -14100,
  liabilities: [
    { id: "china_swap", name: "Swap China", amount: 18291 },
    { id: "usa_swap", name: "Swap EE.UU.", amount: 2500 },
    { id: "bank_deposits", name: "Encajes Bancarios", amount: 10000 },
  ],
  liabilitiesBCRA: [
    { id: "china_swap", name: "Swap China", amount: 18291 },
    { id: "usa_swap", name: "Swap EE.UU.", amount: 2500 },
    { id: "bank_deposits", name: "Encajes Bancarios", amount: 10000 },
    { id: "other_bcra", name: "Otros pasivos BCRA", amount: 6976 },
  ],
  liabilitiesFMI: [
    { id: "china_swap", name: "Swap China", amount: 18291 },
    { id: "usa_swap", name: "Swap EE.UU.", amount: 2500 },
    { id: "bank_deposits", name: "Encajes Bancarios", amount: 10000 },
    { id: "gov_deposits", name: "Depósitos del Gobierno", amount: 3000 },
    { id: "leliq_pases", name: "LELIQs y pases (USD)", amount: 8000 },
    { id: "other_fmi", name: "Otros pasivos metodología FMI", amount: 14776 },
  ],
  date: new Date().toISOString(),
  dailyVariation: 100,
  trend: "UP",
  ...overrides,
});

export const mockInflation = (overrides = {}) => ({
  date: new Date().toISOString(),
  value: 4.2,
  yearOverYear: 142.5,
  yearToDate: 85.3,
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: 1,
  name: "Test User",
  email: "test@example.com",
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

export const mockCotizacion = mockQuote;
export const mockBrecha = mockGap;
export const mockReservas = mockReserves;
export const mockInflacion = mockInflation;

export const mockGananciasResponse = mockIncomeTaxResponse;
