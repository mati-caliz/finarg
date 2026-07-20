"use client";

import { Badge, Card, VariationBadge } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import { formatDateAR, formatNumberAR } from "@/lib/indicators";

const SOURCE = "iaraf";

interface LevelBreakdown {
  label: string;
  code: string;
  color: string;
}

const LEVELS: LevelBreakdown[] = [
  { label: "Nacionales", code: "tributos_nacionales", color: "var(--serie-1)" },
  { label: "Provinciales", code: "tributos_provinciales", color: "var(--serie-2)" },
  { label: "Municipales", code: "tributos_municipales", color: "var(--serie-3)" },
];

export function ImpuestometroCard() {
  const total = useIndicatorSeries("tributos_total", { source: SOURCE, limit: 2, order: "desc" });
  const nacionales = useIndicatorSeries("tributos_nacionales", { source: SOURCE, limit: 1, order: "desc" });
  const provinciales = useIndicatorSeries("tributos_provinciales", { source: SOURCE, limit: 1, order: "desc" });
  const municipales = useIndicatorSeries("tributos_municipales", { source: SOURCE, limit: 1, order: "desc" });

  const byCode: Record<string, number | undefined> = {
    tributos_nacionales: nacionales.data?.points?.[0]
      ? Number.parseFloat(nacionales.data.points[0].value)
      : undefined,
    tributos_provinciales: provinciales.data?.points?.[0]
      ? Number.parseFloat(provinciales.data.points[0].value)
      : undefined,
    tributos_municipales: municipales.data?.points?.[0]
      ? Number.parseFloat(municipales.data.points[0].value)
      : undefined,
  };

  if (total.isLoading || nacionales.isLoading || provinciales.isLoading || municipales.isLoading) {
    return <Skeleton className="h-[220px] rounded-[10px]" />;
  }

  const totalPoints = total.data?.points ?? [];
  const latest = totalPoints[0];
  if (!latest) {
    return null;
  }

  const totalValue = Number.parseFloat(latest.value);
  const previousValue = totalPoints[1] ? Number.parseFloat(totalPoints[1].value) : undefined;
  const delta = previousValue !== undefined ? totalValue - previousValue : undefined;
  const breakdownTotal = LEVELS.reduce((sum, level) => sum + (byCode[level.code] ?? 0), 0);

  return (
    <Card
      title="Impuestómetro"
      subtitle="Cuántos tributos distintos conviven en Argentina, entre Nación, provincias y municipios"
      actions={<Badge tone="gap">Presión fiscal</Badge>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <div
            className="num"
            style={{ fontSize: "3.25rem", fontWeight: 700, lineHeight: 1, color: "var(--gap-accent)" }}
          >
            {formatNumberAR(totalValue)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 6 }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              tributos vigentes
            </span>
            {delta !== undefined && (
              <VariationBadge
                value={delta}
                goodWhen="down"
                suffix=" tributos"
                period="vs. año previo"
              />
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {LEVELS.map((level) => {
            const value = byCode[level.code];
            if (value === undefined) {
              return null;
            }
            return (
              <div key={level.code} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{level.label}</span>
                  <span className="num" style={{ fontWeight: 600 }}>
                    {formatNumberAR(value)}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "var(--surface-inset)" }}>
                  <div
                    style={{
                      width: `${breakdownTotal > 0 ? (value / breakdownTotal) * 100 : 0}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: level.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Solo 10 tributos concentran el 92% de la recaudación (el IVA, el 27%). Fuente: IARAF,
          Vademécum Tributario · {formatDateAR(latest.date)}.
        </div>
      </div>
    </Card>
  );
}
