"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VariationBadge } from "@/components/ui/variation-badge";
import { useTranslation } from "@/hooks/useTranslation";
import { formatReservesUSD } from "@/lib/utils";
import type { Reserves } from "@/types";
import { Landmark } from "lucide-react";
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
              <VariationBadge
                variation={reserves.dailyVariation || 0}
                format="absolute"
                decimals={0}
                showSign={true}
              />
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
