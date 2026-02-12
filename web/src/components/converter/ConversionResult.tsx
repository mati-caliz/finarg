"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrencySimple } from "@/lib/utils";
import type { CurrencyConversionResponse } from "@/types";
import { ArrowRight, BadgePercent, Calculator, TrendingUp } from "lucide-react";
import { memo } from "react";

interface ConversionResultProps {
  result: CurrencyConversionResponse;
}

export const ConversionResult = memo(({ result }: ConversionResultProps) => {
  const { translate } = useTranslation();

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calculator className="h-5 w-5" />
          {translate("conversionResult")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-4 rounded-lg bg-muted/50 p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{translate("fromCurrency")}</p>
            <p className="text-2xl font-bold">
              {formatCurrencySimple(result.fromAmount)}{" "}
              <span className="text-lg">{result.fromCurrency.toUpperCase()}</span>
            </p>
          </div>
          <ArrowRight className="h-8 w-8 text-primary" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{translate("toCurrency")}</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrencySimple(result.toAmount)}{" "}
              <span className="text-xl">{result.toCurrency.toUpperCase()}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              {translate("conversionRate")}
            </div>
            <p className="text-lg font-semibold font-mono">
              1 {result.fromCurrency.toUpperCase()} ={" "}
              {formatCurrencySimple(result.conversionRate.rate)} {result.toCurrency.toUpperCase()}
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                {translate("priceType")}: {result.conversionRate.fromPriceType} →{" "}
                {result.conversionRate.toPriceType}
              </p>
              {result.conversionRate.intermediaryCurrency && (
                <p>
                  {translate("triangulatedConversion")} via{" "}
                  {result.conversionRate.intermediaryCurrency}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BadgePercent className="h-4 w-4" />
              {translate("conversionDetails")}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{translate("totalSpread")}:</span>
                <span className="font-medium font-mono">
                  {result.metadata.totalSpreadPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{translate("estimatedCommission")}:</span>
                <span className="font-medium font-mono">
                  {result.metadata.estimatedCommission.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="text-muted-foreground">
                  {translate("effectiveConversionRate")}:
                </span>
                <span className="font-semibold font-mono">
                  {formatCurrencySimple(result.metadata.effectiveRate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ConversionResult.displayName = "ConversionResult";
