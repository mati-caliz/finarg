import type { CountryCode } from "@/config/countries";
import type {
  City,
  CompoundInterestRequest,
  CurrencyConversionRequest,
  CurrencyConversionResponse,
  ExchangeRateComparison,
  IncomeTaxRequest,
  Neighborhood,
  PropertyFilter,
  PropertyPriceResponse,
  ROIRequest,
  ROIResponse,
} from "@/types";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const quotesApi = {
  getAllByCountry: (country: CountryCode) => api.get(`/${country}/quotes`),
  getByCountryAndType: (country: CountryCode, type: string) =>
    api.get(`/${country}/quotes/${type}`),
  getGap: () => api.get("/quotes/gap"),
  getGapByCountry: (country: CountryCode) => api.get(`/${country}/quotes/gap`),
  getHistory: (type: string, from: string, to: string, country: CountryCode = "ar") =>
    api.get(`/quotes/history/${type}`, { params: { country, from, to } }),
};

export const inflationApi = {
  getCurrent: () => api.get("/inflation/current"),
  getMonthly: (months = 12) => api.get("/inflation/monthly", { params: { months } }),
  getGovernments: (country = "ar") => api.get("/inflation/governments", { params: { country } }),
  adjust: (amount: number, fromDate: string, toDate: string) =>
    api.post("/inflation/adjust", null, { params: { amount, fromDate, toDate } }),
};

export const reservesApi = {
  getCurrent: (country = "ar") => api.get("/reserves", { params: { country } }),
  getHistory: (days = 30) => api.get("/reserves/history", { params: { days } }),
  getGovernments: (country = "ar") => api.get("/reserves/governments", { params: { country } }),
};

export const incomeTaxApi = {
  calculate: (data: IncomeTaxRequest) => api.post("/income-tax/calculate", data),
};

export const compoundInterestApi = {
  calculate: (data: CompoundInterestRequest) => api.post("/compound-interest/calculate", data),
};

export const exchangeBandsApi = {
  getCurrent: () => api.get("/exchange-bands"),
};

export const indicatorsApi = {
  getSocial: (country = "ar") => api.get("/indicators/social", { params: { country } }),
};

export const countryRiskApi = {
  getCurrent: () => api.get("/country-risk"),
};

export const ratesApi = {
  getFixedTerm: (country = "ar") => api.get("/rates/fixed-term", { params: { country } }),
  getWallets: (country = "ar") => api.get("/rates/wallets", { params: { country } }),
  getUsdAccounts: (country = "ar") => api.get("/rates/usd-accounts", { params: { country } }),
  getUvaMortgages: (country = "ar") => api.get("/rates/uva-mortgages", { params: { country } }),
};

export const exchangeRateComparisonApi = {
  compareRates: (country: CountryCode) =>
    api.get<ExchangeRateComparison>(`/${country}/exchange-rates/comparison`),
};

export const currencyConversionApi = {
  convert: (data: CurrencyConversionRequest) =>
    api.post<CurrencyConversionResponse>("/currency/convert", data),
};

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post("/auth/register", { email, password, name }),
  loginWithGoogle: (idToken: string) => api.post("/auth/google", { idToken }),
};

export const cryptoApi = {
  getCurrent: () => api.get("/crypto"),
};

export const realEstateApi = {
  getPropertyPrices: (filters: PropertyFilter) =>
    api.post<PropertyPriceResponse>("/real-estate/prices", filters),
  getCities: () => api.get<City[]>("/real-estate/cities"),
  getNeighborhoods: (cityCode: string) =>
    api.get<Neighborhood[]>(`/real-estate/cities/${cityCode}/neighborhoods`),
  calculateROI: (request: ROIRequest) =>
    api.post<ROIResponse>("/real-estate/roi/calculate", request),
};
