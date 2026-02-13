"use client";

import { inflationApi } from "@/lib/api";
import type { Inflation, InflationAdjustment } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCurrentInflation() {
  return useQuery<Inflation>({
    queryKey: ["inflation", "current"],
    queryFn: async () => {
      const response = await inflationApi.getCurrent();
      return response.data;
    },
    staleTime: 3600000,
    gcTime: 604800000,
  });
}

export function useMonthlyInflation() {
  return useQuery<Inflation[]>({
    queryKey: ["inflation", "monthly"],
    queryFn: async () => {
      const response = await inflationApi.getMonthly(300);
      return response.data;
    },
    staleTime: 3600000,
    gcTime: 604800000,
  });
}

export function useAdjustInflation() {
  return useMutation<
    InflationAdjustment,
    Error,
    { amount: number; fromDate: string; toDate: string }
  >({
    mutationFn: async ({ amount, fromDate, toDate }) => {
      const response = await inflationApi.adjust(amount, fromDate, toDate);
      return response.data;
    },
  });
}
