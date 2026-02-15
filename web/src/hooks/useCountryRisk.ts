"use client";

import { countryRiskApi } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/constants";
import type { CountryRisk } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useCountryRisk() {
  return useQuery<CountryRisk>({
    queryKey: ["countryRisk"],
    queryFn: async () => {
      const response = await countryRiskApi.getCurrent();
      return response.data;
    },
    staleTime: CACHE_TIMES.MARKET_STALE,
    gcTime: CACHE_TIMES.MARKET_GC,
  });
}

export function useCountryRiskHistory() {
  return useQuery<CountryRisk[]>({
    queryKey: ["countryRisk", "history"],
    queryFn: async () => {
      const response = await countryRiskApi.getHistory();
      return response.data;
    },
    staleTime: CACHE_TIMES.HISTORICAL_STALE,
    gcTime: CACHE_TIMES.MARKET_GC,
  });
}
