"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEtfs } from "@/hooks/useInvestments";
import { variationColor } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";

const GRID_CLASS = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

export function EtfsSection() {
  const { data: etfs, isLoading, error } = useEtfs();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={etfs === null || etfs === undefined || etfs.length === 0}
      gridClassName={GRID_CLASS}
      skeletonCount={8}
      skeletonHeight="h-32"
    >
      {etfs?.map((etf) => {
        const isPositive = etf.change >= 0;
        return (
          <Card key={etf.ticker} className="border-t-[3px] border-t-cyan-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{etf.ticker}</span>
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
                <p className="text-xs text-muted-foreground truncate">{etf.name}</p>
                <p className="text-2xl font-bold">{formatPrice(etf.price, etf.currency)}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={variationColor(isPositive)}>
                    {formatPrice(etf.change, etf.currency)}
                  </span>
                  <span className={variationColor(isPositive)}>
                    {etf.changePercent.toFixed(2)}%
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
