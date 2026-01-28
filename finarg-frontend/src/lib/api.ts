import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor para manejar errores
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

// API Functions
export const cotizacionesApi = {
  getAll: () => api.get('/cotizaciones'),
  getByTipo: (tipo: string) => api.get(`/cotizaciones/${tipo}`),
  getBrecha: () => api.get('/cotizaciones/brecha'),
  getHistorico: (tipo: string, desde: string, hasta: string) =>
    api.get(`/cotizaciones/historico/${tipo}`, { params: { desde, hasta } }),
};

export const inflacionApi = {
  getActual: () => api.get('/inflacion/actual'),
  getMensual: (meses: number = 12) => api.get('/inflacion/mensual', { params: { meses } }),
  getInteranual: () => api.get('/inflacion/interanual'),
  ajustar: (monto: number, fechaOrigen: string, fechaDestino: string) =>
    api.post('/inflacion/ajustar', null, { params: { monto, fechaOrigen, fechaDestino } }),
};

export const reservasApi = {
  getActuales: () => api.get('/reservas'),
  getHistorico: (dias: number = 30) => api.get('/reservas/historico', { params: { dias } }),
};

export const gananciasApi = {
  calcular: (data: any) => api.post('/ganancias/calcular', data),
};

export const arbitrajeApi = {
  getOportunidades: () => api.get('/arbitraje/oportunidades'),
};

export const simuladorApi = {
  simular: (data: any) => api.post('/simulador/rendimiento', data),
  getTasas: () => api.get('/simulador/tasas'),
};

export const caucionesApi = {
  optimizar: (monto: number, plazoDias: number) =>
    api.post('/cauciones/optimizar', null, { params: { monto, plazoDias } }),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, nombre: string) =>
    api.post('/auth/register', { email, password, nombre }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', refreshToken),
};
