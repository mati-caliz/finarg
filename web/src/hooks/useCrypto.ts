"use client";

import { cryptoApi } from "@/lib/api";
import type { Crypto } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useCrypto() {
  return useQuery<Crypto[]>({
    queryKey: ["crypto"],
    queryFn: async () => {
      const response = await cryptoApi.getCurrent();
      return response.data;
    },
    staleTime: 180000,
    gcTime: 86400000,
    refetchInterval: 180000,
    retry: 3,
  });
}
