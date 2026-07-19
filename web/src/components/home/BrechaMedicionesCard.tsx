"use client";

import { Badge, Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSources } from "@/hooks/useLabrecha";
import { formatDateAR, formatNumberAR, sourceLabel } from "@/lib/indicators";
import Link from "next/link";

const INDICATOR_CODE = "reservas_internacionales";
const SERIE_COLORS = ["var(--serie-1)", "var(--serie-2)"];

export function BrechaMedicionesCard() {
  const { data, isLoading } = useIndicatorSources(INDICATOR_CODE);

  if (isLoading) {
    return <Skeleton className="h-[220px] rounded-[10px]" />;
  }

  const sources = (data ?? []).slice(0, 2);
  if (sources.length < 2) {
    return null;
  }

  const values = sources.map((source) => Number.parseFloat(source.latest_value));
  const gap = Math.abs(values[0] - values[1]);
  const base = Math.max(...values);
  const gapPct = base !== 0 ? (gap / base) * 100 : 0;

  return (
    <Card
      title="La brecha entre mediciones"
      subtitle="Reservas internacionales según distintas fuentes"
      actions={<Badge tone="gap">Comparador</Badge>}
      footer={
        <Link
          href={`/indicador/${INDICATOR_CODE}`}
          style={{ fontSize: "0.8125rem", fontWeight: 600 }}
        >
          Ver la serie completa con eventos políticos →
        </Link>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {sources.map((source, index) => (
            <div
              key={source.source}
              style={{
                flex: "1 1 160px",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                background: "var(--surface-inset)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.6875rem",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: SERIE_COLORS[index],
                  }}
                />
                {sourceLabel(source.source)}
              </div>
              <div
                className="num"
                style={{ fontSize: "1.625rem", fontWeight: 600, lineHeight: 1.15, marginTop: 4 }}
              >
                {formatNumberAR(values[index])}
                <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginLeft: 4 }}>
                  USD M
                </span>
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 2 }}>
                Último dato: {formatDateAR(source.last_date)}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--gap-bg)",
            color: "var(--gap-accent)",
          }}
        >
          <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>La brecha es de</span>
          <span className="num" style={{ fontSize: "1.125rem", fontWeight: 600 }}>
            USD {formatNumberAR(gap)} M
          </span>
          <span className="num" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
            ({formatNumberAR(gapPct, 1)}%)
          </span>
        </div>
      </div>
    </Card>
  );
}
