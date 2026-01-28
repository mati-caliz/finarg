'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { inflationApi } from '@/lib/api';
import { Inflation, InflationAdjustment } from '@/types';

export function useCurrentInflation() {
  return useQuery<Inflation>({
    queryKey: ['inflation', 'current'],
    queryFn: async () => {
      const response = await inflationApi.getCurrent();
      return response.data;
    },
  });
}

export function useMonthlyInflation(months: number = 12) {
  return useQuery<Inflation[]>({
    queryKey: ['inflation', 'monthly', months],
    queryFn: async () => {
      const response = await inflationApi.getMonthly(months);
      return response.data;
    },
  });
}

export function useAdjustInflation() {
  return useMutation<InflationAdjustment, Error, { amount: number; fromDate: string; toDate: string }>({
    mutationFn: async ({ amount, fromDate, toDate }) => {
      const response = await inflationApi.adjust(amount, fromDate, toDate);
      return response.data;
    },
  });
}

export const useInflacionActual = useCurrentInflation;
export const useInflacionMensual = useMonthlyInflation;
export const useAjustarInflacion = useAdjustInflation;
