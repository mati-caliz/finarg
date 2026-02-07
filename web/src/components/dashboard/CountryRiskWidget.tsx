"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGovernments } from "@/hooks/useGovernments";
import { useTranslation } from "@/hooks/useTranslation";
import type { CountryRisk } from "@/types";
import { TrendingUp } from "lucide-react";

interface CountryRiskWidgetProps {
  countryRisk: CountryRisk;
}

export function CountryRiskWidget({ countryRisk }: CountryRiskWidgetProps) {
  const { translate } = useTranslation();
  const { data: governments = [] } = useGovernments("ar");

  const getRiskColor = (value: number) => {
    if (value < 500) {
      return "text-green-500";
    }
    if (value < 800) {
      return "text-yellow-500";
    }
    if (value < 1200) {
      return "text-orange-500";
    }
    return "text-red-500";
  };

  const currentGovernment = governments.find((gov) => {
    const riskDate = new Date(countryRisk.date);
    const startDate = new Date(gov.startDate);
    const endDate = new Date(gov.endDate);
    return riskDate >= startDate && riskDate <= endDate;
  });

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
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
          <TrendingUp className={`h-8 w-8 ${getRiskColor(countryRisk.value)}/50`} />
        </div>
        {currentGovernment && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentGovernment.color }}
              />
              <p className="text-sm text-muted-foreground">
                {translate("government")}:{" "}
                <span className="font-medium text-foreground">{currentGovernment.label}</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
