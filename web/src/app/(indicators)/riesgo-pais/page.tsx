"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountryRisk, useCountryRiskHistory } from "@/hooks/useCountryRisk";
import { useTranslation } from "@/hooks/useTranslation";
import { countryRiskApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { formatDateShort, generateReferenceAreas } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, TrendingUp } from "lucide-react";
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
  const { data: currentRisk, isLoading: isLoadingCurrent } = useCountryRisk();
  const { data: history, isLoading: isLoadingHistory } = useCountryRiskHistory();
  const [daysLimit, setDaysLimit] = useState(365);

  const chartPeriods = useMemo(
    () => [
      { value: 365, labelKey: "year1" as const },
      { value: 730, labelKey: "year2" as const },
      { value: 1825, labelKey: "year5" as const },
      { value: 3650, labelKey: "year10" as const },
      { value: 7300, labelKey: "year20" as const },
      { value: 999999, labelKey: "max" as const },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{translate("currentCountryRisk")}</p>
                <div className="text-2xl font-bold text-foreground mt-1 min-h-[2rem] flex items-center">
                  {isLoadingCurrent ? (
                    <Skeleton className="h-8 w-24" />
                  ) : currentRisk ? (
                    `${Number(currentRisk.value).toFixed(0)} ${Math.abs(Number(currentRisk.value)) === 1 ? translate("basisPoint") : translate("basisPoints")}`
                  ) : (
                    "-"
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                  {currentRisk?.date
                    ? new Date(currentRisk.date).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{translate("dailyVariation")}</p>
                <div
                  className={`text-2xl font-bold mt-1 min-h-[2rem] flex items-center ${
                    variation > 0
                      ? "text-red-500"
                      : variation < 0
                        ? "text-green-500"
                        : "text-foreground"
                  }`}
                >
                  {isLoadingHistory ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      {variation > 0 && "+"}
                      {variation.toFixed(0)}{" "}
                      {Math.abs(variation) === 1
                        ? translate("basisPoint")
                        : translate("basisPoints")}
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
                  {translate("vsYesterday")}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg shrink-0 ${
                  variation > 0
                    ? "bg-red-500/10"
                    : variation < 0
                      ? "bg-green-500/10"
                      : "bg-muted/10"
                }`}
              >
                <TrendingUp
                  className={`h-6 w-6 ${
                    variation > 0
                      ? "text-red-500"
                      : variation < 0
                        ? "text-green-500"
                        : "text-muted-foreground"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">{translate("countryRiskHistory")}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {chartPeriods.map((p) => (
                <Button
                  key={p.value}
                  variant={daysLimit === p.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDaysLimit(p.value)}
                >
                  {translate(p.labelKey)}
                </Button>
              ))}
            </div>
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
                  {history && history.length > 0 ? (
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
    </div>
  );
}
