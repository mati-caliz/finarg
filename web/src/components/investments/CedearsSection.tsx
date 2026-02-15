"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCedears } from "@/hooks/useInvestments";
import { INVESTMENT_GRID, variationColor } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";

export function CedearsSection() {
  const { data: cedears, isLoading, error } = useCedears();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={cedears === null || cedears === undefined || cedears.length === 0}
      gridClassName={INVESTMENT_GRID.FOUR_COL}
      skeletonCount={8}
      skeletonHeight="h-32"
    >
      {cedears?.map((cedear) => {
        const isPositive = cedear.change >= 0;
        return (
          <Card key={cedear.symbol} className="border-t-[3px] border-t-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{cedear.symbol}</span>
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
                <p className="text-xs text-muted-foreground truncate">{cedear.companyName}</p>
                <p className="text-2xl font-bold">
                  {formatPrice(cedear.lastPrice, cedear.currency)}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className={variationColor(isPositive)}>
                    {formatPrice(cedear.change, cedear.currency)}
                  </span>
                  <span className={variationColor(isPositive)}>
                    {cedear.changePercent.toFixed(2)}%
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
