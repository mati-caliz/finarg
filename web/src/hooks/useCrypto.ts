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
    staleTime: 300000,
    gcTime: 86400000,
  });
}
