import { currencyConversionApi } from "@/lib/api";
import type { CurrencyConversionRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useCurrencyConversion() {
  return useMutation({
    mutationFn: async (request: CurrencyConversionRequest) => {
      const response = await currencyConversionApi.convert(request);
      return response.data;
    },
  });
}
