"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCrypto } from "@/hooks/useCrypto";
import { INVESTMENT_GRID, variationColor } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";

export function CryptoSection() {
  const { data: cryptoList, isLoading, error } = useCrypto();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={cryptoList === null || cryptoList === undefined || cryptoList.length === 0}
      gridClassName={INVESTMENT_GRID.FOUR_COL}
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
