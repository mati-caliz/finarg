"use client";

import { Card, Sparkline } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import type { IndicatorSeries } from "@/lib/labrechaApi";
import { formatBillonesAR, formatDateAR, formatNumberAR } from "@/lib/indicators";

const SOURCE = "datosgobar";
const WINDOW = 13;

interface SubsidyRow {
  label: string;
  code: string;
  color: string;
}

const ROWS: SubsidyRow[] = [
  { label: "Energía", code: "subsidios_energia", color: "var(--serie-1)" },
  { label: "Transporte", code: "subsidios_transporte", color: "var(--serie-2)" },
];

function signedPct(value: number): string {
  return `${value >= 0 ? "+" : "−"}${formatNumberAR(Math.abs(value), 0)}%`;
}

function seriesValues(series: IndicatorSeries | undefined): number[] {
  const points = series?.points ?? [];
  return [...points].reverse().map((point) => Number.parseFloat(point.value));
}

export function TermometroSubsidiosCard() {
  const energia = useIndicatorSeries("subsidios_energia", { source: SOURCE, limit: WINDOW, order: "desc" });
  const transporte = useIndicatorSeries("subsidios_transporte", { source: SOURCE, limit: WINDOW, order: "desc" });

  if (energia.isLoading || transporte.isLoading) {
    return <Skeleton className="h-[220px] rounded-[10px]" />;
  }

  const byCode: Record<string, IndicatorSeries | undefined> = {
    subsidios_energia: energia.data,
    subsidios_transporte: transporte.data,
  };
  const latestDate = energia.data?.points?.[0]?.date;
  if (!latestDate) {
    return null;
  }

  const total = ROWS.reduce((sum, row) => {
    const value = byCode[row.code]?.points?.[0];
    return sum + (value ? Number.parseFloat(value.value) : 0);
  }, 0);

  return (
    <Card
      title="Termómetro de subsidios"
      subtitle="Cuánto gasta el Estado por mes en subsidiar energía y transporte"
      footer={
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          Subsidios económicos del Sector Público Nacional (IMIG, base caja). Fuente: Secretaría de
          Hacienda vía datos.gob.ar · {formatDateAR(latestDate)}. Valores nominales (no descuentan
          inflación); la caída real es mayor.
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total del mes</div>
          <div className="num" style={{ fontSize: "1.875rem", fontWeight: 600, lineHeight: 1.05 }}>
            {formatBillonesAR(total)}
          </div>
        </div>

        {ROWS.map((row) => {
          const series = byCode[row.code];
          const points = series?.points ?? [];
          if (points.length === 0) {
            return null;
          }
          const latest = Number.parseFloat(points[0].value);
          const yearAgo = points[points.length - 1]
            ? Number.parseFloat(points[points.length - 1].value)
            : undefined;
          const variation =
            yearAgo !== undefined && yearAgo !== 0 ? ((latest - yearAgo) / yearAgo) * 100 : undefined;
          return (
            <div key={row.code} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{ width: 10, height: 10, borderRadius: 3, background: row.color, flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {row.label}
                </div>
                <div className="num" style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  {formatBillonesAR(latest)}
                </div>
              </div>
              <Sparkline data={seriesValues(series)} width={80} height={32} fill />
              {variation !== undefined && (
                <span
                  className="num"
                  style={{ width: 56, textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}
                >
                  {signedPct(variation)}
                  <span style={{ display: "block", fontSize: "0.5625rem", fontWeight: 500 }}>ia. nom.</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
