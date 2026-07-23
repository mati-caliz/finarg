"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useLegLatest } from "@/hooks/useLabrecha";
import { BRECHAS, computeGap } from "@/lib/brechas";
import {
  INDICATOR_FAMILY_LABELS,
  formatDateAR,
  getIndicatorMeta,
  sourceLabel,
} from "@/lib/indicators";
import Link from "next/link";

const MONO = "var(--font-jb-mono)";

const LEGS = BRECHAS.flatMap((brecha) => brecha.legs.map((leg) => ({ code: leg.code, source: leg.source })));

interface RankedBrecha {
  id: string;
  familyLabel: string;
  label: string;
  legALabel: string;
  legBLabel: string;
  valueAText: string;
  valueBText: string;
  sourcesText: string;
  formattedGap: string;
  gapMagnitude: number;
  barWidth: number;
}

export function BrechaRankList() {
  const queries = useLegLatest(LEGS);
  const isLoading = queries.some((query) => query.isLoading);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {BRECHAS.map((brecha) => (
          <Skeleton key={brecha.id} className="h-[110px] rounded-[10px]" />
        ))}
      </div>
    );
  }

  const ranked: RankedBrecha[] = [];
  BRECHAS.forEach((def, index) => {
    const pointA = queries[index * 2]?.data?.points?.[0];
    const pointB = queries[index * 2 + 1]?.data?.points?.[0];
    if (!pointA || !pointB) {
      return;
    }
    const valueA = Number.parseFloat(pointA.value);
    const valueB = Number.parseFloat(pointB.value);
    if (!Number.isFinite(valueA) || !Number.isFinite(valueB)) {
      return;
    }
    const gap = computeGap(def, valueA, valueB);
    const family = getIndicatorMeta(def.legs[0].code)?.family;
    ranked.push({
      id: def.id,
      familyLabel: family ? INDICATOR_FAMILY_LABELS[family] : "Indicador",
      label: def.label,
      legALabel: def.legs[0].label,
      legBLabel: def.legs[1].label,
      valueAText: def.format(valueA),
      valueBText: def.format(valueB),
      sourcesText: `${sourceLabel(def.legs[0].source)} · ${sourceLabel(def.legs[1].source)} · ${formatDateAR(pointA.date > pointB.date ? pointA.date : pointB.date)}`,
      formattedGap: gap.formattedGap,
      gapMagnitude: Math.abs(gap.gapPct),
      barWidth: Math.min(Math.abs(gap.gapPct), 100),
    });
  });
  ranked.sort((a, b) => b.gapMagnitude - a.gapMagnitude);

  if (ranked.length === 0) {
    return (
      <p style={{ fontFamily: "var(--font-serif)", color: "var(--ink2)" }}>
        No hay datos suficientes para calcular las brechas en este momento.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <span style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--ink3)" }}>
        {ranked.length} brechas activas · ordenadas por magnitud
      </span>
      {ranked.map((brecha, index) => {
        const strong = index < 3;
        return (
          <Link
            key={brecha.id}
            href={`#${brecha.id}`}
            className="lb-brecha-row"
            style={{
              alignItems: "center",
              gap: 24,
              background: "var(--raise)",
              border: `1px solid ${strong ? "var(--brecha-ln)" : "var(--line)"}`,
              borderRadius: 10,
              padding: "22px 26px",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: "1.25rem",
                color: strong ? "var(--brecha)" : "var(--ink3)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <div style={{ fontFamily: MONO, fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink3)", marginBottom: 7 }}>
                {brecha.familyLabel}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.375rem", letterSpacing: "-0.015em", color: "var(--ink)" }}>
                {brecha.label}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: "0.72rem", marginBottom: 8, gap: 10 }}>
                <span style={{ color: "var(--ink2)" }}>
                  {brecha.legALabel} <b style={{ color: "var(--ink)" }}>{brecha.valueAText}</b>
                </span>
                <span style={{ color: "var(--ink2)" }}>
                  {brecha.legBLabel} <b style={{ color: "var(--ink)" }}>{brecha.valueBText}</b>
                </span>
              </div>
              <div style={{ height: 8, background: "var(--line2)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
                <div style={{ width: `${brecha.barWidth}%`, height: "100%", background: "var(--brecha)", opacity: 0.9 }} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: "0.62rem", color: "var(--ink3)", marginTop: 6 }}>
                {brecha.sourcesText}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "2rem", color: "var(--brecha)", fontVariantNumeric: "tabular-nums" }}>
                {brecha.formattedGap}
              </div>
              <div style={{ fontFamily: MONO, fontSize: "0.62rem", color: "var(--ink3)" }}>de brecha</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
