"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetals } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { TrendingDown, TrendingUp } from "lucide-react";

export function MetalsSection() {
  const { translate } = useTranslation();
  const { data: metals, isLoading, error } = useMetals();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getMetalName = (metalType: string) => {
    const names: Record<string, string> = {
      GOLD: translate("goldPrice"),
      SILVER: translate("silverPrice"),
      PLATINUM: translate("platinumPrice"),
      PALLADIUM: translate("palladiumPrice"),
    };
    return names[metalType] || metalType;
  };

  const getMetalColor = (metalType: string) => {
    const colors: Record<string, string> = {
      GOLD: "border-t-yellow-500",
      SILVER: "border-t-gray-400",
      PLATINUM: "border-t-slate-300",
      PALLADIUM: "border-t-zinc-400",
    };
    return colors[metalType] || "border-t-gray-500";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((id) => (
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

  if (metals === null || metals === undefined || metals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">{translate("noDataAvailable")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metals.map((metal) => {
        const isPositive = metal.change24h >= 0;
        return (
          <Card
            key={metal.metalType}
            className={`border-t-[3px] ${getMetalColor(metal.metalType)}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{getMetalName(metal.metalType)}</span>
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
                <p className="text-xs text-muted-foreground">Por {metal.unit}</p>
                <p className="text-2xl font-bold">{formatPrice(metal.priceUsd, "USD")}</p>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {formatPrice(metal.change24h, "USD")}
                  </span>
                  <span
                    className={
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {metal.changePercent24h.toFixed(2)}%
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
