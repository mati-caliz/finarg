"use client";

import { Badge, Card, LiveCounter } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import { formatDateAR, formatNumberAR, sourceLabel } from "@/lib/indicators";
import { daysInMonth, monthlyRateToPerSecond, startOfCurrentMonth } from "@/lib/liveCounter";
import Link from "next/link";

const INDICATOR_CODE = "ipc_mensual";
const PREFERRED_SOURCE = "argentinadatos";
const CLOCK_DECIMALS = 6;

function formatAccumulated(value: number): string {
  return formatNumberAR(value, CLOCK_DECIMALS);
}

export function InflationClockCard() {
  const { data, isLoading } = useIndicatorSeries(INDICATOR_CODE, {
    source: PREFERRED_SOURCE,
    limit: 1,
    order: "desc",
  });

  if (isLoading) {
    return <Skeleton className="h-[200px] rounded-[10px]" />;
  }

  const latest = data?.points?.[0];
  if (!latest) {
    return null;
  }

  const monthlyRate = Number.parseFloat(latest.value);
  const since = startOfCurrentMonth().getTime();
  const ratePerSecond = monthlyRateToPerSecond(monthlyRate, daysInMonth());

  return (
    <Card
      title="Inflación en vivo"
      subtitle="Inflación acumulada del mes en curso, proyectada al ritmo del último IPC oficial"
      actions={<Badge tone="gap">Proyección</Badge>}
      footer={
        <Link
          href={`/indicador/${INDICATOR_CODE}`}
          style={{ fontSize: "0.8125rem", fontWeight: 600 }}
        >
          Ver la serie del IPC con eventos políticos →
        </Link>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
          <LiveCounter
            baseValue={0}
            since={since}
            ratePerSecond={ratePerSecond}
            format={formatAccumulated}
            unit="% acumulado"
            style={{ fontSize: "2.5rem", fontWeight: 600, lineHeight: 1.05, color: "var(--gap-accent)" }}
          />
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
          Proyección lineal sobre el último IPC mensual del INDEC ({formatNumberAR(monthlyRate, 1)}% en{" "}
          {formatDateAR(latest.date)}), repartido en los días del mes. No es una medición: el dato real
          se publica a mes vencido. Fuente: {sourceLabel(latest.source)}.
        </p>
      </div>
    </Card>
  );
}
