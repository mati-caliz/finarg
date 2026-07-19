"use client";

import type { CSSProperties, ReactNode } from "react";
import { Card, VariationBadge } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import { formatBillonesAR, formatDateAR, formatNumberAR } from "@/lib/indicators";

const BASE_MONETARIA_SOURCE = "datosgobar";
const TASAS_SOURCE = "bcra";
const RATE_LABEL = "Fuente: BCRA";

interface MetricInsetProps {
  label: string;
  value: ReactNode;
  detail: ReactNode;
  footer: string;
}

const insetStyle: CSSProperties = {
  flex: "1 1 180px",
  border: "1px solid var(--border-1)",
  borderRadius: "var(--radius-md)",
  padding: "12px 14px",
  background: "var(--surface-inset)",
};

function MetricInset({ label, value, detail, footer }: MetricInsetProps) {
  return (
    <div style={insetStyle}>
      <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", fontWeight: 600 }}>
        {label}
      </div>
      <div
        className="num"
        style={{ fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.15, marginTop: 4 }}
      >
        {value}
      </div>
      <div style={{ marginTop: 4 }}>{detail}</div>
      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 4 }}>{footer}</div>
    </div>
  );
}

export function MonitorBcraCard() {
  const baseMonetaria = useIndicatorSeries("base_monetaria", {
    source: BASE_MONETARIA_SOURCE,
    limit: 2,
    order: "desc",
  });
  const tamar = useIndicatorSeries("tasa_tamar", {
    source: TASAS_SOURCE,
    limit: 1,
    order: "desc",
  });
  const plazoFijo = useIndicatorSeries("tasa_plazo_fijo", {
    source: TASAS_SOURCE,
    limit: 1,
    order: "desc",
  });

  if (baseMonetaria.isLoading || tamar.isLoading || plazoFijo.isLoading) {
    return <Skeleton className="h-[200px] rounded-[10px]" />;
  }

  const basePoints = baseMonetaria.data?.points ?? [];
  const tamarPoint = tamar.data?.points?.[0];
  const plazoFijoPoint = plazoFijo.data?.points?.[0];
  if (basePoints.length === 0 || !tamarPoint || !plazoFijoPoint) {
    return null;
  }

  const baseLatest = Number.parseFloat(basePoints[0].value);
  const basePrevious = basePoints[1] ? Number.parseFloat(basePoints[1].value) : undefined;
  const baseVariation =
    basePrevious !== undefined && basePrevious !== 0
      ? ((baseLatest - basePrevious) / basePrevious) * 100
      : undefined;

  return (
    <Card
      title="Monitor del BCRA"
      subtitle="Base monetaria y tasas de referencia del sistema financiero"
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <MetricInset
          label="Base monetaria"
          value={formatBillonesAR(baseLatest)}
          detail={
            baseVariation !== undefined ? (
              <VariationBadge value={baseVariation} goodWhen="down" period="mensual" />
            ) : null
          }
          footer={`${RATE_LABEL} · ${formatDateAR(basePoints[0].date)}`}
        />
        <MetricInset
          label="Tasa de referencia (TAMAR)"
          value={
            <>
              {formatNumberAR(Number.parseFloat(tamarPoint.value), 1)}
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginLeft: 4 }}>
                % TNA
              </span>
            </>
          }
          detail={null}
          footer={`${RATE_LABEL} · ${formatDateAR(tamarPoint.date)}`}
        />
        <MetricInset
          label="Plazo fijo minorista"
          value={
            <>
              {formatNumberAR(Number.parseFloat(plazoFijoPoint.value), 1)}
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginLeft: 4 }}>
                % TNA
              </span>
            </>
          }
          detail={null}
          footer={`${RATE_LABEL} · ${formatDateAR(plazoFijoPoint.date)}`}
        />
      </div>
    </Card>
  );
}
