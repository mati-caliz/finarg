"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCrypto } from "@/hooks/useCrypto";
import { variationColor } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";

const GRID_CLASS = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

export function CryptoSection() {
  const { data: cryptoList, isLoading, error } = useCrypto();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={cryptoList === null || cryptoList === undefined || cryptoList.length === 0}
      gridClassName={GRID_CLASS}
      skeletonCount={8}
      skeletonHeight="h-32"
    >
      {cryptoList?.map((crypto) => {
        const isPositive = crypto.change24h >= 0;
        return (
          <Card key={crypto.symbol} className="border-t-[3px] border-t-orange-500">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{crypto.symbol}</p>
                  <span className={variationColor(isPositive)}>
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
                  <span className={variationColor(isPositive)}>
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
    </InvestmentSectionWrapper>
  );
}
