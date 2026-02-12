import { realEstateApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const response = await realEstateApi.getCities();
      return response.data;
    },
    staleTime: 24 * 60 * 60 * 1000,
    refetchInterval: 24 * 60 * 60 * 1000,
  });
}
