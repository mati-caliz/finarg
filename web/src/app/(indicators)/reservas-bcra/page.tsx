"use client";

import { Paywall } from "@/components/Paywall";
import { GovernmentLegend } from "@/components/charts/GovernmentLegend";
import { PeriodSelector } from "@/components/charts/PeriodSelector";
import type { ChartPeriod } from "@/components/charts/PeriodSelector";
import { ReservesCompositionChart } from "@/components/indicators/reserves/ReservesCompositionChart";
import { ReservesCurrentData } from "@/components/indicators/reserves/ReservesCurrentData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { reservesApi } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/constants";
import { formatDateDayShort, generateReferenceAreas } from "@/lib/utils";
import { useAuthStore } from "@/store/useStore";
import type { Reserves } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Building2, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const AreaChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.AreaChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);

export default function ReservesPage() {
  const { translate } = useTranslation();
  const { subscription } = useAuthStore();
  const [period, setPeriod] = useState(365);
  const [showPaywall, setShowPaywall] = useState(false);

  const isPremium = subscription?.plan === "PREMIUM" || subscription?.plan === "PROFESSIONAL";

  const PERIODS: ChartPeriod[] = useMemo(
    () => [
      { value: 7, labelKey: "days7" as const, premium: false },
      { value: 30, labelKey: "days30" as const, premium: false },
      { value: 90, labelKey: "months3" as const, premium: false },
      { value: 180, labelKey: "months6" as const, premium: false },
      { value: 365, labelKey: "year1" as const, premium: false },
      { value: 730, labelKey: "year2" as const, premium: false },
      { value: 1095, labelKey: "year3" as const, premium: true },
      { value: 1825, labelKey: "year5" as const, premium: true },
      { value: 3650, labelKey: "year10" as const, premium: true },
      { value: 5475, labelKey: "year15" as const, premium: true },
      { value: 7000, labelKey: "max" as const, premium: true },
    ],
    [],
  );

  const { data: currentReserves, isLoading } = useQuery({
    queryKey: ["reserves", "ar"],
    queryFn: async () => {
      const response = await reservesApi.getCurrent("ar");
      return response.data as Reserves;
    },
    refetchInterval: CACHE_TIMES.REALTIME_STALE,
  });

  const { data: historicalReserves, isLoading: historicalLoading } = useQuery({
    queryKey: ["reserves-historical", period],
    queryFn: async () => {
      const response = await reservesApi.getHistory(period);
      return response.data;
    },
    staleTime: 0,
  });

  const { data: governments = [] } = useQuery({
    queryKey: ["reserves-governments", "ar"],
    queryFn: async () => {
      const response = await reservesApi.getGovernments("ar");
      return (
        (response.data as { startDate: string; endDate: string; label: string; color: string }[]) ??
        []
      );
    },
  });

  const getVisibleGovernments = (historicalData: { fecha: string; valor: number }[]) => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }
    const reversedData = [...historicalData].reverse();
    const firstDate = new Date(reversedData[0]?.fecha || "");
    const lastDate = new Date(reversedData[reversedData.length - 1]?.fecha || "");

    return governments.filter((gov) => {
      const govStart = new Date(gov.startDate);
      const govEnd = new Date(gov.endDate);
      return govStart <= lastDate && govEnd >= firstDate;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate("bcraReservesTitle")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {translate("bcraReservesDesc")} · {translate("reservesInMillions")}
          </p>
          <p className="text-muted-foreground text-xs mt-1">{translate("reservesUpdateNote")}</p>
        </div>
      </div>

      <ReservesCurrentData reserves={currentReserves} isLoading={isLoading} />

      {currentReserves && <ReservesCompositionChart reserves={currentReserves} />}

      <Card className="bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">{translate("historicalEvolution")}</CardTitle>
            <PeriodSelector
              periods={PERIODS}
              selected={period}
              onChange={setPeriod}
              isPremium={isPremium}
              onPremiumClick={() => setShowPaywall(true)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {historicalLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : historicalReserves && historicalReserves.length > 0 ? (
            (() => {
              const reversedRaw = [...historicalReserves].reverse();
              const chartData = reversedRaw.map((r: { date: string; value: number }, idx) => {
                return {
                  index: idx,
                  fecha: formatDateDayShort(r.date),
                  fechaOriginal: r.date,
                  valor: Number(r.value),
                };
              });
              const values = chartData.map((d) => d.valor);
              const minVal = Math.min(...values);
              const maxVal = Math.max(...values);
              const padding = Math.max((maxVal - minVal) * 0.05, 500);

              const referenceAreas = generateReferenceAreas(chartData, governments, true).map(
                (area) => ({
                  ...area,
                  x1: chartData[area.x1 as number]?.index,
                  x2: chartData[area.x2 as number]?.index,
                }),
              );

              const visibleGovs = getVisibleGovernments(historicalReserves);

              return (
                <>
                  <AreaChart
                    data={chartData}
                    xKey="index"
                    yKey="valor"
                    color="#10b981"
                    height={300}
                    formatX={(v) => chartData[Number(v)]?.fecha || ""}
                    formatY={(v) => `${Number(v).toLocaleString("es-AR")} M`}
                    gradientId="reservesGradient"
                    yDomain={[Math.floor(minVal - padding), Math.ceil(maxVal + padding)]}
                    xAxisInterval={
                      chartData.length > 20 ? Math.max(1, Math.floor(chartData.length / 12)) : 0
                    }
                    referenceAreas={referenceAreas}
                  />
                  <GovernmentLegend governments={visibleGovs} />
                </>
              );
            })()
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {translate("noHistoricalData")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Building2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-500 font-medium mb-1">{translate("aboutNetReserves")}</p>
              <p className="text-muted-foreground">{translate("netReservesInfo")}</p>
              <p className="text-muted-foreground text-xs mt-2">
                {translate("reservesDataSource")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPaywall && (
        <Paywall
          feature={translate("advancedHistoricalData")}
          description="Para ver datos de mas de 2 anos necesitas Premium. Accede a graficos historicos completos de hasta 25 anos."
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
