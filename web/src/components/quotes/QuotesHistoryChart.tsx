"use client";

import { QueryError } from "@/components/QueryError";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CountryConfig } from "@/config/countries";
import { useTranslation } from "@/hooks/useTranslation";
import { quotesApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAppStore } from "@/store/useStore";
import { useQueries } from "@tanstack/react-query";
import { X } from "lucide-react";
import dynamic from "next/dynamic";

const LineChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);

interface CurrencyTypeOption {
  value: string;
  label: string;
}

interface QuotesHistoryChartProps {
  selectedTypes: string[];
  onRemoveType: (type: string) => void;
  daysLimit: number;
  countryConfig: CountryConfig;
  currencyTypes: CurrencyTypeOption[];
}

export function QuotesHistoryChart({
  selectedTypes,
  onRemoveType,
  daysLimit,
  countryConfig,
  currencyTypes,
}: QuotesHistoryChartProps) {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);

  const historyQueries = useQueries({
    queries: selectedTypes.map((type) => ({
      queryKey: queryKeys.quotes.history(selectedCountry, type, String(daysLimit)),
      queryFn: async () => {
        const to = new Date().toISOString().split("T")[0];
        const from = new Date(Date.now() - daysLimit * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        const response = await quotesApi.getHistory(type, from, to, selectedCountry);
        return response.data as { date: string; buy: number; sell: number }[];
      },
      enabled: true,
    })),
  });

  const formatDate = (value: string | number) => {
    const date = new Date(value);
    return date.toLocaleDateString(countryConfig.locale, { day: "2-digit", month: "short" });
  };

  if (selectedTypes.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        {translate("noHistoricalData")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {selectedTypes.map((type, i) => {
        const q = historyQueries[i];
        const label = currencyTypes.find((t) => t.value === type)?.label ?? type;
        const history = q?.data;
        const isQueryLoading = q?.isLoading ?? false;
        const isQueryError = q?.isError ?? false;
        const err = q?.error;
        const refetchOne = q?.refetch;
        return (
          <div key={type}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveType(type);
                }}
                aria-label={translate("remove")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isQueryLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : isQueryError && err ? (
              <QueryError error={err as Error} onRetry={() => refetchOne?.()} compact />
            ) : history && history.length > 0 ? (
              <LineChart
                data={history}
                xKey="date"
                yKey={["buy", "sell"]}
                colors={["#3b82f6", "#10b981"]}
                height={320}
                formatX={formatDate}
                formatY={(v) =>
                  `${countryConfig.currencySymbol}${Number(v).toLocaleString(countryConfig.locale)}`
                }
                showLegend
                showGrid={false}
                legendLabels={{ buy: translate("buy"), sell: translate("sell") }}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {translate("noHistoricalData")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
