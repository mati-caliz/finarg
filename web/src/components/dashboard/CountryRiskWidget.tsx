"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { getRiskStyles } from "@/lib/constants";
import type { CountryRisk } from "@/types";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { memo } from "react";

const MAX_COUNTRY_RISK_DISPLAY = 2000;

interface CountryRiskWidgetProps {
  countryRisk: CountryRisk;
}

function getRiskLabel(value: number, translate: (key: TranslationKey) => string): string {
  if (value < 500) return translate("riskLow");
  if (value < 800) return translate("riskModerate");
  if (value < 1200) return translate("riskHigh");
  return translate("riskVeryHigh");
}

function getRiskBarColor(value: number): string {
  if (value < 500) return "bg-emerald-500";
  if (value < 800) return "bg-yellow-500";
  if (value < 1200) return "bg-orange-500";
  return "bg-red-500";
}

export const CountryRiskWidget = memo(function CountryRiskWidget({
  countryRisk,
}: CountryRiskWidgetProps) {
  const { translate } = useTranslation();
  const styles = getRiskStyles(countryRisk.value);

  return (
    <Card
      className={`shrink-0 border-t-[3px] ${styles.border} transition-all hover:shadow-lg ${styles.hoverBorder} cursor-pointer`}
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
            <p className={`text-3xl font-bold ${styles.text}`}>{countryRisk.value.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">{translate("basisPoints")}</p>
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${styles.bg}`}>
            <TrendingUp className={`h-5 w-5 ${styles.text}`} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{translate("riskLevel")}</span>
            <span className={`font-medium ${styles.text}`}>
              {getRiskLabel(countryRisk.value, translate)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getRiskBarColor(countryRisk.value)}`}
              style={{
                width: `${countryRisk.displayPercentage !== undefined && countryRisk.displayPercentage !== null ? countryRisk.displayPercentage : Math.min((countryRisk.value / MAX_COUNTRY_RISK_DISPLAY) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
