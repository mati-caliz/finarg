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
    <Card className={`flex-1 border-t-[3px] ${getRiskBorderColor(countryRisk.value)}`}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          {translate("countryRisk")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0 pb-6">
        <div className="flex items-end justify-between">
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
      </CardContent>
    </Card>
  );
});
