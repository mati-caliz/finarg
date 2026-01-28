'use client';

import { useQuery } from '@tanstack/react-query';
import { reservasApi } from '@/lib/api';
import { Reservas } from '@/types';

export function useReservas() {
  return useQuery<Reservas>({
    queryKey: ['reservas'],
    queryFn: async () => {
      const response = await reservasApi.getActuales();
      return response.data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

export function useReservasHistorico(dias: number = 30) {
  return useQuery({
    queryKey: ['reservas', 'historico', dias],
    queryFn: async () => {
      const response = await reservasApi.getHistorico(dias);
      return response.data;
    },
  });
}
