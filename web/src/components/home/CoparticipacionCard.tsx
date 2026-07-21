"use client";

import { Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoparticipacion } from "@/hooks/useLabrecha";
import { PROVINCE_CENTROIDS, projectCentroid } from "@/lib/argentina";
import { formatNumberAR } from "@/lib/indicators";

const MAP_WIDTH = 190;
const MAP_HEIGHT = 430;
const MIN_RADIUS = 3;
const MAX_RADIUS = 17;
const LABEL_THRESHOLD = 4;

export function CoparticipacionCard() {
  const { data, isLoading } = useCoparticipacion();

  if (isLoading) {
    return <Skeleton className="h-[460px] rounded-[10px]" />;
  }

  const shares = data ?? [];
  if (shares.length === 0) {
    return null;
  }

  const maxShare = Math.max(...shares.map((share) => Number.parseFloat(share.share_pct)));

  const bubbles = shares
    .map((share) => {
      const centroid = PROVINCE_CENTROIDS[share.province];
      if (!centroid) {
        return null;
      }
      const pct = Number.parseFloat(share.share_pct);
      const point = projectCentroid(centroid, MAP_WIDTH, MAP_HEIGHT);
      const radius = MIN_RADIUS + Math.sqrt(pct / maxShare) * (MAX_RADIUS - MIN_RADIUS);
      return { province: share.province, pct, radius, x: point.x, y: point.y };
    })
    .filter((bubble): bubble is NonNullable<typeof bubble> => bubble !== null)
    .sort((first, second) => second.radius - first.radius);

  return (
    <Card
      title="Distribución de la coparticipación"
      subtitle="De cada $100 que la Nación coparticipa a las provincias, cuánto le toca a cada jurisdicción"
      footer={
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          Coeficientes de distribución secundaria de vigencia estable (Ley 23.548). Fuente: Comisión
          Federal de Impuestos (CFI). Es el reparto estructural por ley, no las transferencias efectivas
          de cada mes.
        </span>
      }
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          role="img"
          aria-label="Mapa de Argentina: tamaño de cada burbuja según la tajada de coparticipación de la provincia"
          style={{ flexShrink: 0, maxWidth: "100%" }}
        >
          {bubbles.map((bubble) => (
            <g key={bubble.province}>
              <circle
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.radius}
                fill="var(--serie-1)"
                fillOpacity={0.55}
                stroke="var(--serie-1)"
                strokeWidth={1}
              >
                <title>{`${bubble.province}: ${formatNumberAR(bubble.pct, 1)}%`}</title>
              </circle>
              {bubble.pct >= LABEL_THRESHOLD && (
                <text
                  x={bubble.x}
                  y={bubble.y + 3}
                  textAnchor="middle"
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    fill: "var(--text-body)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatNumberAR(bubble.pct, 0)}
                </text>
              )}
            </g>
          ))}
        </svg>

        <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 5 }}>
          {shares.map((share) => {
            const pct = Number.parseFloat(share.share_pct);
            return (
              <div key={share.province} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 118,
                    fontSize: "0.6875rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {share.province}
                </span>
                <div style={{ flex: 1, height: 12, background: "var(--surface-inset)", borderRadius: 3 }}>
                  <div
                    style={{
                      width: `${maxShare > 0 ? (pct / maxShare) * 100 : 0}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: "var(--serie-1)",
                    }}
                  />
                </div>
                <span
                  className="num"
                  style={{ width: 44, fontSize: "0.6875rem", fontWeight: 600, textAlign: "right", flexShrink: 0 }}
                >
                  {formatNumberAR(pct, 1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
