import type { CountryCode } from "@/config/countries";

export const queryKeys = {
  quotes: {
    all: (country: CountryCode) => ["quotes", country] as const,
    gap: (country: CountryCode) => ["quotes", "gap", country] as const,
    history: (country: CountryCode, type: string, period: string) =>
      ["quotes", "history", country, type, period] as const,
  },
  inflation: {
    current: () => ["inflation", "current"] as const,
    monthly: (months: number) => ["inflation", "monthly", months] as const,
    governments: (country: CountryCode) => ["inflation", "governments", country] as const,
  },
  reserves: {
    current: (country: CountryCode) => ["reserves", country] as const,
    history: (days: number) => ["reserves", "history", days] as const,
    governments: (country: CountryCode) => ["reserves", "governments", country] as const,
  },
  countryRisk: {
    current: () => ["country-risk", "current"] as const,
    governments: (country: CountryCode) => ["country-risk", "governments", country] as const,
  },
  exchangeBands: {
    current: () => ["exchange-bands", "current"] as const,
  },
  rates: {
    fixedTerm: (country: CountryCode) => ["rates", "fixed-term", country] as const,
    wallets: (country: CountryCode) => ["rates", "wallets", country] as const,
    usdAccounts: (country: CountryCode) => ["rates", "usd-accounts", country] as const,
    uvaMortgages: (country: CountryCode) => ["rates", "uva-mortgages", country] as const,
  },
  news: {
    all: ["news"] as const,
    list: (country: CountryCode, page: number, size: number) =>
      ["news", "list", country, page, size] as const,
    category: (category: string, country: CountryCode, page: number, size: number) =>
      ["news", "category", category, country, page, size] as const,
    detail: (id: number) => ["news", "detail", id] as const,
  },
  holidays: {
    all: (country: CountryCode, year?: number) => ["holidays", country, year] as const,
    upcoming: (country: CountryCode) => ["holidays", "upcoming", country] as const,
  },
};
