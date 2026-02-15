"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocialIndicators } from "@/hooks/useSocialIndicators";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { formatCurrency, formatCurrencyNoDecimals } from "@/lib/utils";
import { useAppStore } from "@/store/useStore";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface IndicatorItem {
  key: TranslationKey;
  value: number | undefined | null;
  format: "noDecimals" | "currency" | "custom";
  customFormat?: (v: number) => string;
}

const CER_FORMAT = (v: number) =>
  v.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

export function SocialIndicatorsCard() {
  const { translate } = useTranslation();
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const { data: socialIndicators } = useSocialIndicators(selectedCountry);

  if (!socialIndicators) return null;

  const indicators: IndicatorItem[] = [
    { key: "minimumSalary", value: socialIndicators.minimumSalary, format: "noDecimals" },
    { key: "minimumPension", value: socialIndicators.minimumPension, format: "noDecimals" },
    { key: "canastaBasicaTotal", value: socialIndicators.totalBasicBasket, format: "noDecimals" },
    {
      key: "canastaBasicaAlimentaria",
      value: socialIndicators.foodBasicBasket,
      format: "noDecimals",
    },
    { key: "salarioRipte", value: socialIndicators.ripteSalary, format: "noDecimals" },
    { key: "uva", value: socialIndicators.uva, format: "currency" },
    { key: "cer", value: socialIndicators.cer, format: "custom", customFormat: CER_FORMAT },
  ];

  const visibleIndicators = indicators.filter((i) => i.value !== undefined && i.value !== null);

  if (visibleIndicators.length === 0) return null;

  const formatValue = (item: IndicatorItem) => {
    const v = item.value as number;
    if (item.format === "noDecimals") return formatCurrencyNoDecimals(v);
    if (item.format === "currency") return formatCurrency(v);
    if (item.format === "custom" && item.customFormat) return item.customFormat(v);
    return String(v);
  };

  return (
    <Card className="shrink-0 border-t-[3px] border-t-indigo-400 min-h-[380px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {translate("socialIndicators")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {visibleIndicators.map((item) => (
            <div key={item.key} className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">{translate(item.key)}</p>
              <p className="text-lg font-semibold text-foreground">{formatValue(item)}</p>
            </div>
          ))}
        </div>
        <Link
          href="/calculadora-sueldo-neto"
          className="inline-flex items-center gap-1 text-sm text-success-accessible hover:underline mt-4"
        >
          {translate("incomeTaxCalculator")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
