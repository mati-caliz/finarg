"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatReservesUSD } from "@/lib/utils";
import type { Reserves } from "@/types";
import { Landmark, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { memo } from "react";

interface ReservesWidgetProps {
  reserves: Reserves;
  label?: string;
}

export const ReservesWidget = memo(function ReservesWidget({
  reserves,
  label,
}: ReservesWidgetProps) {
  const { translate } = useTranslation();
  const variation = reserves.dailyVariation || 0;
  const isPositive = variation > 0;
  const isNegative = variation < 0;

  return (
    <Card className="h-full border-t-[3px] border-t-cyan-500 transition-all hover:shadow-lg hover:border-cyan-400 cursor-pointer">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Landmark className="h-3.5 w-3.5" />
          {label || translate("bcraReserves")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">{translate("grossMillionsUsd")}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold tracking-tight">
                {formatReservesUSD(reserves.grossReserves)}
              </p>
              <div
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                  isPositive
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15"
                    : isNegative
                      ? "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/15"
                      : "text-muted-foreground bg-muted"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : isNegative ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
                <span className="text-xs font-medium">
                  {variation > 0 ? "+" : ""}
                  {variation.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-3">
            {reserves.netReservesBCRA !== undefined && reserves.netReservesBCRA !== null && (
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{translate("netBcra")}</p>
                <p
                  className={`text-lg font-semibold ${
                    reserves.netReservesBCRA < 0 ? "text-red-500" : "text-emerald-500"
                  }`}
                >
                  {formatReservesUSD(reserves.netReservesBCRA)}
                </p>
              </div>
            )}
            {reserves.netReservesFMI !== undefined && reserves.netReservesFMI !== null && (
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{translate("netFmi")}</p>
                <p
                  className={`text-lg font-semibold ${
                    reserves.netReservesFMI < 0 ? "text-red-500" : "text-amber-600"
                  }`}
                >
                  {reserves.netReservesFMI < 0 ? "\u2212" : ""}
                  {formatReservesUSD(Math.abs(reserves.netReservesFMI))}
                </p>
              </div>
            )}
            {(reserves.netReservesBCRA === undefined || reserves.netReservesBCRA === null) &&
              (reserves.netReservesFMI === undefined || reserves.netReservesFMI === null) && (
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{translate("netEstimated")}</p>
                  <p
                    className={`text-lg font-semibold ${
                      reserves.netReserves < 0 ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {formatReservesUSD(reserves.netReserves)}
                  </p>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
