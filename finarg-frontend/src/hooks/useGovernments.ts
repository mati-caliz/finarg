"use client";

import { inflationApi } from "@/lib/api";
import type { Government } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useGovernments(country = "ar") {
  return useQuery<Government[]>({
    queryKey: ["governments", country],
    queryFn: async () => {
      const response = await inflationApi.getGovernments(country);
      return (response.data as Government[]) ?? [];
    },
    staleTime: 86400000,
  });
}
