"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import type { Inflation } from "@/types";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";

interface InflationSummaryCardsProps {
  currentInflation: Inflation | undefined;
}

export function InflationSummaryCards({ currentInflation }: InflationSummaryCardsProps) {
  const { translate } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{translate("monthlyInflation")}</p>
              <p className="text-2xl font-bold text-foreground mt-1 min-h-[2rem] flex items-center">
                {currentInflation ? `${currentInflation.value.toFixed(1)}%` : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem] capitalize">
                {currentInflation?.date
                  ? new Date(currentInflation.date).toLocaleDateString("es-AR", {
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{translate("yearOverYear")}</p>
              <p className="text-2xl font-bold text-red-500 mt-1 min-h-[2rem] flex items-center">
                {currentInflation?.yearOverYear
                  ? `${currentInflation.yearOverYear.toFixed(1)}%`
                  : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                {translate("last12Months")}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg shrink-0">
              <BarChart3 className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{translate("yearToDate")}</p>
              <p className="text-2xl font-bold text-yellow-500 mt-1 min-h-[2rem] flex items-center">
                {currentInflation?.yearToDate ? `${currentInflation.yearToDate.toFixed(1)}%` : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                {translate("sinceJan")} {new Date().getFullYear()}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg shrink-0">
              <Calendar className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
