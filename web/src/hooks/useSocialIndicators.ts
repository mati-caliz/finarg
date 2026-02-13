"use client";

import { indicatorsApi } from "@/lib/api";
import type { SocialIndicators } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useSocialIndicators(country = "ar") {
  return useQuery<SocialIndicators>({
    queryKey: ["indicators", "social", country],
    queryFn: async () => {
      const response = await indicatorsApi.getSocial(country);
      return response.data;
    },
    enabled: country === "ar",
    staleTime: 3600000,
    gcTime: 604800000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}
