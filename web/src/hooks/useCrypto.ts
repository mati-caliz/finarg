"use client";

import { cryptoApi } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/constants";
import type { Crypto } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useCrypto() {
  return useQuery<Crypto[]>({
    queryKey: ["crypto"],
    queryFn: async () => {
      const response = await cryptoApi.getCurrent();
      return response.data;
    },
    staleTime: CACHE_TIMES.REALTIME_STALE,
    gcTime: CACHE_TIMES.MARKET_GC,
  });
}
