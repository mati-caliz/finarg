import type { IndicatorDisplay } from "@/lib/indicators";
import { formatNumberAR } from "@/lib/indicators";
import type { ParsedPoint } from "@/lib/series";

export interface VariationDisplay {
  text: string;
  color: string;
  background: string;
}

function computeVariation(
  latest: number,
  base: number | undefined,
  mode: "pct" | "delta" | "none",
  suffix: string | undefined,
  goodWhen: "up" | "down" | "neutral",
): VariationDisplay | undefined {
  if (base === undefined || mode === "none") {
    return undefined;
  }
  let delta: number;
  let label: string;
  if (mode === "pct") {
    if (base === 0) {
      return undefined;
    }
    delta = ((latest - base) / base) * 100;
    label = `${formatNumberAR(Math.abs(delta), 1)}%`;
  } else {
    delta = latest - base;
    label = `${formatNumberAR(Math.abs(delta), 1)}${suffix ?? " pp"}`;
  }
  if (delta === 0) {
    return { text: `= ${label}`, color: "var(--ink2)", background: "transparent" };
  }
  const rising = delta > 0;
  const good = goodWhen === "neutral" ? true : goodWhen === "up" ? rising : !rising;
  return {
    text: `${rising ? "▲" : "▼"} ${label}`,
    color: good ? "var(--pos)" : "var(--neg)",
    background: good ? "var(--pos-bg)" : "var(--neg-bg)",
  };
}

function valueBefore(points: ParsedPoint[], targetDate: string): number | undefined {
  let result: number | undefined;
  for (const point of points) {
    if (point.date <= targetDate) {
      result = point.value;
    } else {
      break;
    }
  }
  return result;
}

function shiftDate(isoDate: string, months: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
}

export function variationVsPreviousPoint(
  indicator: IndicatorDisplay,
  points: ParsedPoint[],
): VariationDisplay | undefined {
  const lastPoint = points[points.length - 1];
  const previousPoint = points[points.length - 2];
  if (!lastPoint || !previousPoint) {
    return undefined;
  }
  return computeVariation(
    lastPoint.value,
    previousPoint.value,
    indicator.variation,
    indicator.variationSuffix,
    indicator.goodWhen,
  );
}

export function variationVsMonthsAgo(
  indicator: IndicatorDisplay,
  points: ParsedPoint[],
  monthsAgo: number,
): VariationDisplay | undefined {
  const lastPoint = points[points.length - 1];
  if (!lastPoint) {
    return undefined;
  }
  return computeVariation(
    lastPoint.value,
    valueBefore(points, shiftDate(lastPoint.date, monthsAgo)),
    indicator.variation,
    indicator.variationSuffix,
    indicator.goodWhen,
  );
}

export function gapPercent(
  first: number | null | undefined,
  second: number | null | undefined,
): number | undefined {
  if (first === undefined || second === undefined || first === null || second === null) {
    return undefined;
  }
  const base = Math.max(Math.abs(first), Math.abs(second)) || 1;
  return (Math.abs(first - second) / base) * 100;
}
