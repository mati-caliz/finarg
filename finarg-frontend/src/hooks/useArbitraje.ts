'use client';

import { useQuery } from '@tanstack/react-query';
import { arbitrajeApi } from '@/lib/api';
import { Arbitraje } from '@/types';

export function useArbitraje() {
  return useQuery<Arbitraje[]>({
    queryKey: ['arbitraje'],
    queryFn: async () => {
      const response = await arbitrajeApi.getOportunidades();
      return response.data;
    },
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}
