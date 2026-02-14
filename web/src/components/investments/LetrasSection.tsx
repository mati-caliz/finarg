"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VariationBadge } from "@/components/ui/variation-badge";
import { useLetras } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { variationColor } from "@/lib/constants";
import { formatNumber, formatPrice } from "@/lib/utils";
import type { Letra } from "@/types";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";

const GRID_CLASS = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

export function LetrasSection() {
  const { translate } = useTranslation();
  const { data: letras, isLoading, error } = useLetras();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={letras === null || letras === undefined || letras.length === 0}
      gridClassName={GRID_CLASS}
      skeletonCount={6}
      skeletonHeight="h-40"
    >
      {letras?.map((letra: Letra) => (
        <Card key={letra.ticker} className="border-t-[3px] border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{letra.ticker}</span>
              <VariationBadge variation={letra.changePercent} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground truncate">{letra.name}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{translate("price")}</p>
                  <p className="text-xl font-bold">{formatPrice(letra.price, letra.currency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{translate("volume")}</p>
                  <p className="text-sm font-medium">{formatNumber(letra.volume, 0)}</p>
                </div>
              </div>
              <div className="pt-2 border-t flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{translate("change")}</p>
                  <p className={`text-sm font-medium ${variationColor(letra.change >= 0)}`}>
                    {letra.change >= 0 ? "+" : ""}
                    {formatPrice(letra.change, letra.currency)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </InvestmentSectionWrapper>
  );
}
