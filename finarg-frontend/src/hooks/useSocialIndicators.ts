'use client';

import { useQuery } from '@tanstack/react-query';
import { indicatorsApi } from '@/lib/api';
import { SocialIndicators } from '@/types';

export function useSocialIndicators(country: string = 'ar') {
  return useQuery<SocialIndicators>({
    queryKey: ['indicators', 'social', country],
    queryFn: async () => {
      const response = await indicatorsApi.getSocial(country);
      return response.data;
    },
    enabled: country === 'ar',
    refetchInterval: 3600000,
  });
}
