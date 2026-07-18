"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";

export interface ChartPeriod {
  value: number;
  labelKey: TranslationKey;
}

interface PeriodSelectorProps {
  periods: ChartPeriod[];
  selected: number;
  onChange: (value: number) => void;
}

export function PeriodSelector({ periods, selected, onChange }: PeriodSelectorProps) {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((p) => (
        <Button
          key={p.value}
          variant={selected === p.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(p.value)}
          className="gap-1"
        >
          <span>{translate(p.labelKey)}</span>
        </Button>
      ))}
    </div>
  );
}
