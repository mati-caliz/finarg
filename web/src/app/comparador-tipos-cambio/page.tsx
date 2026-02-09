"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { exchangeRateComparisonApi } from "@/lib/api";
import { useAppStore } from "@/store/useStore";
import type { ExchangeRateComparison } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  ArrowUpDown,
  DollarSign,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function formatNumber(value: number | undefined) {
  if (value === undefined || value === null) {
    return "-";
  }
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function HighlightCard({
  title,
  rate,
  icon: Icon,
  color,
  translate,
}: {
  title: string;
  rate: ExchangeRateComparison["cheapestToBuy"];
  icon: React.ElementType;
  color: string;
  translate: (key: TranslationKey) => string;
}) {
  if (!rate) {
    return null;
  }

  return (
    <Card className="border-t-[3px]" style={{ borderTopColor: color }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-2xl font-bold">${formatNumber(rate.sell)}</p>
          <p className="text-sm text-muted-foreground">{rate.name}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{translate("buy")}:</span>
            <span className="font-medium">${formatNumber(rate.buy)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{translate("spread")}:</span>
            <span className="font-medium">{formatNumber(rate.spreadPercentage)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExchangeRateComparatorPage() {
  const { translate } = useTranslation();
  const { selectedCountry } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ["exchangeRateComparison", selectedCountry],
    queryFn: async () => {
      const response = await exchangeRateComparisonApi.compareRates(selectedCountry);
      return response.data as ExchangeRateComparison;
    },
    staleTime: 180000,
    gcTime: 300000,
    refetchInterval: 180000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6" />
          {translate("exchangeRatesComparator")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {translate("exchangeRatesComparatorDesc")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <HighlightCard
          title={translate("cheapestToBuy")}
          rate={data?.cheapestToBuy ?? null}
          icon={TrendingDown}
          color="#22c55e"
          translate={translate}
        />
        <HighlightCard
          title={translate("mostExpensiveToBuy")}
          rate={data?.mostExpensiveToBuy ?? null}
          icon={TrendingUp}
          color="#ef4444"
          translate={translate}
        />
        <HighlightCard
          title={translate("bestPriceToSell")}
          rate={data?.mostExpensiveToSell ?? null}
          icon={TrendingUp}
          color="#3b82f6"
          translate={translate}
        />
        <HighlightCard
          title={translate("worstPriceToSell")}
          rate={data?.cheapestToSell ?? null}
          icon={TrendingDown}
          color="#f97316"
          translate={translate}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {translate("allQuotes")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translate("exchangeRateType")}</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {translate("buy")}
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {translate("sell")}
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {translate("spread")}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">{translate("variation")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.rates.map((rate) => (
                  <TableRow key={rate.type}>
                    <TableCell className="font-medium">{rate.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${formatNumber(rate.buy)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${formatNumber(rate.sell)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono">${formatNumber(rate.spread)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatNumber(rate.spreadPercentage)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {rate.variation !== undefined && rate.variation !== null && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            rate.variation >= 0
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {rate.variation >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatNumber(Math.abs(rate.variation))}%
                        </span>
                      )}
                      {(rate.variation === undefined || rate.variation === null) && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
