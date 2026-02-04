"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { getGapClass, getGapColor } from "@/lib/utils";
import type { Gap } from "@/types";

export interface GapGaugeProps {
  gap: Gap;
}

export function GapGauge({ gap }: GapGaugeProps) {
  const { translate } = useTranslation();
  const color = getGapColor(gap.level);
  const animationClass = getGapClass(gap.level);

  const getGapLabel = () => {
    switch (gap.level) {
      case "LOW":
        return translate("lowGap");
      case "MEDIUM":
        return translate("mediumGap");
      case "HIGH":
        return translate("highGap");
      default:
        return "";
    }
  };

  const getGapDescription = () => {
    switch (gap.level) {
      case "LOW":
        return translate("stableMarket");
      case "MEDIUM":
        return translate("moderateVolatility");
      case "HIGH":
        return translate("highVolatility");
      default:
        return gap.description;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {translate("gapIndicator")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div
              className={`w-20 h-20 rounded-full ${animationClass}`}
              style={{ backgroundColor: color }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{gap.gapPercentage.toFixed(1)}%</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold" style={{ color }}>
              {getGapLabel()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{getGapDescription()}</p>
          </div>

          <div className="w-full mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{translate("official")}</span>
              <span>${gap.officialRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">{translate("parallel")}</span>
              <span>${gap.parallelRate.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
