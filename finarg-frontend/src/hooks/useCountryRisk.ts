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
    refetchInterval: 3600000,
  });
}
