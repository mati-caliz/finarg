"use client";

import { BarChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { inflationApi } from "@/lib/api";
import type { Inflation, InflationAdjustment } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BarChart3, Calculator, Calendar, DollarSign, Loader2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

export default function InflationPage() {
  const { translate } = useTranslation();
  const [originalAmount, setOriginalAmount] = useState<number>(100000);
  const [startDate, setStartDate] = useState<string>("2023-01-01");
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [adjustmentResult, setAdjustmentResult] = useState<InflationAdjustment | null>(null);
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
    queryKey: ["inflation-current"],
    queryFn: async () => {
      const response = await inflationApi.getCurrent();
      return response.data as Inflation;
    },
  });

  const { data: monthlyInflation } = useQuery({
    queryKey: ["inflation-monthly", chartMonthsLimit],
    queryFn: async () => {
      const response = await inflationApi.getMonthly(chartMonthsLimit);
      return response.data as Inflation[];
    },
  });

  const { data: governments = [] } = useQuery({
    queryKey: ["inflation-governments", "ar"],
    queryFn: async () => {
      const response = await inflationApi.getGovernments("ar");
      return (
        (response.data as { startDate: string; endDate: string; label: string; color: string }[]) ??
        []
      );
    },
  });

  const adjustMutation = useMutation({
    mutationFn: async () => {
      const response = await inflationApi.adjust(originalAmount, startDate, endDate);
      return response.data as InflationAdjustment;
    },
    onSuccess: (data) => {
      setAdjustmentResult(data);
    },
  });

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    adjustMutation.mutate();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

  const formatPercent = (value: number | string) => `${Number(value).toFixed(2)}%`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
  };

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
                  {currentInflation ? formatPercent(currentInflation.value) : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 min-h-[1.25rem]">
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
                    ? formatPercent(currentInflation.yearOverYear)
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
                  {currentInflation?.yearToDate ? formatPercent(currentInflation.yearToDate) : "-"}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="bg-card lg:self-start">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              {translate("adjustmentCalculator")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleAdjust} className="space-y-3">
              <div>
                <label
                  htmlFor="originalAmount"
                  className="block text-sm font-medium text-muted-foreground mb-2"
                >
                  {translate("originalAmount")}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="originalAmount"
                    type="number"
                    placeholder="100000"
                    value={originalAmount || ""}
                    onChange={(e) => setOriginalAmount(Number.parseFloat(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-muted-foreground mb-2"
                >
                  {translate("startDate")}
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-muted-foreground mb-2"
                >
                  {translate("endDate")}
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={adjustMutation.isPending || originalAmount <= 0}
              >
                {adjustMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate("calculating")}
                  </>
                ) : (
                  translate("calculateAdjustment")
                )}
              </Button>
            </form>

            {adjustmentResult && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      {translate("originalAmount")}
                    </span>
                    <span className="text-foreground">
                      {formatCurrency(adjustmentResult.originalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      {translate("monthsElapsed")}
                    </span>
                    <span className="text-foreground">{adjustmentResult.monthsElapsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      {translate("cumulativeInflation")}
                    </span>
                    <span className="text-red-500">
                      +
                      {formatPercent(
                        adjustmentResult.cumulativeInflation ??
                          adjustmentResult.accumulatedInflation ??
                          0,
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-medium">
                        {translate("adjustedAmount")}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(adjustmentResult.adjustedAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {translate("maintainPurchasingPower")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
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
              {monthlyInflation && monthlyInflation.length > 0 ? (
                (() => {
                  const reversedData = [...monthlyInflation].reverse();
                  const chartData = reversedData.map((i) => ({
                    fecha: formatDate(i.date),
                    fechaOriginal: i.date,
                    valor: i.value,
                  }));

                  const firstDataDate = new Date(reversedData[0]?.date || "");
                  const lastDataDate = new Date(reversedData[reversedData.length - 1]?.date || "");

                  const referenceAreas = governments
                    .filter((gov) => {
                      const govStart = new Date(gov.startDate);
                      const govEnd = new Date(gov.endDate);
                      return govStart <= lastDataDate && govEnd >= firstDataDate;
                    })
                    .map((gov) => {
                      const govStart = new Date(gov.startDate);
                      const govEnd = new Date(gov.endDate);

                      let x1 = chartData[0]?.fecha;
                      let x2 = chartData[chartData.length - 1]?.fecha;

                      for (let i = 0; i < chartData.length; i++) {
                        const date = new Date(chartData[i].fechaOriginal);
                        if (date >= govStart) {
                          x1 = chartData[i].fecha;
                          break;
                        }
                      }

                      for (let i = chartData.length - 1; i >= 0; i--) {
                        const date = new Date(chartData[i].fechaOriginal);
                        if (date <= govEnd) {
                          x2 = chartData[i].fecha;
                          break;
                        }
                      }

                      return {
                        x1,
                        x2,
                        fill: gov.color,
                        label: gov.label,
                      };
                    });

                  const visibleGovs = getVisibleGovernments(monthlyInflation);

                  return (
                    <>
                      <BarChart
                        data={chartData}
                        xKey="fecha"
                        yKey="valor"
                        height={250}
                        formatY={(v) => `${Number(v).toFixed(1)}%`}
                        color="#10b981"
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
                  Loading data...
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
              {monthlyInflation && monthlyInflation.length > 0 ? (
                (() => {
                  const filteredData = monthlyInflation.filter((i) => i.yearOverYear !== null);
                  const reversedData = [...filteredData].reverse();
                  const chartData = reversedData.map((i) => ({
                    fecha: formatDate(i.date),
                    fechaOriginal: i.date,
                    valor: i.yearOverYear as number,
                  }));

                  const firstDataDate = new Date(reversedData[0]?.date || "");
                  const lastDataDate = new Date(reversedData[reversedData.length - 1]?.date || "");

                  const referenceAreas = governments
                    .filter((gov) => {
                      const govStart = new Date(gov.startDate);
                      const govEnd = new Date(gov.endDate);
                      return govStart <= lastDataDate && govEnd >= firstDataDate;
                    })
                    .map((gov) => {
                      const govStart = new Date(gov.startDate);
                      const govEnd = new Date(gov.endDate);

                      let x1 = chartData[0]?.fecha;
                      let x2 = chartData[chartData.length - 1]?.fecha;

                      for (let i = 0; i < chartData.length; i++) {
                        const date = new Date(chartData[i].fechaOriginal);
                        if (date >= govStart) {
                          x1 = chartData[i].fecha;
                          break;
                        }
                      }

                      for (let i = chartData.length - 1; i >= 0; i--) {
                        const date = new Date(chartData[i].fechaOriginal);
                        if (date <= govEnd) {
                          x2 = chartData[i].fecha;
                          break;
                        }
                      }

                      return {
                        x1,
                        x2,
                        fill: gov.color,
                        label: gov.label,
                      };
                    });

                  const visibleGovs = getVisibleGovernments(filteredData);

                  return (
                    <>
                      <BarChart
                        data={chartData}
                        xKey="fecha"
                        yKey="valor"
                        height={250}
                        formatY={(v) => `${Number(v).toFixed(1)}%`}
                        color="#ef4444"
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
                  Loading data...
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
    </div>
  );
}
