'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { inflacionApi } from '@/lib/api';
import { Inflacion, AjusteInflacion } from '@/types';

export function useInflacionActual() {
  return useQuery<Inflacion>({
    queryKey: ['inflacion', 'actual'],
    queryFn: async () => {
      const response = await inflacionApi.getActual();
      return response.data;
    },
  });
}

export function useInflacionMensual(meses: number = 12) {
  return useQuery<Inflacion[]>({
    queryKey: ['inflacion', 'mensual', meses],
    queryFn: async () => {
      const response = await inflacionApi.getMensual(meses);
      return response.data;
    },
  });
}

export function useAjustarInflacion() {
  return useMutation<AjusteInflacion, Error, { monto: number; fechaOrigen: string; fechaDestino: string }>({
    mutationFn: async ({ monto, fechaOrigen, fechaDestino }) => {
      const response = await inflacionApi.ajustar(monto, fechaOrigen, fechaDestino);
      return response.data;
    },
  });
}
