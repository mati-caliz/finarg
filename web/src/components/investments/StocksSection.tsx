"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStocks } from "@/hooks/useInvestments";
import { variationColor } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";

const GRID_CLASS = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

export function StocksSection() {
  const { data: stocks, isLoading, error } = useStocks();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={stocks === null || stocks === undefined || stocks.length === 0}
      gridClassName={GRID_CLASS}
      skeletonCount={8}
      skeletonHeight="h-32"
    >
      {stocks?.map((stock) => {
        const isPositive = stock.change >= 0;
        return (
          <Card key={stock.ticker} className="border-t-[3px] border-t-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{stock.ticker}</span>
                <span className={variationColor(isPositive)}>
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
                <p className="text-xs text-muted-foreground truncate">{stock.companyName}</p>
                <p className="text-2xl font-bold">
                  {formatPrice(stock.currentPrice, stock.currency)}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className={variationColor(isPositive)}>
                    {formatPrice(stock.change, stock.currency)}
                  </span>
                  <span className={variationColor(isPositive)}>
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </InvestmentSectionWrapper>
  );
}
