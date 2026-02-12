"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrencySimple } from "@/lib/utils";
import type { ConversionHistory } from "@/types";
import { ArrowRight, RotateCcw } from "lucide-react";
import { memo } from "react";

interface ConversionHistoryCardProps {
  conversion: ConversionHistory;
  onReplay: (conversion: ConversionHistory) => void;
}

export const ConversionHistoryCard = memo(
  ({ conversion, onReplay }: ConversionHistoryCardProps) => {
    const { translate } = useTranslation();

    const formatTimeAgo = (timestamp: string) => {
      const now = new Date();
      const past = new Date(timestamp);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "menos de un minuto";
      if (diffMins === 1) return "1 minuto";
      if (diffMins < 60) return `${diffMins} minutos`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return "1 hora";
      if (diffHours < 24) return `${diffHours} horas`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "1 día";
      return `${diffDays} días`;
    };

    return (
      <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatCurrencySimple(conversion.fromAmount)}{" "}
                    {conversion.fromCurrency.toUpperCase()}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-bold text-primary">
                    {formatCurrencySimple(conversion.toAmount)}{" "}
                    {conversion.toCurrency.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    1 {conversion.fromCurrency.toUpperCase()} ={" "}
                    {formatCurrencySimple(conversion.conversionRate.rate)}{" "}
                    {conversion.toCurrency.toUpperCase()}
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(conversion.timestamp)}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onReplay(conversion)}
              className="ml-3 flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              title={translate("replayConversion")}
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  },
);

ConversionHistoryCard.displayName = "ConversionHistoryCard";
