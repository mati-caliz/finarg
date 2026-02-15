"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { getGapClass, getGapColor } from "@/lib/utils";
import type { Gap } from "@/types";
import { Activity } from "lucide-react";
import { memo } from "react";

export interface GapGaugeProps {
  gap: Gap;
}

function formatValue(value: number | null, decimals: number): string {
  return value === null ? "-" : value.toFixed(decimals);
}

const GAP_LABEL_KEYS: Record<string, TranslationKey> = {
  LOW: "lowGap",
  MEDIUM: "mediumGap",
  HIGH: "highGap",
};

const GAP_DESCRIPTION_KEYS: Record<string, TranslationKey> = {
  LOW: "stableMarket",
  MEDIUM: "moderateVolatility",
  HIGH: "highVolatility",
};

const GAP_BORDER_COLORS: Record<string, string> = {
  LOW: "border-t-emerald-500",
  MEDIUM: "border-t-yellow-500",
  HIGH: "border-t-red-500",
};

export const GapGauge = memo(function GapGauge({ gap }: GapGaugeProps) {
  const { translate } = useTranslation();
  const color = getGapColor(gap.level);
  const animationClass = getGapClass(gap.level);
  const gapPercentage = Number.isFinite(gap.gapPercentage) ? gap.gapPercentage : null;
  const officialRate = Number.isFinite(gap.officialRate) ? gap.officialRate : null;
  const parallelRate = Number.isFinite(gap.parallelRate) ? gap.parallelRate : null;

  const gapLabel = GAP_LABEL_KEYS[gap.level] ? translate(GAP_LABEL_KEYS[gap.level]) : "";
  const gapDescription = GAP_DESCRIPTION_KEYS[gap.level]
    ? translate(GAP_DESCRIPTION_KEYS[gap.level])
    : gap.description;
  const borderColor = GAP_BORDER_COLORS[gap.level] ?? "border-t-slate-400";

  return (
    <Card className={`border-t-[3px] ${borderColor}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" />
          {translate("gapIndicator")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div
              className={`w-24 h-24 rounded-full ${animationClass} flex items-center justify-center`}
              style={{ backgroundColor: color }}
            >
              <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color }}>
                  {formatValue(gapPercentage, 1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold" style={{ color }}>
              {gapLabel}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{gapDescription}</p>
          </div>

          <div className="w-full mt-4 pt-4 border-t border-border/50 space-y-2">
            <div className="flex justify-between items-center text-sm px-2 py-1.5 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">{translate("official")}</span>
              <span className="font-medium">${formatValue(officialRate, 2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm px-2 py-1.5 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">{translate("parallel")}</span>
              <span className="font-medium">${formatValue(parallelRate, 2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
