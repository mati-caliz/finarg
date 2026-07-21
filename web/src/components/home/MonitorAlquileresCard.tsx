"use client";

import { Badge, Card, Sparkline, VariationBadge } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries, useRentByBarrio } from "@/hooks/useLabrecha";
import { formatDateAR, formatMoneyAR, formatNumberAR } from "@/lib/indicators";

const ICL_SOURCE = "bcra";
const ICL_WINDOW = 380;
const RANKING_LIMIT = 10;

export function MonitorAlquileresCard() {
  const icl = useIndicatorSeries("icl", { source: ICL_SOURCE, limit: ICL_WINDOW, order: "desc" });
  const barrios = useRentByBarrio();

  if (icl.isLoading || barrios.isLoading) {
    return <Skeleton className="h-[360px] rounded-[10px]" />;
  }

  const iclPoints = icl.data?.points ?? [];
  const latestIcl = iclPoints[0];
  if (!latestIcl) {
    return null;
  }

  const iclValue = Number.parseFloat(latestIcl.value);
  const iclYearAgo = iclPoints[iclPoints.length - 1]
    ? Number.parseFloat(iclPoints[iclPoints.length - 1].value)
    : undefined;
  const iclVariation =
    iclYearAgo !== undefined && iclYearAgo !== 0 ? ((iclValue - iclYearAgo) / iclYearAgo) * 100 : undefined;
  const iclSpark = [...iclPoints].reverse().map((point) => Number.parseFloat(point.value));

  const ranking = (barrios.data ?? []).slice(0, RANKING_LIMIT);
  const maxPrice = ranking.length > 0 ? Number.parseFloat(ranking[0].price) : 0;
  const snapshotDate = ranking[0]?.date;

  return (
    <Card
      title="Monitor de alquileres"
      subtitle="El índice oficial por el que se ajustan los contratos, y la última foto por barrio"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Índice para Contratos de Locación (ICL)
            </div>
            <div className="num" style={{ fontSize: "2rem", fontWeight: 600, lineHeight: 1.05 }}>
              ×{formatNumberAR(iclValue, 1)}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 2 }}>
              vs. junio 2020 (base 1) · {formatDateAR(latestIcl.date)}
            </div>
            {iclVariation !== undefined && (
              <div style={{ marginTop: 6 }}>
                <VariationBadge value={iclVariation} goodWhen="down" period="interanual" />
              </div>
            )}
          </div>
          <Sparkline data={iclSpark} width={140} height={48} fill />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Alquiler de 2 ambientes por barrio
            </span>
            {snapshotDate && <Badge tone="neutral">Última foto: {formatDateAR(snapshotDate)}</Badge>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {ranking.map((row) => {
              const price = Number.parseFloat(row.price);
              return (
                <div key={row.barrio} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 120,
                      fontSize: "0.6875rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {row.barrio}
                  </span>
                  <div style={{ flex: 1, height: 12, background: "var(--surface-inset)", borderRadius: 3 }}>
                    <div
                      style={{
                        width: `${maxPrice > 0 ? (price / maxPrice) * 100 : 0}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: "var(--serie-2)",
                      }}
                    />
                  </div>
                  <span
                    className="num"
                    style={{ width: 72, fontSize: "0.6875rem", fontWeight: 600, textAlign: "right", flexShrink: 0 }}
                  >
                    {formatMoneyAR(price)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          ICL: BCRA (variable 40, base 30/6/2020=1), diario. Precios por barrio: Dirección Gral. de
          Estadísticas y Censos de CABA — es la última publicación disponible (2019), en pesos de esa
          fecha; sirve como referencia relativa entre barrios, no como valor actual.
        </div>
      </div>
    </Card>
  );
}
