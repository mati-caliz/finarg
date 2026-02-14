"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VariationBadge } from "@/components/ui/variation-badge";
import { useCauciones } from "@/hooks/useInvestments";
import { useTranslation } from "@/hooks/useTranslation";
import type { Caucion } from "@/types";

export function CaucionesSection() {
  const { translate } = useTranslation();
  const { data: cauciones, isLoading, error } = useCauciones();

  const formatRate = (rate: number) => {
    return `${rate.toFixed(2)}%`;
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

  if (cauciones === null || cauciones === undefined || cauciones.length === 0) {
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
      {cauciones.map((caucion: Caucion) => (
        <Card key={caucion.ticker} className="border-t-[3px] border-t-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{caucion.ticker}</span>
              <VariationBadge value={caucion.changePercent} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {caucion.days} {caucion.days === 1 ? "día" : "días"}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tasa TNA</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRate(caucion.rate)}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Mínima</p>
                  <p className="text-sm font-medium">{formatRate(caucion.minRate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Máxima</p>
                  <p className="text-sm font-medium">{formatRate(caucion.maxRate)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
