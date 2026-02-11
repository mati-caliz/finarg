"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useQuotes } from "@/hooks/useQuotes";
import { useTranslation } from "@/hooks/useTranslation";
import { exchangeBandsApi } from "@/lib/api";
import type { ExchangeBands, Quote } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, Minus, TrendingDown, TrendingUp } from "lucide-react";

function SemicircleGauge({
  quote,
  bands,
}: {
  quote: Quote | undefined;
  bands: ExchangeBands | undefined;
}) {
  const { translate } = useTranslation();

  if (!bands) {
    return null;
  }

  const currentValue = quote?.sell ?? 0;
  const { floor, ceiling, middle } = bands;
  const range = ceiling - floor;
  const position = range > 0 ? ((currentValue - floor) / range) * 100 : 50;
  const clampedPosition = Math.max(0, Math.min(100, position));

  const angle = -90 + (clampedPosition / 100) * 180;

  const getZoneColor = () => {
    if (position <= 20) {
      return { primary: "#22c55e", secondary: "#86efac" };
    }
    if (position <= 50) {
      return { primary: "#eab308", secondary: "#fde047" };
    }
    if (position <= 80) {
      return { primary: "#f97316", secondary: "#fb923c" };
    }
    return { primary: "#ef4444", secondary: "#f87171" };
  };

  const zoneColor = getZoneColor();

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative w-full max-w-md mx-auto px-4">
        <svg
          viewBox="0 0 200 110"
          className="w-full h-auto drop-shadow-lg"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <title>{translate("exchangeBands")}</title>
          <defs>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          <path
            d="M 10 100 A 90 90 0 0 1 36.36 36.36"
            fill="none"
            stroke="url(#greenGrad)"
            strokeWidth="22"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 36.36 36.36 A 90 90 0 0 1 100 10"
            fill="none"
            stroke="url(#yellowGrad)"
            strokeWidth="22"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 100 10 A 90 90 0 0 1 163.64 36.36"
            fill="none"
            stroke="url(#orangeGrad)"
            strokeWidth="22"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 163.64 36.36 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="url(#redGrad)"
            strokeWidth="22"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />

          <line
            x1="100"
            y1="100"
            x2="100"
            y2="25"
            stroke={zoneColor.primary}
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${angle}, 100, 100)`}
          />
          <polygon
            points="100,20 95,30 105,30"
            fill={zoneColor.primary}
            transform={`rotate(${angle}, 100, 100)`}
          />

          <circle cx="100" cy="100" r="12" fill="hsl(var(--background))" />
          <circle cx="100" cy="100" r="8" fill={zoneColor.primary} />
          <circle cx="100" cy="100" r="4" fill="hsl(var(--background))" />
        </svg>

        <div className="absolute bottom-0 left-0 px-3 py-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border shadow-sm">
          <p className="text-xs text-green-600 font-semibold">
            ${floor.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border shadow-sm">
          <p className="text-xs text-muted-foreground font-semibold">
            ${middle.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <div className="absolute bottom-0 right-0 px-3 py-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border shadow-sm">
          <p className="text-xs text-red-600 font-semibold">
            ${ceiling.toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>

      <div className="mt-6 text-center space-y-3 w-full max-w-md">
        <div
          className="relative overflow-hidden rounded-xl border-2 shadow-lg transition-all duration-300 hover:scale-105"
          style={{
            borderColor: zoneColor.primary,
            background: `linear-gradient(135deg, ${zoneColor.primary}10, ${zoneColor.primary}05)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          <div className="relative px-8 py-4">
            <p className="text-sm text-muted-foreground mb-1">{translate("wholesaleDollar")}</p>
            <p
              className="text-4xl font-bold transition-colors duration-300"
              style={{ color: zoneColor.primary }}
            >
              $
              {currentValue.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border-2 shadow-lg transition-all duration-300"
          style={{
            borderColor: zoneColor.primary,
            background: `linear-gradient(135deg, ${zoneColor.primary}10, ${zoneColor.primary}05)`,
          }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
            style={{ animationDelay: "1s" }}
          />
          <div className="relative px-8 py-3">
            <p
              className="text-lg font-semibold transition-colors duration-300"
              style={{ color: zoneColor.primary }}
            >
              {translate("bandsPositionText").replace("{percent}", clampedPosition.toFixed(2))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BandsPage() {
  const { translate } = useTranslation();
  const { data: quotes, isLoading: quotesLoading } = useQuotes();
  const { data: bandsData, isLoading: bandsLoading } = useQuery({
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

  const mayoristaQuote =
    quotes?.find((q) => q.type === "mayorista") || quotes?.find((q) => q.type === "oficial");

  if (quotesLoading || bandsLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bandsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{translate("exchangeBands")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{translate("bandsDescription")}</p>
        </div>
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{translate("bandsDataUnavailable")}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{translate("exchangeBands")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{translate("bandsDescription")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        <Card className="p-6">
          <SemicircleGauge quote={mayoristaQuote} bands={bandsData} />
        </Card>

        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{translate("bandsFloorAction")}</p>
                  <p className="text-sm text-muted-foreground">
                    Cuando el dólar toca el piso de ${bandsData?.floor.toFixed(2).replace(".", ",")}
                    , el BCRA compra dólares para sostener el precio y evitar que baje más.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Minus className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{translate("bandsMiddleAction")}</p>
                  <p className="text-sm text-muted-foreground">
                    En la zona media, el mercado opera libremente sin intervención del Banco
                    Central.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{translate("bandsCeilingAction")}</p>
                  <p className="text-sm text-muted-foreground">
                    Cuando el dólar alcanza el techo de $
                    {bandsData?.ceiling.toFixed(2).replace(".", ",")}, el BCRA vende dólares para
                    frenar la suba y controlar la inflación.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">{translate("bandsDisclaimer")}</p>
              <p>{translate("bandsDisclaimerText")}</p>
              {bandsData && (
                <p className="mt-2">
                  {translate("bandsCrawlingPeg")}: {(bandsData.crawlingPegMonthly * 100).toFixed(1)}
                  % {translate("bandsMonthly")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
