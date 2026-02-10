"use client";

import type { CountryCode } from "@/config/countries";
import { quotesApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAppStore } from "@/store/useStore";
import type { Gap, Quote } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useQuotes(country?: CountryCode) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<Quote[]>({
    queryKey: queryKeys.quotes.all(countryToUse),
    queryFn: async () => {
      const response = await quotesApi.getAllByCountry(countryToUse);
      return response.data;
    },
    staleTime: 30000,
    refetchInterval: 180000,
  });
}

export function useGap(country?: CountryCode) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<Gap>({
    queryKey: queryKeys.quotes.gap(countryToUse),
    queryFn: async () => {
      const response = await quotesApi.getGapByCountry(countryToUse);
      return response.data;
    },
    staleTime: 30000,
    refetchInterval: 180000,
  });
}
