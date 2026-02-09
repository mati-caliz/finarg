"use client";

import { QueryError } from "@/components/QueryError";
import { LineChart } from "@/components/charts";
import { DolarCardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCountryConfig } from "@/config/countries";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { quotesApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { formatCurrencySimple, sortQuotesByVariant } from "@/lib/utils";
import { useAppStore } from "@/store/useStore";
import type { Quote } from "@/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function useUpdateProgress(dataUpdatedAt: number, intervalMs: number): number {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  return dataUpdatedAt ? Math.min(100, ((Date.now() - dataUpdatedAt) / intervalMs) * 100) : 0;
}

type BaseCurrency = "usd" | "eur" | "brl" | "clp" | "uyu" | "pyg" | "bob" | "cny";

export default function QuotesPage() {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const countryConfig = getCountryConfig(selectedCountry);
  const { translate } = useTranslation();
  const hasCurrencyGroups = selectedCountry === "ar";

  const [selectedBaseCurrency, setSelectedBaseCurrency] = useState<BaseCurrency>("usd");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [period, setPeriod] = useState("30");

  const periods = useMemo(
    () => [
      { value: "7", label: translate("days7") },
      { value: "30", label: translate("days30") },
      { value: "90", label: translate("months3") },
      { value: "180", label: translate("months6") },
      { value: "365", label: translate("year1") },
      { value: "730", label: translate("year2") },
      { value: "1095", label: translate("year3") },
      { value: "1825", label: translate("year5") },
      { value: "3650", label: translate("year10") },
      { value: "5500", label: translate("max") },
    ],
    [translate],
  );

  const QUOTES_REFETCH_MS = 180000;

  const {
    data: quotes,
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: queryKeys.quotes.all(selectedCountry),
    queryFn: async () => {
      const response = await quotesApi.getAllByCountry(selectedCountry);
      return response.data as Quote[];
    },
    staleTime: 30000,
    refetchInterval: QUOTES_REFETCH_MS,
  });

  const availableBaseCurrencies = useMemo(() => {
    if (!quotes || selectedCountry !== "ar") return [];
    const baseCurrencySet = new Set(
      quotes
        .map((q) => q.baseCurrency)
        .filter((bc): bc is string => bc !== undefined && bc !== null),
    );
    return Array.from(baseCurrencySet) as BaseCurrency[];
  }, [quotes, selectedCountry]);

  const chartableTypes = useMemo(() => {
    if (!quotes) return new Set<string>();
    return new Set(quotes.filter((q) => q.hasHistory === true).map((q) => q.type));
  }, [quotes]);

  const hasChartHistory = (type: string): boolean => {
    return chartableTypes.has(type);
  };

  const allowedTypeCodes = useMemo(() => {
    if (!quotes) return new Set<string>();
    const types = hasCurrencyGroups
      ? quotes.filter((q) => q.baseCurrency === selectedBaseCurrency).map((q) => q.type)
      : quotes.map((q) => q.type);
    return new Set(types);
  }, [quotes, selectedBaseCurrency, hasCurrencyGroups]);

  const chartableTypeCodes = useMemo(() => {
    return Array.from(allowedTypeCodes).filter((code) => chartableTypes.has(code));
  }, [allowedTypeCodes, chartableTypes]);

  const currencyTypes = useMemo(() => {
    const types = hasCurrencyGroups
      ? countryConfig.currencyTypes.filter((t) => allowedTypeCodes.has(t.code))
      : countryConfig.currencyTypes;
    return types.map((tType) => ({
      value: tType.code,
      label: translate(tType.code as TranslationKey),
    }));
  }, [countryConfig, allowedTypeCodes, hasCurrencyGroups, translate]);

  const filteredQuotes = useMemo(() => {
    if (!quotes) {
      return undefined;
    }
    const list = !hasCurrencyGroups
      ? quotes
      : quotes.filter((q) => q.baseCurrency === selectedBaseCurrency);
    return sortQuotesByVariant(list);
  }, [quotes, hasCurrencyGroups, selectedBaseCurrency]);

  useEffect(() => {
    setSelectedTypes((prev) => {
      const kept = prev.filter((t) => allowedTypeCodes.has(t));
      if (kept.length > 0) {
        return kept;
      }
      const first = chartableTypeCodes[0];
      return first !== undefined ? [first] : [];
    });
    setActiveCard((prev) => {
      if (prev !== null && allowedTypeCodes.has(prev)) {
        return prev;
      }
      return chartableTypeCodes[0] ?? null;
    });
  }, [allowedTypeCodes, chartableTypeCodes]);

  const updateProgress = useUpdateProgress(dataUpdatedAt, QUOTES_REFETCH_MS);

  const chartableSelectedTypes = useMemo(
    () => selectedTypes.filter((t) => !hasCurrencyGroups || chartableTypes.has(t)),
    [selectedTypes, hasCurrencyGroups, chartableTypes],
  );

  const historyQueries = useQueries({
    queries: chartableSelectedTypes.map((type) => ({
      queryKey: queryKeys.quotes.history(selectedCountry, type, period),
      queryFn: async () => {
        const to = new Date().toISOString().split("T")[0];
        const from = new Date(Date.now() - Number.parseInt(period, 10) * 24 * 60 * 60 * 1000)
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

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate("quotes")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{translate("allQuotesRealTime")}</p>
        </div>
        <QueryError
          error={error as Error}
          onRetry={() => refetch()}
          title={translate("errorLoadingQuotes")}
        />
      </div>
    );
  }

  const currencyMap: Record<string, TranslationKey> = {
    usd: "currencyDollar",
    eur: "currencyEuro",
    brl: "currencyReal",
    cny: "currencyCny",
    clp: "currencyClp",
    uyu: "currencyUyu",
    pyg: "currencyPyg",
    bob: "currencyBob",
  };

  const baseCurrencyButtons =
    hasCurrencyGroups && availableBaseCurrencies.length > 0
      ? availableBaseCurrencies.map((bc) => ({
          key: bc,
          labelKey: currencyMap[bc] ?? ("currencyDollar" as TranslationKey),
        }))
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate("quotes")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{translate("allQuotesRealTime")}</p>
          {!isLoading && dataUpdatedAt !== null && (
            <div className="mt-2 w-full max-w-xs">
              <div
                tabIndex={0}
                className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(updateProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={translate("quotesNextUpdateLabel")}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
                  style={{ width: `${updateProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {baseCurrencyButtons && (
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {baseCurrencyButtons.map(({ key, labelKey }) => (
              <Button
                key={key}
                variant={selectedBaseCurrency === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBaseCurrency(key)}
                className="text-xs sm:text-sm"
              >
                {translate(labelKey)}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: currencyTypes.length || 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons have no unique ID
              <DolarCardSkeleton key={i} />
            ))
          : filteredQuotes?.map((quote) => (
              <Card
                key={quote.type}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  activeCard === quote.type
                    ? "ring-2 ring-primary shadow-lg shadow-primary/10 border-primary/30"
                    : "hover:ring-2 hover:ring-primary/50"
                }`}
                onClick={() => {
                  setActiveCard(quote.type);
                  if (hasChartHistory(quote.type)) {
                    setSelectedTypes([quote.type]);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {translate(quote.type as TranslationKey)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {translate("spread")}: {formatCurrencySimple(quote.spread, selectedCountry)}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        quote.variation >= 0
                          ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15"
                          : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15"
                      }`}
                    >
                      {quote.variation >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {Math.abs(quote.variation).toFixed(2)}%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{translate("buy")}</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrencySimple(quote.buy, selectedCountry)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{translate("sell")}</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrencySimple(quote.sell, selectedCountry)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(quote.lastUpdate).toLocaleString(countryConfig.locale)}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {(!hasCurrencyGroups ||
        (chartableTypeCodes.length > 0 && chartableSelectedTypes.length > 0)) &&
        !["cny", "pyg", "bob"].includes(selectedBaseCurrency) && (
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-lg">{translate("history")}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {periods.map((p) => (
                      <Button
                        key={p.value}
                        variant={period === p.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPeriod(p.value)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {hasCurrencyGroups &&
                  currencyTypes.filter((t) => hasChartHistory(t.value)).length > 1 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {currencyTypes
                        .filter((t) => hasChartHistory(t.value))
                        .map((t) => (
                          <Button
                            key={t.value}
                            variant={selectedTypes.includes(t.value) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setActiveCard(t.value);
                              setSelectedTypes([t.value]);
                            }}
                          >
                            {t.label}
                          </Button>
                        ))}
                    </div>
                  )}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {chartableSelectedTypes.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {translate("noHistoricalData")}
                </div>
              ) : (
                chartableSelectedTypes.map((type, i) => {
                  const q = historyQueries[i];
                  const label = currencyTypes.find((t) => t.value === type)?.label ?? type;
                  const history = q?.data;
                  const isLoading = q?.isLoading ?? false;
                  const isError = q?.isError ?? false;
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
                            setSelectedTypes((prev) => prev.filter((t) => t !== type));
                            setActiveCard((prev) => (prev === type ? null : prev));
                          }}
                          aria-label={translate("remove")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {isLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                          <Skeleton className="w-full h-full" />
                        </div>
                      ) : isError && err ? (
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
                            `${countryConfig.currencySymbol}${v.toLocaleString(countryConfig.locale)}`
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
                })
              )}
            </CardContent>
          </Card>
        )}

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">{translate("quotesComparison")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: currencyTypes.length || 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons have no unique ID
                <div key={i} className="flex gap-4 py-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : !filteredQuotes || filteredQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">{translate("noQuotesAvailable")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      {translate("type")}
                    </th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                      {translate("buy")}
                    </th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                      {translate("sell")}
                    </th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                      {translate("spread")}
                    </th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                      {translate("variation")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.type} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {translate(quote.type as TranslationKey)}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 text-foreground">
                        {formatCurrencySimple(quote.buy, selectedCountry)}
                      </td>
                      <td className="text-right py-3 px-4 text-foreground">
                        {formatCurrencySimple(quote.sell, selectedCountry)}
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground">
                        {formatCurrencySimple(quote.spread, selectedCountry)}
                      </td>
                      <td
                        className={`text-right py-3 px-4 ${
                          quote.variation >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {quote.variation >= 0 ? "+" : ""}
                        {quote.variation.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
