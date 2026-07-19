"use client";

import { Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import { formatBillonesAR, formatDateAR, formatNumberAR } from "@/lib/indicators";

const SOURCE = "bcra";
const STOCK_WINDOW = 30;

function signedPct(value: number): string {
  const formatted = formatNumberAR(Math.abs(value), 1);
  return `${value >= 0 ? "+" : "−"}${formatted}%`;
}

export function RadarCreditoCard() {
  const personales = useIndicatorSeries("tasa_prestamos_personales", { source: SOURCE, limit: 1, order: "desc" });
  const adelantos = useIndicatorSeries("tasa_adelantos_cuenta_corriente", { source: SOURCE, limit: 1, order: "desc" });
  const stock = useIndicatorSeries("prestamos_sector_privado", { source: SOURCE, limit: STOCK_WINDOW, order: "desc" });

  if (personales.isLoading || adelantos.isLoading || stock.isLoading) {
    return <Skeleton className="h-[200px] rounded-[10px]" />;
  }

  const personalesPoint = personales.data?.points?.[0];
  const adelantosPoint = adelantos.data?.points?.[0];
  const stockPoints = stock.data?.points ?? [];
  if (!personalesPoint || !adelantosPoint || stockPoints.length === 0) {
    return null;
  }

  const stockLatest = Number.parseFloat(stockPoints[0].value);
  const stockOldest = Number.parseFloat(stockPoints[stockPoints.length - 1].value);
  const stockChange = stockOldest !== 0 ? ((stockLatest - stockOldest) / stockOldest) * 100 : undefined;

  return (
    <Card
      title="Radar de crédito"
      subtitle="A qué costo se presta y cuánto crédito llega al sector privado"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <div
            style={{
              flex: "1 1 160px",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
              background: "var(--surface-inset)",
            }}
          >
            <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Préstamos personales
            </div>
            <div className="num" style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: 4 }}>
              {formatNumberAR(Number.parseFloat(personalesPoint.value), 1)}
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginLeft: 4 }}>% TNA</span>
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 2 }}>
              {formatDateAR(personalesPoint.date)}
            </div>
          </div>
          <div
            style={{
              flex: "1 1 160px",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
              background: "var(--surface-inset)",
            }}
          >
            <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Adelantos en cuenta corriente
            </div>
            <div className="num" style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: 4 }}>
              {formatNumberAR(Number.parseFloat(adelantosPoint.value), 1)}
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginLeft: 4 }}>% TNA</span>
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 2 }}>
              {formatDateAR(adelantosPoint.date)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--surface-inset)",
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            Crédito al sector privado
          </span>
          <span className="num" style={{ fontSize: "1.125rem", fontWeight: 600 }}>
            {formatBillonesAR(stockLatest)}
          </span>
          {stockChange !== undefined && (
            <span className="num" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {signedPct(stockChange)} en ~{STOCK_WINDOW} días (nominal)
            </span>
          )}
        </div>

        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Fuente: BCRA · {formatDateAR(stockPoints[0].date)}. La variación del stock es nominal (no
          descuenta inflación). El BCRA no publica la morosidad por API: queda pendiente para cuando se
          sume el Informe sobre Bancos.
        </div>
      </div>
    </Card>
  );
}
