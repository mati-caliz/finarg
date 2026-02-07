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
  });
}

export function useMonthlyInflation(months = 12) {
  return useQuery<Inflation[]>({
    queryKey: ["inflation", "monthly", months],
    queryFn: async () => {
      const response = await inflationApi.getMonthly(months);
      return response.data;
    },
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
