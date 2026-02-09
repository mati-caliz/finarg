"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { exchangeBandsApi } from "@/lib/api";
import type { ExchangeBands, Quote } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface BandsWidgetProps {
  oficialQuote: Quote | undefined;
}

export function BandsWidget({ oficialQuote }: BandsWidgetProps) {
  const { translate } = useTranslation();
  const { data: bands } = useQuery({
    queryKey: ["exchangeBands"],
    queryFn: async () => {
      const response = await exchangeBandsApi.getCurrent();
      return response.data as ExchangeBands;
    },
    staleTime: 3600000,
  });

  if (!bands) {
    return null;
  }

  const currentValue = oficialQuote?.sell ?? 0;
  const { floor, ceiling } = bands;
  const range = ceiling - floor;
  const position = range > 0 ? ((currentValue - floor) / range) * 100 : 50;
  const clampedPosition = Math.max(0, Math.min(100, position));

  const getZoneColor = () => {
    if (position < 0 || position > 100) {
      return "red";
    }
    if (position <= 20 || position >= 80) {
      return "yellow";
    }
    return "green";
  };

  const getZoneLabel = () => {
    if (position < 0) {
      return translate("bandsBelowFloor");
    }
    if (position > 100) {
      return translate("bandsAboveCeiling");
    }
    if (position <= 20) {
      return translate("bandsNearFloor");
    }
    if (position >= 80) {
      return translate("bandsNearCeiling");
    }
    return translate("bandsNeutralZone");
  };

  const zoneColor = getZoneColor();
  const zoneLabel = getZoneLabel();

  const colorClasses = {
    green: {
      bg: "bg-green-600",
      text: "text-success-accessible",
      border: "border-green-500/50",
      light: "bg-green-500/20",
    },
    yellow: {
      bg: "bg-amber-600",
      text: "text-warning-accessible",
      border: "border-amber-500/50",
      light: "bg-amber-500/20",
    },
    red: {
      bg: "bg-red-600",
      text: "text-destructive-accessible",
      border: "border-red-500/50",
      light: "bg-red-500/20",
    },
  };

  const colors = colorClasses[zoneColor];

  if (!oficialQuote) {
    return null;
  }

  return (
    <Link href="/bandas-cambiarias" className="block h-full">
      <Card
        className={`h-full ${colors.border} ${colors.light} transition-all hover:shadow-lg cursor-pointer`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${colors.bg} animate-pulse`} />
            {translate("exchangeBands")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{translate("currentRate")}</p>
              <p className="text-2xl font-bold">${currentValue.toLocaleString("es-AR")}</p>
            </div>
            <div className={`text-right ${colors.text}`}>
              <p className="text-xs font-medium">{zoneLabel}</p>
              <p className="text-sm">
                {position < 0 || position > 100 ? (
                  <span className="font-bold">{translate("bandsIntervention")}</span>
                ) : (
                  `${clampedPosition.toFixed(0)}% ${translate("bandsOfRange")}`
                )}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-green-400 to-green-500 opacity-30"
                style={{ width: "20%" }}
              />
              <div
                className="absolute inset-y-0 left-[20%] bg-gradient-to-r from-yellow-500/30 via-transparent to-yellow-500/30"
                style={{ width: "60%" }}
              />
              <div
                className="absolute inset-y-0 right-0 bg-gradient-to-r from-green-500 via-green-400 to-green-500 opacity-30"
                style={{ width: "20%" }}
              />

              <div
                className={`absolute top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full ${colors.bg} shadow-lg transition-all duration-500`}
                style={{ left: `calc(${clampedPosition}% - 3px)` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <div className="text-left">
                <p className="font-medium">{translate("bandsFloor")}</p>
                <p>${floor.toLocaleString("es-AR")}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{translate("bandsMiddle")}</p>
                <p>${((floor + ceiling) / 2).toLocaleString("es-AR")}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{translate("bandsCeiling")}</p>
                <p>${ceiling.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {translate("bandsCrawlingPeg")}: {(bands.crawlingPegMonthly * 100).toFixed(1)}%{" "}
              {translate("bandsMonthly")}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
