import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuotes } from '@/hooks/useQuotes';
import { quotesApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  quotesApi: {
    getAll: jest.fn(),
    getAllByCountry: jest.fn(),
    getGap: jest.fn(),
    getGapByCountry: jest.fn(),
    getByType: jest.fn(),
    getByCountryAndType: jest.fn(),
    getHistory: jest.fn(),
  },
}));

jest.mock('@/store/useStore', () => ({
  useAppStore: jest.fn(() => 'ar'),
}));

const mockQuotesApi = quotesApi as jest.Mocked<typeof quotesApi>;

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

describe('useQuotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches quotes successfully', async () => {
    const mockData = [
      { type: 'BLUE', name: 'Dólar Blue', buy: 1000, sell: 1050, spread: 50, variation: 2.5, lastUpdate: new Date().toISOString() },
      { type: 'OFFICIAL', name: 'Dólar Oficial', buy: 900, sell: 920, spread: 20, variation: 0.5, lastUpdate: new Date().toISOString() },
    ];

    mockQuotesApi.getAllByCountry.mockResolvedValue({ data: mockData } as Awaited<ReturnType<typeof quotesApi.getAllByCountry>>);

    const { result } = renderHook(() => useQuotes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockQuotesApi.getAllByCountry).toHaveBeenCalledTimes(1);
  });

  it('handles error state', async () => {
    mockQuotesApi.getAllByCountry.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useQuotes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('shows loading state initially', () => {
    mockQuotesApi.getAllByCountry.mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() => useQuotes(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
