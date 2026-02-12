import { realEstateApi } from "@/lib/api";
import type { PropertyFilter } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function usePropertyPrices(filters: PropertyFilter | null) {
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
    staleTime: 6 * 60 * 60 * 1000,
    refetchInterval: 6 * 60 * 60 * 1000,
  });
}
