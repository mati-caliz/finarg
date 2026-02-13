"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGovernments } from "@/hooks/useGovernments";
import { useTranslation } from "@/hooks/useTranslation";
import type { CountryRisk } from "@/types";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { memo } from "react";

interface CountryRiskWidgetProps {
  countryRisk: CountryRisk;
}

export const CountryRiskWidget = memo(function CountryRiskWidget({
  countryRisk,
}: CountryRiskWidgetProps) {
  const { translate } = useTranslation();
  const { data: governments = [] } = useGovernments("ar");

  const getRiskColor = (value: number) => {
    if (value < 500) {
      return "text-success-accessible";
    }
    if (value < 800) {
      return "text-warning-accessible";
    }
    if (value < 1200) {
      return "text-orange-600";
    }
    return "text-destructive-accessible";
  };

  const getRiskBorderColor = (value: number) => {
    if (value < 500) {
      return "border-t-emerald-500";
    }
    if (value < 800) {
      return "border-t-yellow-500";
    }
    if (value < 1200) {
      return "border-t-orange-500";
    }
    return "border-t-red-500";
  };

  const getRiskBgColor = (value: number) => {
    if (value < 500) {
      return "bg-emerald-100 dark:bg-emerald-500/15";
    }
    if (value < 800) {
      return "bg-yellow-100 dark:bg-yellow-500/15";
    }
    if (value < 1200) {
      return "bg-orange-100 dark:bg-orange-500/15";
    }
    return "bg-red-100 dark:bg-red-500/15";
  };
  governments.find((gov) => {
    const riskDate = new Date(countryRisk.date);
    const startDate = new Date(gov.startDate);
    const endDate = new Date(gov.endDate);
    return riskDate >= startDate && riskDate <= endDate;
  });

  return (
    <Card
      className={`shrink-0 border-t-[3px] ${getRiskBorderColor(countryRisk.value)} transition-all hover:shadow-lg cursor-pointer`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          {translate("countryRisk")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className={`text-3xl font-bold ${getRiskColor(countryRisk.value)}`}>
              {countryRisk.value.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{translate("basisPoints")}</p>
          </div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${getRiskBgColor(countryRisk.value)}`}
          >
            <TrendingUp className={`h-5 w-5 ${getRiskColor(countryRisk.value)}`} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Nivel de riesgo:</span>
            <span className={`font-medium ${getRiskColor(countryRisk.value)}`}>
              {countryRisk.value < 500
                ? "Bajo"
                : countryRisk.value < 800
                  ? "Moderado"
                  : countryRisk.value < 1200
                    ? "Alto"
                    : "Muy Alto"}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                countryRisk.value < 500
                  ? "bg-emerald-500"
                  : countryRisk.value < 800
                    ? "bg-yellow-500"
                    : countryRisk.value < 1200
                      ? "bg-orange-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${Math.min((countryRisk.value / 2000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
