"use client";

import { InflationChart } from "@/components/indicators/inflation/InflationChart";
import { InflationDataTable } from "@/components/indicators/inflation/InflationDataTable";
import { InflationSummaryCards } from "@/components/indicators/inflation/InflationSummaryCards";
import { useMonthlyInflation } from "@/hooks/useInflation";
import { useTranslation } from "@/hooks/useTranslation";
import { inflationApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Inflation } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const chartPeriods = [
  { value: 12, labelKey: "year1" as const },
  { value: 24, labelKey: "year2" as const },
  { value: 60, labelKey: "year5" as const },
  { value: 120, labelKey: "year10" as const },
  { value: 240, labelKey: "year20" as const },
  { value: 300, labelKey: "year25" as const },
  { value: 600, labelKey: "max" as const },
];

export default function InflationPage() {
  const { translate } = useTranslation();
  const [chartMonthsLimit, setChartMonthsLimit] = useState(24);

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
    return allMonthlyInflation.slice(0, chartMonthsLimit);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{translate("inflationTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{translate("inflationDesc")}</p>
      </div>

      <InflationSummaryCards currentInflation={currentInflation} />

      <div className="space-y-6">
        <InflationChart
          monthlyInflation={monthlyInflation}
          isLoading={isLoadingMonthly}
          chartMonthsLimit={chartMonthsLimit}
          governments={governments}
          type="monthly"
          periods={chartPeriods}
          onPeriodChange={setChartMonthsLimit}
        />

        <InflationChart
          monthlyInflation={monthlyInflation}
          isLoading={isLoadingMonthly}
          chartMonthsLimit={chartMonthsLimit}
          governments={governments}
          type="yearOverYear"
          periods={chartPeriods}
          onPeriodChange={setChartMonthsLimit}
        />

        <InflationDataTable monthlyInflation={monthlyInflation} />
      </div>
    </div>
  );
}
