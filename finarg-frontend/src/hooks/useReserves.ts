'use client';

import { useQuery } from '@tanstack/react-query';
import { reservesApi } from '@/lib/api';
import { Reserves } from '@/types';

export function useReserves() {
  return useQuery<Reserves>({
    queryKey: ['reserves'],
    queryFn: async () => {
      const response = await reservesApi.getCurrent();
      return response.data;
    },
    refetchInterval: 300000,
  });
}

export function useReservesHistory(days: number = 30) {
  return useQuery({
    queryKey: ['reserves', 'history', days],
    queryFn: async () => {
      const response = await reservesApi.getHistory(days);
      return response.data;
    },
  });
}

export const useReservas = useReserves;
export const useReservasHistorico = useReservesHistory;
