"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBonds } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function BondsSection() {
  const { translate } = useTranslation();
  const { data: bonds, isLoading, error } = useBonds();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
          <Skeleton key={id} className="h-40" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{translate("errorLoadingData")}</p>
        </CardContent>
      </Card>
    );
  }

  if (bonds === null || bonds === undefined || bonds.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">{translate("noDataAvailable")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bonds.map((bond) => (
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
    </div>
  );
}
