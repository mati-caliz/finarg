"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VariationBadge } from "@/components/ui/variation-badge";
import { useCauciones } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { INVESTMENT_GRID } from "@/lib/constants";
import { formatPercent } from "@/lib/utils";
import type { Caucion } from "@/types";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";

export function CaucionesSection() {
  const { translate } = useTranslation();
  const { data: cauciones, isLoading, error } = useCauciones();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={cauciones === null || cauciones === undefined || cauciones.length === 0}
      gridClassName={INVESTMENT_GRID.THREE_COL}
      skeletonCount={6}
      skeletonHeight="h-40"
    >
      {cauciones?.map((caucion: Caucion) => (
        <Card key={caucion.ticker} className="border-t-[3px] border-t-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{caucion.ticker}</span>
              <VariationBadge variation={caucion.changePercent} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {caucion.days} {caucion.days === 1 ? translate("day") : translate("days")}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{translate("tnaRate")}</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPercent(caucion.rate)}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{translate("minimum")}</p>
                  <p className="text-sm font-medium">{formatPercent(caucion.minRate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{translate("maximum")}</p>
                  <p className="text-sm font-medium">{formatPercent(caucion.maxRate)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </InvestmentSectionWrapper>
  );
}
