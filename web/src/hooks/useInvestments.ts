"use client";

import { investmentsApi } from "@/lib/api";
import type { Bond, Cedear, Etf, Metal, Stock } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useStocks() {
  return useQuery<Stock[]>({
    queryKey: ["investments", "stocks"],
    queryFn: async () => {
      const response = await investmentsApi.getStocks();
      return response.data;
    },
    staleTime: 300000,
    gcTime: 3600000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCedears() {
  return useQuery<Cedear[]>({
    queryKey: ["investments", "cedears"],
    queryFn: async () => {
      const response = await investmentsApi.getCedears();
      return response.data;
    },
    staleTime: 300000,
    gcTime: 3600000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useBonds() {
  return useQuery<Bond[]>({
    queryKey: ["investments", "bonds"],
    queryFn: async () => {
      const response = await investmentsApi.getBonds();
      return response.data;
    },
    staleTime: 300000,
    gcTime: 3600000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useEtfs() {
  return useQuery<Etf[]>({
    queryKey: ["investments", "etf"],
    queryFn: async () => {
      const response = await investmentsApi.getEtfs();
      return response.data;
    },
    staleTime: 300000,
    gcTime: 3600000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useMetals() {
  return useQuery<Metal[]>({
    queryKey: ["investments", "metals"],
    queryFn: async () => {
      const response = await investmentsApi.getMetals();
      return response.data;
    },
    staleTime: 300000,
    gcTime: 3600000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useLetras() {
  return useQuery({
    queryKey: ["investments", "letras"],
    queryFn: async () => {
      const response = await investmentsApi.getLetras();
      return response.data;
    },
    staleTime: 300000,
    gcTime: 3600000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCauciones() {
  return useQuery({
    queryKey: ["investments", "cauciones"],
    queryFn: async () => {
      const response = await investmentsApi.getCauciones();
      return response.data;
    },
    staleTime: 300000,
    gcTime: 3600000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
