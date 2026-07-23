"use client";

import { Badge, Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import {
  MILLONES_POR_BILLON,
  formatBillonesAR,
  formatDateAR,
  formatNumberAR,
} from "@/lib/indicators";

const SOURCE = "datosgobar";
const MONTHS_WINDOW = 12;
const MONTH_ABBREVIATIONS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

function monthAbbreviation(isoDate: string): string {
  const monthNumber = Number.parseInt(isoDate.slice(5, 7), 10);
  return MONTH_ABBREVIATIONS[monthNumber - 1] ?? isoDate;
}

function signedBillonesCompact(valueInMillones: number): string {
  const magnitude = formatNumberAR(Math.abs(valueInMillones) / MILLONES_POR_BILLON, 1);
  return valueInMillones >= 0 ? `+${magnitude}` : `−${magnitude}`;
}

function countLeadingSurplus(valuesDesc: number[]): number {
  let streak = 0;
  for (const value of valuesDesc) {
    if (value <= 0) {
      break;
    }
    streak += 1;
  }
  return streak;
}

function signedBillones(valueInMillones: number): string {
  const formatted = formatBillonesAR(Math.abs(valueInMillones));
  return valueInMillones >= 0 ? `+${formatted}` : `−${formatted}`;
}

export function PromesometroFiscalCard() {
  const financiero = useIndicatorSeries("resultado_financiero", {
    source: SOURCE,
    limit: MONTHS_WINDOW,
    order: "desc",
  });
  const primario = useIndicatorSeries("resultado_primario", {
    source: SOURCE,
    limit: 1,
    order: "desc",
  });

  if (financiero.isLoading || primario.isLoading) {
    return <Skeleton className="h-[200px] rounded-[10px]" />;
  }

  const financieroPoints = financiero.data?.points ?? [];
  const primarioPoint = primario.data?.points?.[0];
  if (financieroPoints.length === 0 || !primarioPoint) {
    return null;
  }

  const financieroValuesDesc = financieroPoints.map((point) => Number.parseFloat(point.value));
  const surplusStreak = countLeadingSurplus(financieroValuesDesc);
  const latestFinanciero = financieroPoints[0];
  const latestFinancieroValue = financieroValuesDesc[0];
  const primarioValue = Number.parseFloat(primarioPoint.value);
  const monthsAscending = [...financieroPoints].reverse();

  return (
    <Card
      title="Promesómetro fiscal"
      subtitle="Superávit financiero: la meta de equilibrio fiscal que el gobierno puso como bandera"
      actions={
        <Badge tone={surplusStreak > 0 ? "pos" : "neg"}>
          {surplusStreak > 0 ? "En meta" : "Fuera de meta"}
        </Badge>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div
            className="num"
            style={{
              fontSize: "2.25rem",
              fontWeight: 600,
              lineHeight: 1.05,
              color: surplusStreak > 0 ? "var(--pos)" : "var(--neg)",
            }}
          >
            {surplusStreak}
            <span
              style={{ fontSize: "1rem", color: "var(--text-muted)", marginLeft: 8, fontWeight: 500 }}
            >
              {surplusStreak === 1 ? "mes" : "meses"} de superávit financiero
            </span>
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 2 }}>
            Racha vigente al {formatDateAR(latestFinanciero.date)}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {monthsAscending.map((point) => {
              const value = Number.parseFloat(point.value);
              const positive = value > 0;
              return (
                <div
                  key={point.date}
                  title={`${formatDateAR(point.date)}: ${signedBillones(value)}`}
                  style={{
                    flex: "1 1 0",
                    minWidth: 34,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span
                    className="num"
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      color: positive ? "var(--pos)" : "var(--neg)",
                    }}
                  >
                    {signedBillonesCompact(value)}
                  </span>
                  <div
                    style={{
                      alignSelf: "stretch",
                      height: 28,
                      borderRadius: "var(--radius-sm)",
                      background: positive ? "var(--pos-bg)" : "var(--neg-bg)",
                      borderBottom: `3px solid ${positive ? "var(--pos)" : "var(--neg)"}`,
                    }}
                  />
                  <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>
                    {monthAbbreviation(point.date)}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: "0.625rem", color: "var(--text-muted)", marginTop: 6 }}>
            Resultado financiero por mes, en billones de pesos
          </div>
        </div>

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
              Resultado financiero del mes
            </div>
            <div
              className="num"
              style={{
                fontSize: "1.375rem",
                fontWeight: 600,
                marginTop: 4,
                color: latestFinancieroValue >= 0 ? "var(--pos)" : "var(--neg)",
              }}
            >
              {signedBillones(latestFinancieroValue)}
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
              Resultado primario del mes
            </div>
            <div
              className="num"
              style={{
                fontSize: "1.375rem",
                fontWeight: 600,
                marginTop: 4,
                color: primarioValue >= 0 ? "var(--pos)" : "var(--neg)",
              }}
            >
              {signedBillones(primarioValue)}
            </div>
          </div>
        </div>

        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          Fuente: Secretaría de Hacienda (IMIG / base caja) vía datos.gob.ar · {" "}
          {formatDateAR(primarioPoint.date)}
        </div>
      </div>
    </Card>
  );
}
