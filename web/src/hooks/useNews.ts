"use client";

import type { CountryCode } from "@/config/countries";
import { newsApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAppStore } from "@/store/useStore";
import type { NewsArticle, NewsListResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useNews(country?: CountryCode, page = 0, size = 20) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<NewsListResponse>({
    queryKey: queryKeys.news.list(countryToUse, page, size),
    queryFn: async () => {
      const response = await newsApi.getLatest(countryToUse, page, size);
      return response.data;
    },
    staleTime: 600000,
    gcTime: 3600000,
  });
}

export function useNewsByCategory(category: string, country?: CountryCode, page = 0, size = 20) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<NewsListResponse>({
    queryKey: queryKeys.news.category(category, countryToUse, page, size),
    queryFn: async () => {
      const response = await newsApi.getByCategory(category, countryToUse, page, size);
      return response.data;
    },
    staleTime: 600000,
    gcTime: 3600000,
  });
}

export function useNewsById(id: number) {
  return useQuery<NewsArticle>({
    queryKey: queryKeys.news.detail(id),
    queryFn: async () => {
      const response = await newsApi.getById(id);
      return response.data;
    },
    staleTime: 600000,
    gcTime: 3600000,
  });
}
