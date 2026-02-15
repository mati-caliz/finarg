"use client";

import type { CountryCode } from "@/config/countries";
import { newsApi } from "@/lib/api";
import { parseAiAnalysis } from "@/lib/parseAiAnalysis";
import { queryKeys } from "@/lib/queryKeys";
import { useAppStore } from "@/store/useStore";
import type { NewsArticle, NewsListResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

function processNewsArticles(response: NewsListResponse): NewsListResponse {
  return {
    ...response,
    articles: response.articles.map((article) => {
      const parsed = parseAiAnalysis(article.aiSummary);
      return {
        ...article,
        aiSummary: parsed.cleanSummary || article.aiSummary,
        keyPoints: parsed.keyPoints.length > 0 ? parsed.keyPoints : article.keyPoints,
      };
    }),
  };
}

export function useNews(country?: CountryCode, page = 0, size = 20) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryToUse = country || selectedCountry;

  return useQuery<NewsListResponse>({
    queryKey: queryKeys.news.list(countryToUse, page, size),
    queryFn: async () => {
      const response = await newsApi.getLatest(countryToUse, page, size);
      return processNewsArticles(response.data);
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
      return processNewsArticles(response.data);
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
      const article = response.data;
      const parsed = parseAiAnalysis(article.aiSummary);
      return {
        ...article,
        aiSummary: parsed.cleanSummary || article.aiSummary,
        keyPoints: parsed.keyPoints.length > 0 ? parsed.keyPoints : article.keyPoints,
      };
    },
    staleTime: 600000,
    gcTime: 3600000,
  });
}
