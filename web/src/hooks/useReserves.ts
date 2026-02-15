"use client";

import type { CountryCode } from "@/config/countries";
import { reservesApi } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/constants";
import type { Reserves } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useReserves(country: CountryCode = "ar") {
  return useQuery<Reserves>({
    queryKey: ["reserves", country],
    queryFn: async () => {
      const response = await reservesApi.getCurrent(country);
      return response.data;
    },
    enabled: country === "ar",
    staleTime: CACHE_TIMES.MARKET_STALE,
    gcTime: CACHE_TIMES.HISTORICAL_GC,
  });
}
