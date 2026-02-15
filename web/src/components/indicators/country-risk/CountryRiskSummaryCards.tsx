"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import type { CountryRisk } from "@/types";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface CountryRiskSummaryCardsProps {
  currentRisk: CountryRisk | undefined;
  variation: number;
  isLoadingCurrent: boolean;
  isLoadingHistory: boolean;
}

export function CountryRiskSummaryCards({
  currentRisk,
  variation,
  isLoadingCurrent,
  isLoadingHistory,
}: CountryRiskSummaryCardsProps) {
  const { translate } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{translate("currentCountryRisk")}</p>
              <div className="text-2xl font-bold text-foreground mt-1 min-h-[2rem] flex items-center">
                {isLoadingCurrent ? (
                  <Skeleton className="h-8 w-24" />
                ) : currentRisk ? (
                  `${Number(currentRisk.value).toFixed(0)} ${Math.abs(Number(currentRisk.value)) === 1 ? translate("basisPoint") : translate("basisPoints")}`
                ) : (
                  "-"
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                {currentRisk?.date
                  ? new Date(currentRisk.date).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{translate("dailyVariation")}</p>
              <div
                className={`text-2xl font-bold mt-1 min-h-[2rem] flex items-center ${
                  variation > 0
                    ? "text-red-500"
                    : variation < 0
                      ? "text-green-500"
                      : "text-foreground"
                }`}
              >
                {isLoadingHistory ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    {variation > 0 && "+"}
                    {variation.toFixed(0)}{" "}
                    {Math.abs(variation) === 1 ? translate("basisPoint") : translate("basisPoints")}
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                {translate("vsYesterday")}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg shrink-0 ${
                variation > 0 ? "bg-red-500/10" : variation < 0 ? "bg-green-500/10" : "bg-muted/10"
              }`}
            >
              <TrendingUp
                className={`h-6 w-6 ${
                  variation > 0
                    ? "text-red-500"
                    : variation < 0
                      ? "text-green-500"
                      : "text-muted-foreground"
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
