import { realEstateApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useNeighborhoods(cityCode: string | null) {
  return useQuery({
    queryKey: ["neighborhoods", cityCode],
    queryFn: async () => {
      if (cityCode === null || cityCode === "") {
        return [];
      }
      const response = await realEstateApi.getNeighborhoods(cityCode);
      return response.data;
    },
    enabled: cityCode !== null && cityCode !== "",
    staleTime: 24 * 60 * 60 * 1000,
    refetchInterval: 24 * 60 * 60 * 1000,
  });
}
