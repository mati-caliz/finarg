"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { formatReservesUSD } from "@/lib/utils";
import type { Reserves } from "@/types";
import { Building2, Landmark, TrendingDown, TrendingUp } from "lucide-react";

interface ReservesCurrentDataProps {
  reserves: Reserves | undefined;
  isLoading: boolean;
}

function getTrendIcon(trend: string) {
  switch (trend?.toUpperCase()) {
    case "RISING":
    case "SUBIENDO":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "FALLING":
    case "BAJANDO":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
}

function getTrendColor(trend: string) {
  switch (trend?.toUpperCase()) {
    case "RISING":
    case "SUBIENDO":
      return "text-green-500";
    case "FALLING":
    case "BAJANDO":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

export function ReservesCurrentData({ reserves, isLoading }: ReservesCurrentDataProps) {
  const { translate } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 4 }, (_, i) => `reserves-skeleton-${i}`).map((key) => (
          <Card key={key} className="bg-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {translate("grossReserves")} · {translate("netReservesByMethodology")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{translate("grossReserves")}</p>
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {reserves ? formatReservesUSD(reserves.grossReserves) : "-"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {reserves && getTrendIcon(reserves.trend)}
                <span className={`text-sm ${reserves ? getTrendColor(reserves.trend) : ""}`}>
                  {reserves && reserves.dailyVariation !== null
                    ? `${reserves.dailyVariation >= 0 ? "+" : ""}${reserves.dailyVariation.toLocaleString("es-AR", { maximumFractionDigits: 0 })} M`
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-green-500/50 ring-1 ring-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{translate("netReservesBCRA")}</p>
                <Building2 className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">
                {reserves &&
                reserves.netReservesBCRA !== undefined &&
                reserves.netReservesBCRA !== null
                  ? formatReservesUSD(reserves.netReservesBCRA)
                  : reserves
                    ? formatReservesUSD(reserves.netReserves)
                    : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{translate("methodologyBCRA")}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-amber-500/50 ring-1 ring-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{translate("netReservesFMI")}</p>
                <Building2 className="h-5 w-5 text-amber-500" />
              </div>
              <p
                className={`text-2xl font-bold ${
                  reserves &&
                  reserves.netReservesFMI !== undefined &&
                  reserves.netReservesFMI !== null &&
                  reserves.netReservesFMI < 0
                    ? "text-red-500"
                    : "text-amber-600"
                }`}
              >
                {reserves &&
                reserves.netReservesFMI !== undefined &&
                reserves.netReservesFMI !== null
                  ? (reserves.netReservesFMI < 0 ? "\u2212" : "") +
                    formatReservesUSD(Math.abs(reserves.netReservesFMI))
                  : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{translate("methodologyFMI")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {(reserves?.liabilitiesBCRA?.length ?? 0) > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="inline-block w-1 h-4 rounded bg-green-500" />
            {translate("liabilitiesBCRA")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            {reserves?.liabilitiesBCRA?.map((liability) => (
              <div
                key={liability.id}
                className="flex flex-col gap-1 p-3 rounded-md bg-background/80 border border-border"
              >
                <p className="text-xs text-muted-foreground">{liability.name}</p>
                <p className="text-lg font-semibold text-foreground">
                  {"\u2212"}
                  {formatReservesUSD(liability.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(reserves?.liabilitiesFMI?.length ?? 0) > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="inline-block w-1 h-4 rounded bg-amber-500" />
            {translate("liabilitiesFMI")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            {reserves?.liabilitiesFMI?.map((liability) => (
              <div
                key={liability.id}
                className="flex flex-col gap-1 p-3 rounded-md bg-background/80 border border-border"
              >
                <p className="text-xs text-muted-foreground">{liability.name}</p>
                <p className="text-lg font-semibold text-foreground">
                  {"\u2212"}
                  {formatReservesUSD(liability.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
