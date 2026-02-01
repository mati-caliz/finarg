"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuotes } from "@/hooks/useQuotes";
import { useTranslation } from "@/hooks/useTranslation";
import { exchangeBandsApi } from "@/lib/api";
import type { ExchangeBands, Quote } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

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
    <div className="flex flex-col items-center py-8">
      <div className="relative w-full max-w-md aspect-[2/1]">
        <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-lg">
          <title>{translate("exchangeBands")}</title>
          <defs>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M 10 100 A 90 90 0 0 1 46.1 27.6"
            fill="none"
            stroke="url(#greenGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M 46.1 27.6 A 90 90 0 0 1 100 10"
            fill="none"
            stroke="url(#yellowGrad)"
            strokeWidth="20"
            opacity="0.9"
          />
          <path
            d="M 100 10 A 90 90 0 0 1 153.9 27.6"
            fill="none"
            stroke="url(#orangeGrad)"
            strokeWidth="20"
            opacity="0.9"
          />
          <path
            d="M 153.9 27.6 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="url(#redGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.9"
          />

          <g>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="25"
              stroke={zoneColor.primary}
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#glow)"
              transform={`rotate(${angle}, 100, 100)`}
              style={{
                transition: "transform 1s ease-out",
                transformOrigin: "100px 100px",
              }}
            />
            <polygon
              points="100,20 95,32 105,32"
              fill={zoneColor.primary}
              filter="url(#glow)"
              transform={`rotate(${angle}, 100, 100)`}
              style={{
                transition: "transform 1s ease-out",
                transformOrigin: "100px 100px",
              }}
            />
          </g>

          <circle cx="100" cy="100" r="12" fill="hsl(var(--background))" opacity="1" />
          <circle cx="100" cy="100" r="8" fill={zoneColor.primary} opacity="1">
            <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="100" r="5" fill="hsl(var(--background))" opacity="1" />
        </svg>

        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-background/80 backdrop-blur-sm border border-border">
          <p className="text-xs text-green-500 font-semibold">${floor.toLocaleString("es-AR")}</p>
        </div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/80 backdrop-blur-sm border border-border">
          <p className="text-xs text-muted-foreground font-semibold">
            ${middle.toLocaleString("es-AR")}
          </p>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-background/80 backdrop-blur-sm border border-border">
          <p className="text-xs text-red-500 font-semibold">${ceiling.toLocaleString("es-AR")}</p>
        </div>
      </div>

      <div className="mt-8 text-center space-y-4 w-full max-w-2xl">
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

function BandCalculator({ bands }: { bands: ExchangeBands | undefined }) {
  const { translate } = useTranslation();
  const [amount, setAmount] = useState<string>("1000");

  if (!bands) {
    return null;
  }

  const { floor, ceiling, middle } = bands;

  const amountNum = Number.parseFloat(amount) || 0;
  const atFloor = amountNum / floor;
  const atCeiling = amountNum / ceiling;
  const atMiddle = amountNum / ((floor + ceiling) / 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{translate("bandsCalculator")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="amount" className="text-sm text-muted-foreground mb-2 block">
            {translate("amountInPesos")}
          </label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000000"
            className="text-lg"
          />
        </div>

        {amountNum > 0 && (
          <div className="grid gap-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <span className="text-sm">
                {translate("bandsAtFloor")} (${floor})
              </span>
              <span className="font-semibold text-green-500">
                USD {atFloor.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="text-sm">
                {translate("bandsAtMiddle")} (${middle.toFixed(2)})
              </span>
              <span className="font-semibold text-blue-500">
                USD {atMiddle.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-sm">
                {translate("bandsAtCeiling")} (${ceiling})
              </span>
              <span className="font-semibold text-yellow-500">
                USD {atCeiling.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
    staleTime: 3600000,
  });

  const mayoristaQuote = quotes?.find((q) => q.type === "mayorista");

  if (quotesLoading || bandsLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{translate("exchangeBands")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{translate("bandsDescription")}</p>
      </div>

      <Card className="p-6">
        <SemicircleGauge quote={mayoristaQuote} bands={bandsData} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-1">
        <BandCalculator bands={bandsData} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{translate("bandsFloorAction")}</p>
                <p className="font-medium">{translate("bandsBCRABuys")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Minus className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{translate("bandsMiddleAction")}</p>
                <p className="font-medium">{translate("bandsNoIntervention")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{translate("bandsCeilingAction")}</p>
                <p className="font-medium">{translate("bandsBCRASells")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
