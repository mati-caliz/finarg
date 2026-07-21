"use client";

import Link from "next/link";
import { Badge, Card, LiveCounter } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import { formatBillonesAR, formatDateAR, sourceLabel } from "@/lib/indicators";
import { daysInMonth, monthlyRateToPerSecond } from "@/lib/liveCounter";

const INDICATOR_CODE = "base_monetaria";
const PREFERRED_SOURCE = "datosgobar";
const TRAILING_MONTHS = 13;
const CLOCK_DECIMALS = 4;

function formatBase(valueInMillones: number): string {
  return formatBillonesAR(valueInMillones, CLOCK_DECIMALS);
}

export function BaseMonetariaClockCard() {
  const { data, isLoading } = useIndicatorSeries(INDICATOR_CODE, {
    source: PREFERRED_SOURCE,
    limit: TRAILING_MONTHS,
    order: "desc",
  });

  if (isLoading) {
    return <Skeleton className="h-[200px] rounded-[10px]" />;
  }

  const points = data?.points ?? [];
  const latest = points[0];
  const oldest = points[points.length - 1];
  if (!latest || !oldest || points.length < 2) {
    return null;
  }

  const baseLatest = Number.parseFloat(latest.value);
  const baseOldest = Number.parseFloat(oldest.value);
  const monthsSpan = points.length - 1;
  const averageMonthlyDelta = (baseLatest - baseOldest) / monthsSpan;
  const ratePerSecond = monthlyRateToPerSecond(averageMonthlyDelta, daysInMonth());
  const since = new Date(latest.date).getTime();

  return (
    <Card
      title="Base monetaria en vivo"
      subtitle="Base monetaria proyectada al ritmo de emisión de los últimos 12 meses"
      actions={<Badge tone="gap">Proyección</Badge>}
      footer={
        <Link
          href={`/indicador/${INDICATOR_CODE}`}
          style={{ fontSize: "0.8125rem", fontWeight: 600 }}
        >
          Ver la serie de base monetaria con eventos políticos →
        </Link>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <LiveCounter
          baseValue={baseLatest}
          since={since}
          ratePerSecond={ratePerSecond}
          format={formatBase}
          style={{ fontSize: "2.5rem", fontWeight: 600, lineHeight: 1.05, color: "var(--gap-accent)" }}
        />
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
          Proyección lineal desde el último dato oficial ({formatBillonesAR(baseLatest)} en{" "}
          {formatDateAR(latest.date)}), extendido al ritmo promedio de emisión de los últimos{" "}
          {monthsSpan} meses. No es una medición: la base monetaria se publica a mes vencido. Fuente:{" "}
          {sourceLabel(latest.source)}.
        </p>
      </div>
    </Card>
  );
}
