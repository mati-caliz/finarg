"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CountryCode } from "@/config/countries";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { formatCurrencySimple } from "@/lib/utils";
import type { Quote } from "@/types";

interface QuotesComparisonTableProps {
  quotes: Quote[] | undefined;
  isLoading: boolean;
  skeletonCount: number;
  selectedCountry: CountryCode;
}

export function QuotesComparisonTable({
  quotes,
  isLoading,
  skeletonCount,
  selectedCountry,
}: QuotesComparisonTableProps) {
  const { translate } = useTranslation();

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">{translate("quotesComparison")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: skeletonCount }, (_, i) => i).map((index) => (
              <div key={`comparison-skeleton-${index}`} className="flex gap-4 py-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20 ml-auto" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : !quotes || quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">{translate("noQuotesAvailable")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    {translate("type")}
                  </th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                    {translate("buy")}
                  </th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                    {translate("sell")}
                  </th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                    {translate("spread")}
                  </th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                    {translate("variation")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.type} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">
                        {translate(quote.type as TranslationKey)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-foreground">
                      {formatCurrencySimple(quote.buy, selectedCountry)}
                    </td>
                    <td className="text-right py-3 px-4 text-foreground">
                      {formatCurrencySimple(quote.sell, selectedCountry)}
                    </td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      {formatCurrencySimple(quote.spread, selectedCountry)}
                    </td>
                    <td
                      className={`text-right py-3 px-4 ${
                        quote.variation >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {quote.variation >= 0 ? "+" : ""}
                      {quote.variation.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
