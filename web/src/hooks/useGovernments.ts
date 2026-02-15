"use client";

import { inflationApi } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/constants";
import type { Government } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useGovernments(country = "ar") {
  return useQuery<Government[]>({
    queryKey: ["governments", country],
    queryFn: async () => {
      const response = await inflationApi.getGovernments(country);
      return (response.data as Government[]) ?? [];
    },
    staleTime: CACHE_TIMES.STATIC_STALE,
    gcTime: CACHE_TIMES.STATIC_GC,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
