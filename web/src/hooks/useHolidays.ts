"use client";

import type { CountryCode } from "@/config/countries";
import { holidaysApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAppStore } from "@/store/useStore";
import type { Holiday } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useHolidays(country?: CountryCode, year?: number) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<Holiday[]>({
    queryKey: queryKeys.holidays.all(countryToUse, year),
    queryFn: async () => {
      const response = await holidaysApi.getAll(countryToUse, year);
      return response.data;
    },
    staleTime: 86400000,
    gcTime: 172800000,
  });
}

export function useUpcomingHolidays(country?: CountryCode) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<Holiday[]>({
    queryKey: queryKeys.holidays.upcoming(countryToUse),
    queryFn: async () => {
      const response = await holidaysApi.getUpcoming(countryToUse);
      return response.data;
    },
    staleTime: 3600000,
    gcTime: 7200000,
  });
}
