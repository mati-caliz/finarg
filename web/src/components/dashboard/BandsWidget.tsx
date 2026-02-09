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
  const { data: bands, isLoading } = useQuery({
    queryKey: ["exchangeBands"],
    queryFn: async () => {
      const response = await exchangeBandsApi.getCurrent();
      return response.data as ExchangeBands;
    },
    staleTime: 86400000,
    gcTime: 86400000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading || !bands) {
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
      bg: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-t-emerald-400",
      hoverBorder: "hover:border-t-emerald-300",
      indicator: "bg-emerald-500",
    },
    yellow: {
      bg: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-t-amber-400",
      hoverBorder: "hover:border-t-amber-300",
      indicator: "bg-amber-500",
    },
    red: {
      bg: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      border: "border-t-red-400",
      hoverBorder: "hover:border-t-red-300",
      indicator: "bg-red-500",
    },
  };

  const colors = colorClasses[zoneColor];

  if (!oficialQuote) {
    return null;
  }

  return (
    <Link href="/bandas-cambiarias" className="block h-full">
      <Card
        className={`h-full border-t-[3px] ${colors.border} ${colors.hoverBorder} transition-all hover:shadow-lg cursor-pointer`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${colors.indicator}`} />
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
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-emerald-400 to-red-400 opacity-60" />

              <div
                className={`absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded-full ${colors.indicator} shadow-md transition-all duration-500`}
                style={{ left: `calc(${clampedPosition}% - 2px)` }}
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
