import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new QueryClient for each test
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

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock data factories
export const mockCotizacion = (overrides = {}) => ({
  tipo: 'BLUE',
  nombre: 'Dólar Blue',
  compra: 1000,
  venta: 1050,
  spread: 5,
  variacion: 2.5,
  fechaActualizacion: new Date().toISOString(),
  ...overrides,
});

export const mockBrecha = (overrides = {}) => ({
  dolarOficial: 900,
  dolarBlue: 1050,
  porcentajeBrecha: 16.67,
  nivel: 'MEDIA' as const,
  colorSemaforo: '#f59e0b',
  descripcion: 'Brecha moderada',
  ...overrides,
});

export const mockReservas = (overrides = {}) => ({
  reservasBrutas: 28000000000,
  reservasNetas: 5000000000,
  swapChina: 18000000000,
  encajesBancarios: 10000000000,
  depositosGobierno: 2000000000,
  fecha: new Date().toISOString(),
  variacionDiaria: 100000000,
  tendencia: 'SUBIENDO',
  ...overrides,
});

export const mockInflacion = (overrides = {}) => ({
  fecha: new Date().toISOString(),
  valor: 4.2,
  interanual: 142.5,
  acumuladoAnio: 85.3,
  ...overrides,
});

export const mockArbitraje = (overrides = {}) => ({
  tipoOrigen: 'OFICIAL',
  tipoDestino: 'BLUE',
  cotizacionOrigen: 900,
  cotizacionDestino: 1050,
  spreadPorcentaje: 16.67,
  gananciaEstimadaPor1000USD: 166700,
  descripcion: 'Comprar oficial, vender blue',
  pasos: '1. Comprar USD oficial 2. Vender en mercado blue',
  viable: true,
  riesgo: 'MEDIO',
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: 1,
  nombre: 'Test User',
  email: 'test@example.com',
  emailVerificado: true,
  ...overrides,
});

export const mockGananciasResponse = (overrides = {}) => ({
  sueldoBrutoAnual: 12000000,
  totalDeducciones: 3000000,
  gananciaNetaSujetaAImpuesto: 9000000,
  impuestoAnual: 2700000,
  impuestoMensual: 225000,
  alicuotaEfectiva: 22.5,
  sueldoNetoMensual: 775000,
  detalleCalculo: {
    minimoNoImponible: 1500000,
    deduccionEspecial: 500000,
    cargasFamilia: 800000,
    deduccionesPersonales: 200000,
    totalDeduccionesPermitidas: 3000000,
  },
  desglosePorTramo: [
    { tramo: 1, desde: 0, hasta: 500000, alicuota: 5, baseImponible: 500000, impuestoTramo: 25000 },
    { tramo: 2, desde: 500000, hasta: 1000000, alicuota: 9, baseImponible: 500000, impuestoTramo: 45000 },
  ],
  ...overrides,
});

export const mockSimulacionResponse = (overrides = {}) => ({
  tipoInversion: 'PLAZO_FIJO',
  montoInicial: 1000000,
  plazoDias: 30,
  tasaTNA: 110,
  tasaTEA: 185.3,
  rendimientoNominal: 9.04,
  rendimientoReal: -2.5,
  montoFinal: 1090400,
  gananciaARS: 90400,
  gananciaUSD: 86,
  rendimientoEnDolares: -5.2,
  proyeccion: [
    { mes: 1, capitalAcumulado: 1090400, interesesMes: 90400, inflacionEstimada: 4.2, rendimientoReal: 4.84 },
    { mes: 2, capitalAcumulado: 1188970, interesesMes: 98570, inflacionEstimada: 4.0, rendimientoReal: 5.04 },
  ],
  ...overrides,
});
