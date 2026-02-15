"use client";

import { Paywall } from "@/components/Paywall";
import { GovernmentLegend } from "@/components/charts/GovernmentLegend";
import { PeriodSelector } from "@/components/charts/PeriodSelector";
import type { ChartPeriod } from "@/components/charts/PeriodSelector";
import { CountryRiskSummaryCards } from "@/components/indicators/country-risk/CountryRiskSummaryCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountryRisk, useCountryRiskHistory } from "@/hooks/useCountryRisk";
import { useTranslation } from "@/hooks/useTranslation";
import { countryRiskApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { formatDateShort, generateReferenceAreas } from "@/lib/utils";
import { useAuthStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const LineChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);

export default function CountryRiskPage() {
  const { translate } = useTranslation();
  const { subscription } = useAuthStore();
  const { data: currentRisk, isLoading: isLoadingCurrent } = useCountryRisk();
  const { data: history, isLoading: isLoadingHistory } = useCountryRiskHistory();
  const [daysLimit, setDaysLimit] = useState(365);
  const [showPaywall, setShowPaywall] = useState(false);

  const isPremium = subscription?.plan === "PREMIUM" || subscription?.plan === "PROFESSIONAL";

  const chartPeriods: ChartPeriod[] = useMemo(
    () => [
      { value: 365, labelKey: "year1" as const, premium: false },
      { value: 730, labelKey: "year2" as const, premium: false },
      { value: 1825, labelKey: "year5" as const, premium: true },
      { value: 3650, labelKey: "year10" as const, premium: true },
      { value: 7300, labelKey: "year20" as const, premium: true },
      { value: 999999, labelKey: "max" as const, premium: true },
    ],
    [],
  );

  const { data: governments = [] } = useQuery({
    queryKey: queryKeys.countryRisk.governments("ar"),
    queryFn: async () => {
      const response = await countryRiskApi.getGovernments("ar");
      return (
        (response.data as { startDate: string; endDate: string; label: string; color: string }[]) ??
        []
      );
    },
  });

  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      return [];
    }

    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - daysLimit);

    return history
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= limitDate;
      })
      .map((item, idx) => ({
        index: idx,
        fecha: formatDateShort(item.date),
        fechaOriginal: item.date,
        valor: Number(item.value),
      }));
  }, [history, daysLimit]);

  const variation = useMemo(() => {
    if (!history || history.length < 2) {
      return 0;
    }
    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    return Number(latest.value) - Number(previous.value);
  }, [history]);

  const getVisibleGovernments = (riskData: typeof chartData) => {
    if (!riskData || riskData.length === 0) {
      return [];
    }
    const firstDate = new Date(riskData[0]?.fechaOriginal || "");
    const lastDate = new Date(riskData[riskData.length - 1]?.fechaOriginal || "");

    return governments.filter((gov) => {
      const govStart = new Date(gov.startDate);
      const govEnd = new Date(gov.endDate);
      return govStart <= lastDate && govEnd >= firstDate;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{translate("countryRiskTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{translate("countryRiskDescription")}</p>
      </div>

      <CountryRiskSummaryCards
        currentRisk={currentRisk}
        variation={variation}
        isLoadingCurrent={isLoadingCurrent}
        isLoadingHistory={isLoadingHistory}
      />

      <Card className="bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">{translate("countryRiskHistory")}</CardTitle>
            <PeriodSelector
              periods={chartPeriods}
              selected={daysLimit}
              onChange={setDaysLimit}
              isPremium={isPremium}
              onPremiumClick={() => setShowPaywall(true)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <Skeleton className="h-[400px] w-full" />
          ) : chartData.length > 0 ? (
            (() => {
              const referenceAreas = generateReferenceAreas(chartData, governments, true).map(
                (area) => ({
                  ...area,
                  x1: chartData[area.x1 as number]?.index,
                  x2: chartData[area.x2 as number]?.index,
                }),
              );
              const visibleGovs = getVisibleGovernments(chartData);

              return (
                <>
                  <LineChart
                    data={chartData}
                    xKey="index"
                    yKey="valor"
                    height={400}
                    formatX={(v) => chartData[Number(v)]?.fecha || ""}
                    formatY={(v) => `${Number(v).toFixed(0)}`}
                    colors={["#ef4444"]}
                    referenceAreas={referenceAreas}
                  />
                  <GovernmentLegend governments={visibleGovs} />
                </>
              );
            })()
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              {translate("noDataAvailable")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">{translate("historicalData")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[400px] pr-2">
            <div className="pr-4">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      {translate("date")}
                    </th>
                    <th className="text-right py-2 text-muted-foreground font-medium pr-2">
                      {translate("value")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingHistory ? (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-muted-foreground">
                        {translate("loadingData")}
                      </td>
                    </tr>
                  ) : history && history.length > 0 ? (
                    [...history].reverse().map((item) => (
                      <tr key={item.date} className="border-b border-border/50">
                        <td className="py-2 text-foreground">
                          {new Date(item.date).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="text-right py-2 text-foreground pr-2">
                          {Number(item.value).toFixed(0)}{" "}
                          {Math.abs(Number(item.value)) === 1
                            ? translate("basisPoint")
                            : translate("basisPoints")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-muted-foreground">
                        {translate("noDataAvailable")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPaywall && (
        <Paywall
          feature={translate("advancedHistoricalData")}
          description="Para ver datos de más de 2 años necesitas Premium. Accede a graficos historicos completos de hasta 25 anos."
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
