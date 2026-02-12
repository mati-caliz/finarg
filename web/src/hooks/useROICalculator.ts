import { realEstateApi } from "@/lib/api";
import type { ROIRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useROICalculator() {
  return useMutation({
    mutationFn: async (request: ROIRequest) => {
      const response = await realEstateApi.calculateROI(request);
      return response.data;
    },
  });
}
