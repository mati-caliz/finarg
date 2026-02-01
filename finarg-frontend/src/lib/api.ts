import axios from 'axios';
import { IncomeTaxRequest, SimulationRequest } from '@/types';
import { CountryCode } from '@/config/countries';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export const quotesApi = {
  getAll: () => api.get('/quotes'),
  getAllByCountry: (country: CountryCode) => api.get(`/${country}/quotes`),
  getByType: (type: string) => api.get(`/quotes/${type}`),
  getByCountryAndType: (country: CountryCode, type: string) => api.get(`/${country}/quotes/${type}`),
  getGap: () => api.get('/quotes/gap'),
  getGapByCountry: (country: CountryCode) => api.get(`/${country}/quotes/gap`),
  getHistory: (type: string, from: string, to: string, country: CountryCode = 'ar') =>
    api.get(`/quotes/history/${type}`, { params: { country, from, to } }),
  getCountries: () => api.get('/countries'),
};

export const inflationApi = {
  getCurrent: () => api.get('/inflation/current'),
  getMonthly: (months: number = 12) => api.get('/inflation/monthly', { params: { months } }),
  getYearOverYear: () => api.get('/inflation/year-over-year'),
  adjust: (amount: number, fromDate: string, toDate: string) =>
    api.post('/inflation/adjust', null, { params: { amount, fromDate, toDate } }),
};

export const reservesApi = {
  getCurrent: (country: string = 'ar') => api.get('/reserves', { params: { country } }),
  getHistory: (days: number = 30) => api.get('/reserves/history', { params: { days } }),
};

export const incomeTaxApi = {
  calculate: (data: IncomeTaxRequest) => api.post('/income-tax/calculate', data),
};

export const arbitrageApi = {
  getOpportunities: () => api.get('/arbitrage/opportunities'),
};

export const simulatorApi = {
  simulate: (data: SimulationRequest) => api.post('/simulator/returns', data),
  getRates: () => api.get('/simulator/rates'),
};

export const indicatorsApi = {
  getSocial: (country: string = 'ar') =>
    api.get('/indicators/social', { params: { country } }),
};

export const ratesApi = {
  getFixedTerm: (country: string = 'ar') =>
    api.get('/rates/fixed-term', { params: { country } }),
  getWallets: (country: string = 'ar') =>
    api.get('/rates/wallets', { params: { country } }),
};

export const reposApi = {
  optimize: (amount: number, termDays: number) =>
    api.post('/repos/optimize', null, { params: { amount, termDays } }),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  loginWithGoogle: (idToken: string) =>
    api.post('/auth/google', { idToken }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', refreshToken),
};

export const cotizacionesApi = quotesApi;
export const inflacionApi = inflationApi;
export const gananciasApi = incomeTaxApi;
export const caucionesApi = reposApi;
