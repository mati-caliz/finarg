"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrypto } from "@/hooks/useCrypto";
import { useTranslation } from "@/hooks/useTranslation";
import { TrendingDown, TrendingUp } from "lucide-react";

export function CryptoSection() {
  const { translate } = useTranslation();
  const { data: cryptoList, isLoading, error } = useCrypto();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
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

  if (cryptoList === null || cryptoList === undefined || cryptoList.length === 0) {
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
      {cryptoList.map((crypto) => {
        const isPositive = crypto.change24h >= 0;
        return (
          <Card key={crypto.symbol} className="border-t-[3px] border-t-orange-500">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{crypto.symbol}</p>
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
                </div>
                <p className="text-xs text-muted-foreground truncate">{crypto.name}</p>
                <p className="text-2xl font-bold">{formatPrice(crypto.priceUsd, "USD")}</p>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {isPositive ? "+" : ""}
                    {crypto.change24h.toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground">24h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
