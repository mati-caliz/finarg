"use client";

import { AreaChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { reservesApi } from "@/lib/api";
import { formatDateDayShort, formatReservesUSD } from "@/lib/utils";
import type { Reserves } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Building2, Landmark, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

const LIABILITY_COLORS = ["#ef4444", "#3b82f6", "#eab308", "#8b5cf6", "#06b6d4"];

export default function ReservesPage() {
  const { translate } = useTranslation();
  const [period, setPeriod] = useState(365);

  const PERIODS = [
    { value: 7, label: translate("days7") },
    { value: 30, label: translate("days30") },
    { value: 90, label: translate("months3") },
    { value: 180, label: translate("months6") },
    { value: 365, label: translate("year1") },
    { value: 1095, label: translate("year3") },
    { value: 1825, label: translate("year5") },
    { value: 3650, label: translate("year10") },
    { value: 5475, label: translate("year15") },
    { value: 7000, label: translate("max") },
  ];

  const { data: currentReserves, isLoading } = useQuery({
    queryKey: ["reserves", "ar"],
    queryFn: async () => {
      const response = await reservesApi.getCurrent("ar");
      return response.data as Reserves;
    },
    refetchInterval: 300000,
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

  const getTrendIcon = (trend: string) => {
    switch (trend?.toUpperCase()) {
      case "RISING":
      case "SUBIENDO":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "FALLING":
      case "BAJANDO":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend?.toUpperCase()) {
      case "RISING":
      case "SUBIENDO":
        return "text-green-500";
      case "FALLING":
      case "BAJANDO":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 4 }, (_, i) => `reserves-skeleton-${i}`).map((key) => (
            <Card key={key} className="bg-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              {translate("grossReserves")} · {translate("netReservesByMethodology")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground">{translate("grossReserves")}</p>
                    <Landmark className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {currentReserves ? formatReservesUSD(currentReserves.grossReserves) : "-"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {currentReserves && getTrendIcon(currentReserves.trend)}
                    <span
                      className={`text-sm ${
                        currentReserves ? getTrendColor(currentReserves.trend) : ""
                      }`}
                    >
                      {currentReserves && currentReserves.dailyVariation !== null
                        ? `${currentReserves.dailyVariation >= 0 ? "+" : ""}${currentReserves.dailyVariation.toLocaleString("es-AR", { maximumFractionDigits: 0 })} M`
                        : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-green-500/50 ring-1 ring-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground">{translate("netReservesBCRA")}</p>
                    <Building2 className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-500">
                    {currentReserves &&
                    currentReserves.netReservesBCRA !== undefined &&
                    currentReserves.netReservesBCRA !== null
                      ? formatReservesUSD(currentReserves.netReservesBCRA)
                      : currentReserves
                        ? formatReservesUSD(currentReserves.netReserves)
                        : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {translate("methodologyBCRA")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-amber-500/50 ring-1 ring-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground">{translate("netReservesFMI")}</p>
                    <Building2 className="h-5 w-5 text-amber-500" />
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      currentReserves &&
                      currentReserves.netReservesFMI !== undefined &&
                      currentReserves.netReservesFMI !== null &&
                      currentReserves.netReservesFMI < 0
                        ? "text-red-500"
                        : "text-amber-600"
                    }`}
                  >
                    {currentReserves &&
                    currentReserves.netReservesFMI !== undefined &&
                    currentReserves.netReservesFMI !== null
                      ? (currentReserves.netReservesFMI < 0 ? "−" : "") +
                        formatReservesUSD(Math.abs(currentReserves.netReservesFMI))
                      : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {translate("methodologyFMI")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {(currentReserves?.liabilitiesBCRA?.length ?? 0) > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <span className="inline-block w-1 h-4 rounded bg-green-500" />
                {translate("liabilitiesBCRA")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                {currentReserves?.liabilitiesBCRA?.map((liability) => (
                  <div
                    key={liability.id}
                    className="flex flex-col gap-1 p-3 rounded-md bg-background/80 border border-border"
                  >
                    <p className="text-xs text-muted-foreground">{liability.name}</p>
                    <p className="text-lg font-semibold text-foreground">
                      −{formatReservesUSD(liability.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(currentReserves?.liabilitiesFMI?.length ?? 0) > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <span className="inline-block w-1 h-4 rounded bg-amber-500" />
                {translate("liabilitiesFMI")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                {currentReserves?.liabilitiesFMI?.map((liability) => (
                  <div
                    key={liability.id}
                    className="flex flex-col gap-1 p-3 rounded-md bg-background/80 border border-border"
                  >
                    <p className="text-xs text-muted-foreground">{liability.name}</p>
                    <p className="text-lg font-semibold text-foreground">
                      −{formatReservesUSD(liability.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentReserves &&
        currentReserves.grossReserves > 0 &&
        (currentReserves.liabilitiesBCRA?.length ?? 0) > 0 && (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">{translate("reservesComposition")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-8 rounded-lg overflow-hidden bg-muted">
                  <div
                    className="absolute h-full bg-green-500"
                    style={{
                      width: `${
                        ((currentReserves.netReservesBCRA ?? currentReserves.netReserves) /
                          currentReserves.grossReserves) *
                        100
                      }%`,
                    }}
                  />
                  {
                    currentReserves?.liabilitiesBCRA?.reduce<{
                      total: number;
                      elements: JSX.Element[];
                    }>(
                      (acc, liability, i) => {
                        const net = currentReserves.netReservesBCRA ?? currentReserves.netReserves;
                        const left = ((net + acc.total) / currentReserves.grossReserves) * 100;
                        const width = (liability.amount / currentReserves.grossReserves) * 100;
                        acc.elements.push(
                          <div
                            key={liability.id}
                            className="absolute h-full"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: LIABILITY_COLORS[i % LIABILITY_COLORS.length],
                            }}
                          />,
                        );
                        acc.total += liability.amount;
                        return acc;
                      },
                      { total: 0, elements: [] },
                    ).elements
                  }
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {translate("netReservesBCRA")}
                      </p>
                      <p className="text-sm text-foreground">
                        {formatReservesUSD(
                          currentReserves.netReservesBCRA ?? currentReserves.netReserves,
                        )}
                      </p>
                    </div>
                  </div>
                  {currentReserves?.liabilitiesBCRA?.map((liability, index) => (
                    <div key={liability.id} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{
                          backgroundColor: LIABILITY_COLORS[index % LIABILITY_COLORS.length],
                        }}
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">{liability.name}</p>
                        <p className="text-sm text-foreground">
                          {formatReservesUSD(liability.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      <Card className="bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">{translate("historicalEvolution")}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  variant={period === p.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
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
              const chartData = reversedRaw.map((r: { fecha: string; valor: number }, idx) => ({
                index: idx,
                fecha: formatDateDayShort(r.fecha),
                fechaOriginal: r.fecha,
                valor: Number(r.valor),
              }));
              const values = chartData.map((d) => d.valor);
              const minVal = Math.min(...values);
              const maxVal = Math.max(...values);
              const padding = Math.max((maxVal - minVal) * 0.05, 500);

              const firstDataDate = new Date(reversedRaw[0]?.fecha || "");
              const lastDataDate = new Date(reversedRaw[reversedRaw.length - 1]?.fecha || "");

              const referenceAreas = governments
                .filter((gov) => {
                  const govStart = new Date(gov.startDate);
                  const govEnd = new Date(gov.endDate);
                  return govStart <= lastDataDate && govEnd >= firstDataDate;
                })
                .map((gov) => {
                  const govStart = new Date(gov.startDate);
                  const govEnd = new Date(gov.endDate);

                  let x1Idx = 0;
                  let x2Idx = chartData.length - 1;

                  for (let i = 0; i < chartData.length; i++) {
                    const date = new Date(chartData[i].fechaOriginal);
                    if (date >= govStart) {
                      x1Idx = i;
                      break;
                    }
                  }

                  for (let i = chartData.length - 1; i >= 0; i--) {
                    const date = new Date(chartData[i].fechaOriginal);
                    if (date <= govEnd) {
                      x2Idx = i;
                      break;
                    }
                  }

                  return {
                    x1: chartData[x1Idx]?.index,
                    x2: chartData[x2Idx]?.index,
                    fill: gov.color,
                    label: gov.label,
                  };
                });

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
    </div>
  );
}
