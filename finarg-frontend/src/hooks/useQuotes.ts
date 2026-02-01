"use client";

import type { CountryCode } from "@/config/countries";
import { quotesApi } from "@/lib/api";
import { useAppStore } from "@/store/useStore";
import type { Gap, Quote } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useQuotes(country?: CountryCode) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<Quote[]>({
    queryKey: ["quotes", countryToUse],
    queryFn: async () => {
      const response = await quotesApi.getAllByCountry(countryToUse);
      return response.data;
    },
    refetchInterval: 180000,
  });
}

export function useQuote(type: string, country?: CountryCode) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<Quote>({
    queryKey: ["quote", countryToUse, type],
    queryFn: async () => {
      const response = await quotesApi.getByCountryAndType(countryToUse, type);
      return response.data;
    },
    enabled: !!type,
  });
}

export function useGap(country?: CountryCode) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<Gap>({
    queryKey: ["gap", countryToUse],
    queryFn: async () => {
      const response = await quotesApi.getGapByCountry(countryToUse);
      return response.data;
    },
    refetchInterval: 180000,
  });
}

export const useCotizaciones = useQuotes;
export const useCotizacion = useQuote;
export const useBrecha = useGap;
