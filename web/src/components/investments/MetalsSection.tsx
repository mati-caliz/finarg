"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetals } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { variationColor } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";

const GRID_CLASS = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";

const METAL_COLORS: Record<string, string> = {
  GOLD: "border-t-yellow-500",
  SILVER: "border-t-gray-400",
  PLATINUM: "border-t-slate-300",
  PALLADIUM: "border-t-zinc-400",
};

export function MetalsSection() {
  const { translate } = useTranslation();
  const { data: metals, isLoading, error } = useMetals();

  const getMetalName = (metalType: string) => {
    const names: Record<string, string> = {
      GOLD: translate("goldPrice"),
      SILVER: translate("silverPrice"),
      PLATINUM: translate("platinumPrice"),
      PALLADIUM: translate("palladiumPrice"),
    };
    return names[metalType] || metalType;
  };

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={metals === null || metals === undefined || metals.length === 0}
      gridClassName={GRID_CLASS}
      skeletonCount={4}
      skeletonHeight="h-32"
    >
      {metals?.map((metal) => {
        const isPositive = metal.change24h >= 0;
        return (
          <Card
            key={metal.metalType}
            className={`border-t-[3px] ${METAL_COLORS[metal.metalType] || "border-t-gray-500"}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{getMetalName(metal.metalType)}</span>
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
                <p className="text-xs text-muted-foreground">
                  {translate("per")} {metal.unit}
                </p>
                <p className="text-2xl font-bold">{formatPrice(metal.priceUsd, "USD")}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={variationColor(isPositive)}>
                    {formatPrice(metal.change24h, "USD")}
                  </span>
                  <span className={variationColor(isPositive)}>
                    {metal.changePercent24h.toFixed(2)}%
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
