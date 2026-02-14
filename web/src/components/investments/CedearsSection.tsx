"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCedears } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { TrendingDown, TrendingUp } from "lucide-react";

export function CedearsSection() {
  const { translate } = useTranslation();
  const { data: cedears, isLoading, error } = useCedears();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => `skeleton-${i}`).map((id) => (
          <Skeleton key={id} className="h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{translate("errorLoadingData")}</p>
        </CardContent>
      </Card>
    );
  }

  if (cedears === null || cedears === undefined || cedears.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">{translate("noDataAvailable")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cedears.map((cedear) => {
        const isPositive = cedear.change >= 0;
        return (
          <Card key={cedear.symbol} className="border-t-[3px] border-t-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{cedear.symbol}</span>
                <span
                  className={
                    isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground truncate">{cedear.companyName}</p>
                <p className="text-2xl font-bold">
                  {formatPrice(cedear.lastPrice, cedear.currency)}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {formatPrice(cedear.change, cedear.currency)}
                  </span>
                  <span
                    className={
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {cedear.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
