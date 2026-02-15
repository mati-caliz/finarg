"use client";

import { GovernmentLegend } from "@/components/charts/GovernmentLegend";
import type { ChartPeriod } from "@/components/charts/PeriodSelector";
import { PeriodSelector } from "@/components/charts/PeriodSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDateShort, generateReferenceAreas } from "@/lib/utils";
import type { Government, Inflation } from "@/types";
import dynamic from "next/dynamic";

const LineChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);

interface InflationChartProps {
  monthlyInflation: Inflation[];
  isLoading: boolean;
  chartMonthsLimit: number;
  governments: Government[];
  type: "monthly" | "yearOverYear";
  periods: ChartPeriod[];
  isPremium: boolean;
  onPeriodChange: (value: number) => void;
  onPremiumClick: () => void;
}

function getVisibleGovernments(inflationData: Inflation[], governments: Government[]) {
  if (inflationData.length === 0) {
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
}

export function InflationChart({
  monthlyInflation,
  isLoading,
  chartMonthsLimit,
  governments,
  type,
  periods,
  isPremium,
  onPeriodChange,
  onPremiumClick,
}: InflationChartProps) {
  const { translate } = useTranslation();

  const titleKey = type === "monthly" ? "monthlyEvolution" : "yearOverYearEvolution";
  const chartColor = type === "monthly" ? "#10b981" : "#ef4444";

  const renderChart = () => {
    if (isLoading) {
      return <Skeleton className="h-[250px] w-full" />;
    }

    if (!monthlyInflation || monthlyInflation.length === 0) {
      return (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          {translate("noDataAvailable")}
        </div>
      );
    }

    const sourceData =
      type === "yearOverYear"
        ? monthlyInflation.filter((i) => i.yearOverYear !== null)
        : monthlyInflation;

    const reversedData = [...sourceData].reverse();
    const chartData = reversedData.map((i, idx) => ({
      index: idx,
      fecha: formatDateShort(i.date),
      fechaOriginal: i.date,
      valor: type === "yearOverYear" ? (i.yearOverYear as number) : i.value,
    }));

    const referenceAreas = generateReferenceAreas(chartData, governments, true).map((area) => ({
      ...area,
      x1: chartData[area.x1 as number]?.index,
      x2: chartData[area.x2 as number]?.index,
    }));

    const visibleGovs = getVisibleGovernments(sourceData, governments);

    return (
      <>
        <LineChart
          data={chartData}
          xKey="index"
          yKey="valor"
          height={250}
          formatX={(v) => chartData[Number(v)]?.fecha || ""}
          formatY={(v) => `${Number(v).toFixed(1)}%`}
          colors={[chartColor]}
          referenceAreas={referenceAreas}
        />
        <GovernmentLegend governments={visibleGovs} />
      </>
    );
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg">{translate(titleKey)}</CardTitle>
          <PeriodSelector
            periods={periods}
            selected={chartMonthsLimit}
            onChange={onPeriodChange}
            isPremium={isPremium}
            onPremiumClick={onPremiumClick}
          />
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
