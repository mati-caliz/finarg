"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthlyInflation } from "@/hooks/useInflation";
import { useTranslation } from "@/hooks/useTranslation";
import { inflationApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { formatDateShort, formatPercent, generateReferenceAreas } from "@/lib/utils";
import type { Inflation } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";
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

export default function InflationPage() {
  const { translate } = useTranslation();
  const [chartMonthsLimit, setChartMonthsLimit] = useState(24);

  const chartPeriods = useMemo(
    () => [
      { value: 12, labelKey: "year1" as const },
      { value: 24, labelKey: "year2" as const },
      { value: 60, labelKey: "year5" as const },
      { value: 120, labelKey: "year10" as const },
      { value: 240, labelKey: "year20" as const },
      { value: 600, labelKey: "max" as const },
    ],
    [],
  );

  const { data: currentInflation } = useQuery({
    queryKey: queryKeys.inflation.current(),
    queryFn: async () => {
      const response = await inflationApi.getCurrent();
      return response.data as Inflation;
    },
  });

  const { data: allMonthlyInflation, isLoading: isLoadingMonthly } = useMonthlyInflation();

  const monthlyInflation = useMemo(() => {
    if (!allMonthlyInflation || allMonthlyInflation.length === 0) {
      return [];
    }
    return allMonthlyInflation.slice(-chartMonthsLimit);
  }, [allMonthlyInflation, chartMonthsLimit]);

  const { data: governments = [] } = useQuery({
    queryKey: queryKeys.inflation.governments("ar"),
    queryFn: async () => {
      const response = await inflationApi.getGovernments("ar");
      return (
        (response.data as { startDate: string; endDate: string; label: string; color: string }[]) ??
        []
      );
    },
  });

  const getVisibleGovernments = (inflationData: Inflation[]) => {
    if (!inflationData || inflationData.length === 0) {
      return [];
    }
    const reversedData = [...inflationData].reverse();
    const firstDate = new Date(reversedData[0]?.date || "");
    const lastDate = new Date(reversedData[reversedData.length - 1]?.date || "");

    return governments.filter((gov) => {
      const govStart = new Date(gov.startDate);
      const govEnd = new Date(gov.endDate);
      return govStart <= lastDate && govEnd >= firstDate;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{translate("inflationTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{translate("inflationDesc")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{translate("monthlyInflation")}</p>
                <p className="text-2xl font-bold text-foreground mt-1 min-h-[2rem] flex items-center">
                  {currentInflation ? `${currentInflation.value.toFixed(1)}%` : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem] capitalize">
                  {currentInflation?.date
                    ? new Date(currentInflation.date).toLocaleDateString("es-AR", {
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{translate("yearOverYear")}</p>
                <p className="text-2xl font-bold text-red-500 mt-1 min-h-[2rem] flex items-center">
                  {currentInflation?.yearOverYear
                    ? `${currentInflation.yearOverYear.toFixed(1)}%`
                    : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                  {translate("last12Months")}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg shrink-0">
                <BarChart3 className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{translate("yearToDate")}</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1 min-h-[2rem] flex items-center">
                  {currentInflation?.yearToDate
                    ? `${currentInflation.yearToDate.toFixed(1)}%`
                    : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                  {translate("sinceJan")} {new Date().getFullYear()}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg shrink-0">
                <Calendar className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">{translate("monthlyEvolution")}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {chartPeriods.map((p) => (
                  <Button
                    key={p.value}
                    variant={chartMonthsLimit === p.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartMonthsLimit(p.value)}
                  >
                    {translate(p.labelKey)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMonthly ? (
              <Skeleton className="h-[250px] w-full" />
            ) : monthlyInflation && monthlyInflation.length > 0 ? (
              (() => {
                const reversedData = [...monthlyInflation].reverse();
                const chartData = reversedData.map((i, idx) => ({
                  index: idx,
                  fecha: formatDateShort(i.date),
                  fechaOriginal: i.date,
                  valor: i.value,
                }));

                const referenceAreas = generateReferenceAreas(chartData, governments, true).map(
                  (area) => ({
                    ...area,
                    x1: chartData[area.x1 as number]?.index,
                    x2: chartData[area.x2 as number]?.index,
                  }),
                );

                const visibleGovs = getVisibleGovernments(monthlyInflation);

                return (
                  <>
                    <LineChart
                      data={chartData}
                      xKey="index"
                      yKey="valor"
                      height={250}
                      formatX={(v) => chartData[Number(v)]?.fecha || ""}
                      formatY={(v) => `${Number(v).toFixed(1)}%`}
                      colors={["#10b981"]}
                      referenceAreas={referenceAreas}
                    />
                    {visibleGovs.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {visibleGovs.map((gov) => (
                          <div key={gov.label} className="flex items-center gap-1.5">
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: gov.color }}
                            />
                            <span className="text-xs text-muted-foreground">{gov.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {translate("noDataAvailable")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">{translate("yearOverYearEvolution")}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {chartPeriods.map((p) => (
                  <Button
                    key={p.value}
                    variant={chartMonthsLimit === p.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartMonthsLimit(p.value)}
                  >
                    {translate(p.labelKey)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMonthly ? (
              <Skeleton className="h-[250px] w-full" />
            ) : monthlyInflation && monthlyInflation.length > 0 ? (
              (() => {
                const filteredData = monthlyInflation.filter((i) => i.yearOverYear !== null);
                const reversedData = [...filteredData].reverse();
                const chartData = reversedData.map((i, idx) => ({
                  index: idx,
                  fecha: formatDateShort(i.date),
                  fechaOriginal: i.date,
                  valor: i.yearOverYear as number,
                }));

                const referenceAreas = generateReferenceAreas(chartData, governments, true).map(
                  (area) => ({
                    ...area,
                    x1: chartData[area.x1 as number]?.index,
                    x2: chartData[area.x2 as number]?.index,
                  }),
                );

                const visibleGovs = getVisibleGovernments(filteredData);

                return (
                  <>
                    <LineChart
                      data={chartData}
                      xKey="index"
                      yKey="valor"
                      height={250}
                      formatX={(v) => chartData[Number(v)]?.fecha || ""}
                      formatY={(v) => `${Number(v).toFixed(1)}%`}
                      colors={["#ef4444"]}
                      referenceAreas={referenceAreas}
                    />
                    {visibleGovs.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {visibleGovs.map((gov) => (
                          <div key={gov.label} className="flex items-center gap-1.5">
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: gov.color }}
                            />
                            <span className="text-xs text-muted-foreground">{gov.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {translate("noDataAvailable")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">{translate("monthlyData")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[300px] pr-2">
              <div className="pr-4">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">
                        {translate("period")}
                      </th>
                      <th className="text-right py-2 text-muted-foreground font-medium">
                        {translate("monthlyInflation")}
                      </th>
                      <th className="text-right py-2 text-muted-foreground font-medium">
                        {translate("yearOverYear")}
                      </th>
                      <th className="text-right py-2 text-muted-foreground font-medium pr-2">
                        {translate("yearToDate")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyInflation?.map((inflation) => (
                      <tr key={inflation.date} className="border-b border-border/50">
                        <td className="py-2 text-foreground">
                          {new Date(inflation.date).toLocaleDateString("es-AR", {
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="text-right py-2 text-foreground">
                          {formatPercent(inflation.value)}
                        </td>
                        <td className="text-right py-2 text-red-500">
                          {typeof inflation.yearOverYear === "number"
                            ? formatPercent(inflation.yearOverYear)
                            : "-"}
                        </td>
                        <td className="text-right py-2 text-yellow-500 pr-2">
                          {typeof inflation.yearToDate === "number"
                            ? formatPercent(inflation.yearToDate)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
