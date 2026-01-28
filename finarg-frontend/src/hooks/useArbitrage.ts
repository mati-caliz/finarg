'use client';

import { useQuery } from '@tanstack/react-query';
import { arbitrageApi } from '@/lib/api';
import { Arbitrage } from '@/types';

export function useArbitrage() {
  return useQuery<Arbitrage[]>({
    queryKey: ['arbitrage'],
    queryFn: async () => {
      const response = await arbitrageApi.getOpportunities();
      return response.data;
    },
    refetchInterval: 120000,
  });
}

export const useArbitraje = useArbitrage;
