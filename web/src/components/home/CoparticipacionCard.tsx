"use client";

import { Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoparticipacion } from "@/hooks/useLabrecha";
import { formatNumberAR } from "@/lib/indicators";

export function CoparticipacionCard() {
  const { data, isLoading } = useCoparticipacion();

  if (isLoading) {
    return <Skeleton className="h-[420px] rounded-[10px]" />;
  }

  const shares = data ?? [];
  if (shares.length === 0) {
    return null;
  }

  const maxShare = Math.max(...shares.map((share) => Number.parseFloat(share.share_pct)));

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
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {shares.map((share) => {
          const pct = Number.parseFloat(share.share_pct);
          return (
            <div key={share.province} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 130,
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {share.province}
              </span>
              <div style={{ flex: 1, height: 16, background: "var(--surface-inset)", borderRadius: 4 }}>
                <div
                  style={{
                    width: `${maxShare > 0 ? (pct / maxShare) * 100 : 0}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: "var(--serie-1)",
                  }}
                />
              </div>
              <span
                className="num"
                style={{ width: 52, fontSize: "0.75rem", fontWeight: 600, textAlign: "right", flexShrink: 0 }}
              >
                {formatNumberAR(pct, 1)}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
