"use client";

import { IndicatorTile } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import { freshnessForCode } from "@/lib/freshness";
import { INDICATOR_BY_CODE, PERIOD_LABELS, formatDateAR, sourceLabel } from "@/lib/indicators";
import type { IndicatorPoint } from "@/lib/labrechaApi";

interface IndicatorTileConnectedProps {
  code: string;
}

export function IndicatorTileConnected({ code }: IndicatorTileConnectedProps) {
  const indicator = INDICATOR_BY_CODE[code];
  const { data, isLoading } = useIndicatorSeries(indicator?.code ?? "", {
    source: indicator?.preferredSource,
    limit: indicator?.sparkPoints,
    order: "desc",
  });
  const historyQuery = useIndicatorSeries(indicator?.code ?? "", {
    source: indicator?.historySource ?? indicator?.preferredSource,
    limit: indicator?.sparkPoints,
    order: "desc",
  });

  if (!indicator) {
    return null;
  }

  if (isLoading || historyQuery.isLoading) {
    return <Skeleton className="h-[132px] rounded-[10px]" />;
  }

  const livePoints = data?.points ?? [];
  const historyPoints = indicator.historySource ? (historyQuery.data?.points ?? []) : [];
  const pointsByDate = new Map<string, IndicatorPoint>();
  for (const point of historyPoints) {
    pointsByDate.set(point.date, point);
  }
  for (const point of livePoints) {
    pointsByDate.set(point.date, point);
  }
  const points = Array.from(pointsByDate.values())
    .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
    .slice(0, indicator.sparkPoints);
  if (points.length === 0) {
    return null;
  }

  const latest = points[0];
  const previous = points[1];
  const latestValue = Number.parseFloat(latest.value);
  const ascending = [...points].reverse();
  const sparkData =
    ascending.length >= 2 ? ascending.map((point) => Number.parseFloat(point.value)) : undefined;

  let variation: number | undefined;
  if (previous && indicator.variation !== "none") {
    const previousValue = Number.parseFloat(previous.value);
    if (indicator.variation === "pct" && previousValue !== 0) {
      variation = ((latestValue - previousValue) / previousValue) * 100;
    } else if (indicator.variation === "delta") {
      variation = latestValue - previousValue;
    }
  }

  return (
    <IndicatorTile
      label={indicator.label}
      value={indicator.format(latestValue)}
      unit={indicator.unit}
      variation={variation}
      variationSuffix={indicator.variationSuffix}
      goodWhen={indicator.goodWhen}
      period={variation !== undefined ? PERIOD_LABELS[indicator.code] : undefined}
      data={sparkData}
      source={sourceLabel(latest.source)}
      date={formatDateAR(latest.date)}
      stale={freshnessForCode(indicator.code, latest.date).stale}
      href={indicator.href}
    />
  );
}
