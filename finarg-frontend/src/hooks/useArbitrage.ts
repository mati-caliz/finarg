"use client";

import { arbitrageApi } from "@/lib/api";
import type { Arbitrage } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useArbitrage() {
  return useQuery<Arbitrage[]>({
    queryKey: ["arbitrage"],
    queryFn: async () => {
      const response = await arbitrageApi.getOpportunities();
      return response.data;
    },
    refetchInterval: 120000,
  });
}

export const useArbitraje = useArbitrage;
