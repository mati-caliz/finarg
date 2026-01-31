'use client';

import { useQuery } from '@tanstack/react-query';
import { reservesApi } from '@/lib/api';
import { Reserves } from '@/types';
import { CountryCode } from '@/config/countries';

export function useReserves(country: CountryCode = 'ar') {
  return useQuery<Reserves>({
    queryKey: ['reserves', country],
    queryFn: async () => {
      const response = await reservesApi.getCurrent(country);
      return response.data;
    },
    enabled: country === 'ar',
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
