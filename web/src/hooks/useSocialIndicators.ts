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
    staleTime: 86400000,
    gcTime: 604800000,
    refetchInterval: 86400000,
    retry: 3,
  });
}
