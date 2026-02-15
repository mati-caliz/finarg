"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBonds } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { INVESTMENT_GRID } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { InvestmentSectionWrapper } from "./InvestmentSectionWrapper";

export function BondsSection() {
  const { translate } = useTranslation();
  const { data: bonds, isLoading, error } = useBonds();

  return (
    <InvestmentSectionWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={bonds === null || bonds === undefined || bonds.length === 0}
      gridClassName={INVESTMENT_GRID.THREE_COL}
      skeletonCount={6}
      skeletonHeight="h-40"
    >
      {bonds?.map((bond) => (
        <Card key={bond.ticker} className="border-t-[3px] border-t-violet-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{bond.ticker}</span>
              <span className="text-xs text-muted-foreground">{bond.rating}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground truncate">{bond.name}</p>
              <p className="text-xs text-muted-foreground truncate">{bond.issuer}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{translate("price")}</p>
                  <p className="text-xl font-bold">{formatPrice(bond.price, bond.currency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{translate("yield")}</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {bond.yieldPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">{translate("maturity")}</p>
                <p className="text-sm font-medium">
                  {format(new Date(bond.maturity), "dd MMM yyyy", { locale: es })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </InvestmentSectionWrapper>
  );
}
