import { realEstateApi } from "@/lib/api";
import type { PropertyFilter } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function usePropertyPrices(filters: PropertyFilter | null) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const cacheTime = isDevelopment ? 30 * 1000 : 6 * 60 * 60 * 1000;

  return useQuery({
    queryKey: ["propertyPrices", filters],
    queryFn: async () => {
      if (filters === null || filters.cityCode === "") {
        throw new Error("Filters are required");
      }
      const response = await realEstateApi.getPropertyPrices(filters);
      return response.data;
    },
    enabled: filters !== null && filters.cityCode !== "",
    staleTime: cacheTime,
    refetchInterval: cacheTime,
  });
}
