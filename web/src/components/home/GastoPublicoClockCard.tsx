"use client";

import Link from "next/link";
import { Badge, Card, LiveCounter } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import { formatBillonesAR, formatDateAR, sourceLabel } from "@/lib/indicators";
import { annualValueToPerSecond, startOfMonthAfter } from "@/lib/liveCounter";

const CURRENT_CODE = "gasto_corriente";
const CAPITAL_CODE = "gasto_capital";
const PREFERRED_SOURCE = "datosgobar";
const TRAILING_MONTHS = 24;
const MONTHS_IN_YEAR = 12;
const CLOCK_DECIMALS = 3;

interface MonthlyTotal {
  date: string;
  total: number;
}

function formatGasto(valueInMillones: number): string {
  return formatBillonesAR(valueInMillones, CLOCK_DECIMALS);
}

function combineMonthlyTotals(
  current: { date: string; value: string }[],
  capital: { date: string; value: string }[],
): MonthlyTotal[] {
  const capitalByDate = new Map(capital.map((point) => [point.date, Number.parseFloat(point.value)]));
  return current
    .filter((point) => capitalByDate.has(point.date))
    .map((point) => ({
      date: point.date,
      total: Number.parseFloat(point.value) + (capitalByDate.get(point.date) ?? 0),
    }));
}

export function GastoPublicoClockCard() {
  const current = useIndicatorSeries(CURRENT_CODE, {
    source: PREFERRED_SOURCE,
    limit: TRAILING_MONTHS,
    order: "desc",
  });
  const capital = useIndicatorSeries(CAPITAL_CODE, {
    source: PREFERRED_SOURCE,
    limit: TRAILING_MONTHS,
    order: "desc",
  });

  if (current.isLoading || capital.isLoading) {
    return <Skeleton className="h-[200px] rounded-[10px]" />;
  }

  const monthly = combineMonthlyTotals(current.data?.points ?? [], capital.data?.points ?? []);
  const latest = monthly[0];
  if (!latest || monthly.length < 2) {
    return null;
  }

  const trailing = monthly.slice(0, MONTHS_IN_YEAR);
  const trailingSum = trailing.reduce((sum, month) => sum + month.total, 0);
  const annualRunRate = (trailingSum / trailing.length) * MONTHS_IN_YEAR;

  const latestDate = new Date(latest.date);
  const currentYear = latestDate.getFullYear();
  const accumulatedThisYear = monthly
    .filter((month) => new Date(month.date).getFullYear() === currentYear)
    .reduce((sum, month) => sum + month.total, 0);

  const since = startOfMonthAfter(latestDate).getTime();
  const ratePerSecond = annualValueToPerSecond(annualRunRate);

  return (
    <Card
      title="Gasto público en vivo"
      subtitle={`Gasto del Sector Público Nacional acumulado en ${currentYear}, proyectado al ritmo de los últimos 12 meses`}
      actions={<Badge tone="gap">Proyección</Badge>}
      footer={
        <Link href={`/indicador/${CURRENT_CODE}`} style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
          Ver la serie de gasto corriente con eventos políticos →
        </Link>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <LiveCounter
          baseValue={accumulatedThisYear}
          since={since}
          ratePerSecond={ratePerSecond}
          format={formatGasto}
          style={{ fontSize: "2.5rem", fontWeight: 600, lineHeight: 1.05, color: "var(--gap-accent)" }}
        />
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
          Gasto corriente + de capital real hasta {formatDateAR(latest.date)} ({formatBillonesAR(
            accumulatedThisYear,
          )}
          {" "}en lo que va de {currentYear}), proyectado desde entonces al ritmo promedio de los últimos
          12 meses. No es una medición: la ejecución se publica a mes vencido. Fuente:{" "}
          {sourceLabel(PREFERRED_SOURCE)}, Secretaría de Hacienda.
        </p>
      </div>
    </Card>
  );
}
