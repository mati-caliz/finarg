import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCotizaciones } from '@/hooks/useCotizaciones';
import { cotizacionesApi } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  cotizacionesApi: {
    getAll: jest.fn(),
    getBrecha: jest.fn(),
    getByTipo: jest.fn(),
    getHistorico: jest.fn(),
  },
}));

const mockCotizacionesApi = cotizacionesApi as jest.Mocked<typeof cotizacionesApi>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('useCotizaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches cotizaciones successfully', async () => {
    const mockData = [
      { tipo: 'BLUE', nombre: 'Dólar Blue', compra: 1000, venta: 1050, spread: 5, variacion: 2.5 },
      { tipo: 'OFICIAL', nombre: 'Dólar Oficial', compra: 900, venta: 920, spread: 2.2, variacion: 0.5 },
    ];

    mockCotizacionesApi.getAll.mockResolvedValue({ data: mockData } as Awaited<ReturnType<typeof cotizacionesApi.getAll>>);

    const { result } = renderHook(() => useCotizaciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockCotizacionesApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('handles error state', async () => {
    mockCotizacionesApi.getAll.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useCotizaciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('shows loading state initially', () => {
    mockCotizacionesApi.getAll.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useCotizaciones(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
