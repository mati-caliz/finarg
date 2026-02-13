"use client";

import { countryRiskApi } from "@/lib/api";
import type { CountryRisk } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useCountryRisk() {
  return useQuery<CountryRisk>({
    queryKey: ["countryRisk"],
    queryFn: async () => {
      const response = await countryRiskApi.getCurrent();
      return response.data;
    },
    staleTime: 1800000,
    gcTime: 86400000,
    refetchInterval: 1800000,
    retry: 3,
  });
}
