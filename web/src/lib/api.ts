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

export const cachedApi = axios.create({
  baseURL: "/api/data",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
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
  getAllByCountry: (country: CountryCode) => cachedApi.get(`/${country}/quotes`),
  getByCountryAndType: (country: CountryCode, type: string) =>
    cachedApi.get(`/${country}/quotes/${type}`),
  getGap: () => cachedApi.get("/quotes/gap"),
  getGapByCountry: (country: CountryCode) => cachedApi.get(`/${country}/quotes/gap`),
  getHistory: (type: string, from: string, to: string, country: CountryCode = "ar") =>
    cachedApi.get(`/quotes/history/${type}`, { params: { country, from, to } }),
};

export const inflationApi = {
  getCurrent: () => cachedApi.get("/inflation/current"),
  getMonthly: (months = 12) => cachedApi.get("/inflation/monthly", { params: { months } }),
  getGovernments: (country = "ar") =>
    cachedApi.get("/inflation/governments", { params: { country } }),
  adjust: (amount: number, fromDate: string, toDate: string) =>
    api.post("/inflation/adjust", null, { params: { amount, fromDate, toDate } }),
};

export const reservesApi = {
  getCurrent: (country = "ar") => cachedApi.get("/reserves", { params: { country } }),
  getHistory: (days = 30) => cachedApi.get("/reserves/history", { params: { days } }),
  getGovernments: (country = "ar") =>
    cachedApi.get("/reserves/governments", { params: { country } }),
};

export const incomeTaxApi = {
  calculate: (data: IncomeTaxRequest) => api.post("/income-tax/calculate", data),
};

export const compoundInterestApi = {
  calculate: (data: CompoundInterestRequest) => api.post("/compound-interest/calculate", data),
};

export const exchangeBandsApi = {
  getCurrent: () => cachedApi.get("/exchange-bands"),
};

export const indicatorsApi = {
  getSocial: (country = "ar") => cachedApi.get("/indicators/social", { params: { country } }),
};

export const countryRiskApi = {
  getCurrent: () => cachedApi.get("/country-risk"),
  getHistory: () => cachedApi.get("/country-risk/history"),
  getGovernments: (country = "ar") =>
    cachedApi.get("/country-risk/governments", { params: { country } }),
};

export const ratesApi = {
  getFixedTerm: (country = "ar") => cachedApi.get("/rates/fixed-term", { params: { country } }),
  getWallets: (country = "ar") => cachedApi.get("/rates/wallets", { params: { country } }),
  getUsdAccounts: (country = "ar") => cachedApi.get("/rates/usd-accounts", { params: { country } }),
  getUvaMortgages: (country = "ar") =>
    cachedApi.get("/rates/uva-mortgages", { params: { country } }),
};

export const exchangeRateComparisonApi = {
  compareRates: (country: CountryCode) =>
    cachedApi.get<ExchangeRateComparison>(`/${country}/exchange-rates/comparison`),
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
  getCurrent: () => cachedApi.get("/crypto"),
};

export const realEstateApi = {
  getPropertyPrices: (filters: PropertyFilter) =>
    api.post<PropertyPriceResponse>("/real-estate/prices", filters),
  getCities: () => cachedApi.get<City[]>("/real-estate/cities"),
  getNeighborhoods: (cityCode: string) =>
    cachedApi.get<Neighborhood[]>(`/real-estate/cities/${cityCode}/neighborhoods`),
  calculateROI: (request: ROIRequest) =>
    api.post<ROIResponse>("/real-estate/roi/calculate", request),
};
