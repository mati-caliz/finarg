"use client";

import { investmentsApi } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/constants";
import { queryKeys } from "@/lib/queryKeys";
import type { Bond, Caucion, Cedear, Etf, Letra, Metal, Stock } from "@/types";
import { useQuery } from "@tanstack/react-query";

const INVESTMENT_QUERY_OPTIONS = {
  staleTime: CACHE_TIMES.REALTIME_STALE,
  gcTime: CACHE_TIMES.REALTIME_GC,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;

function createInvestmentHook<T>(key: readonly string[], fetcher: () => Promise<{ data: T[] }>) {
  return () =>
    useQuery<T[]>({
      queryKey: key,
      queryFn: async () => (await fetcher()).data,
      ...INVESTMENT_QUERY_OPTIONS,
    });
}

export const useStocks = createInvestmentHook<Stock>(
  queryKeys.investments.stocks(),
  investmentsApi.getStocks,
);

export const useCedears = createInvestmentHook<Cedear>(
  queryKeys.investments.cedears(),
  investmentsApi.getCedears,
);

export const useBonds = createInvestmentHook<Bond>(
  queryKeys.investments.bonds(),
  investmentsApi.getBonds,
);

export const useEtfs = createInvestmentHook<Etf>(
  queryKeys.investments.etf(),
  investmentsApi.getEtfs,
);

export const useMetals = createInvestmentHook<Metal>(
  queryKeys.investments.metals(),
  investmentsApi.getMetals,
);

export const useLetras = createInvestmentHook<Letra>(
  queryKeys.investments.letras(),
  investmentsApi.getLetras,
);

export const useCauciones = createInvestmentHook<Caucion>(
  queryKeys.investments.cauciones(),
  investmentsApi.getCauciones,
);
