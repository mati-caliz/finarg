"use client";

import type { CountryCode } from "@/config/countries";
import { reservesApi } from "@/lib/api";
import type { Reserves } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useReserves(country: CountryCode = "ar") {
  return useQuery<Reserves>({
    queryKey: ["reserves", country],
    queryFn: async () => {
      const response = await reservesApi.getCurrent(country);
      return response.data;
    },
    enabled: country === "ar",
    refetchInterval: 300000,
  });
}
