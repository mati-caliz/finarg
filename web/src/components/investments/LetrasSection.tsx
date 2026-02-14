"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VariationBadge } from "@/components/ui/variation-badge";
import { useLetras } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import type { Letra } from "@/types";

export function LetrasSection() {
  const { translate } = useTranslation();
  const { data: letras, isLoading, error } = useLetras();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
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

  if (letras === null || letras === undefined || letras.length === 0) {
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
      {letras.map((letra: Letra) => (
        <Card key={letra.ticker} className="border-t-[3px] border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{letra.ticker}</span>
              <VariationBadge value={letra.changePercent} />
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
                  <p className="text-sm font-medium">{formatNumber(letra.volume)}</p>
                </div>
              </div>
              <div className="pt-2 border-t flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{translate("change")}</p>
                  <p
                    className={`text-sm font-medium ${letra.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {letra.change >= 0 ? "+" : ""}
                    {formatPrice(letra.change, letra.currency)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
