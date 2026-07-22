"use client";

import { Badge, Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useLegLatest } from "@/hooks/useLabrecha";
import { BRECHAS, type BrechaDef, computeGap } from "@/lib/brechas";
import { formatDateAR, sourceLabel } from "@/lib/indicators";
import Link from "next/link";

const ALL_LEGS = BRECHAS.flatMap((brecha) => brecha.legs);

interface LegValue {
  value: number;
  date: string;
  source: string;
}

interface RankedBrecha {
  def: BrechaDef;
  legA: LegValue;
  legB: LegValue;
  gapPct: number;
  formattedGap: string;
}

function LegChip({ label, leg, format }: { label: string; leg: LegValue; format: (value: number) => string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", fontWeight: 600 }}>
        {label}
      </span>
      <span className="num" style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.1 }}>
        {format(leg.value)}
      </span>
      <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>
        {sourceLabel(leg.source)} · {formatDateAR(leg.date)}
      </span>
    </div>
  );
}

export function IndiceBrechaCard() {
  const results = useLegLatest(ALL_LEGS);
  const isLoading = results.some((result) => result.isLoading);

  if (isLoading) {
    return <Skeleton className="h-[320px] rounded-[10px]" />;
  }

  const legValues: (LegValue | null)[] = results.map((result) => {
    const point = result.data?.points?.[0];
    if (!point) {
      return null;
    }
    const value = Number.parseFloat(point.value);
    if (!Number.isFinite(value)) {
      return null;
    }
    return { value, date: point.date, source: point.source };
  });

  const ranked: RankedBrecha[] = [];
  let cursor = 0;
  for (const def of BRECHAS) {
    const legA = legValues[cursor];
    const legB = legValues[cursor + 1];
    cursor += 2;
    if (!legA || !legB) {
      continue;
    }
    const gap = computeGap(def, legA.value, legB.value);
    ranked.push({ def, legA, legB, gapPct: gap.gapPct, formattedGap: gap.formattedGap });
  }
  ranked.sort((first, second) => Math.abs(second.gapPct) - Math.abs(first.gapPct));

  if (ranked.length === 0) {
    return null;
  }

  return (
    <Card
      title="Índice de brecha"
      subtitle="Cuánto se separan hoy las mediciones de un mismo fenómeno, ordenadas por magnitud"
      actions={<Badge tone="gap">Comparador</Badge>}
      footer={
        <Link href="/brechas" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
          Ver todas las brechas con su serie histórica →
        </Link>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ranked.map((item) => (
          <Link
            key={item.def.id}
            href={`/brechas#${item.def.id}`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 14px",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-inset)",
              textDecoration: "none",
              color: "var(--text-body)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: "1 1 240px", minWidth: 0 }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{item.def.label}</span>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <LegChip label={item.def.legs[0].label} leg={item.legA} format={item.def.format} />
                <LegChip label={item.def.legs[1].label} leg={item.legB} format={item.def.format} />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
                flexShrink: 0,
              }}
            >
              <span
                className="num"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "var(--brecha-strong)",
                }}
              >
                {item.formattedGap}
              </span>
              <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>brecha actual</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
