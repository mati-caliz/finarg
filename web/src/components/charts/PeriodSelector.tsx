"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { Crown } from "lucide-react";

export interface ChartPeriod {
  value: number;
  labelKey: TranslationKey;
  premium: boolean;
}

interface PeriodSelectorProps {
  periods: ChartPeriod[];
  selected: number;
  onChange: (value: number) => void;
  isPremium: boolean;
  onPremiumClick: () => void;
}

export function PeriodSelector({
  periods,
  selected,
  onChange,
  isPremium,
  onPremiumClick,
}: PeriodSelectorProps) {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((p) => {
        const isLocked = p.premium && !isPremium;
        return (
          <Button
            key={p.value}
            variant={selected === p.value ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (isLocked) {
                onPremiumClick();
              } else {
                onChange(p.value);
              }
            }}
            className="gap-1"
          >
            <span>{translate(p.labelKey)}</span>
            {isLocked && <Crown className="h-3 w-3 text-yellow-600 dark:text-yellow-500" />}
          </Button>
        );
      })}
    </div>
  );
}
