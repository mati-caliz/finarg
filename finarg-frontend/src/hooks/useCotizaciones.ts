'use client';

import { useQuery } from '@tanstack/react-query';
import { cotizacionesApi } from '@/lib/api';
import { Cotizacion, Brecha } from '@/types';

export function useCotizaciones() {
  return useQuery<Cotizacion[]>({
    queryKey: ['cotizaciones'],
    queryFn: async () => {
      const response = await cotizacionesApi.getAll();
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useCotizacion(tipo: string) {
  return useQuery<Cotizacion>({
    queryKey: ['cotizacion', tipo],
    queryFn: async () => {
      const response = await cotizacionesApi.getByTipo(tipo);
      return response.data;
    },
    enabled: !!tipo,
  });
}

export function useBrecha() {
  return useQuery<Brecha>({
    queryKey: ['brecha'],
    queryFn: async () => {
      const response = await cotizacionesApi.getBrecha();
      return response.data;
    },
    refetchInterval: 60000,
  });
}
