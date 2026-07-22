"use client";

import {
  AnnotatedSeriesChart,
  Badge,
  Card,
  type ChartSeries,
  RangeSelector,
  SourceAttribution,
} from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries, usePoliticalEvents } from "@/hooks/useLabrecha";
import { BRECHA_BY_ID, computeGap } from "@/lib/brechas";
import { RANGE_MONTHS, SOURCE_METHODOLOGY, formatDateAR, sourceLabel } from "@/lib/indicators";
import {
  alignSources,
  eventsToChartEvents,
  parsePoints,
  rangeDateFrom,
  yearLabels,
} from "@/lib/series";
import { useState } from "react";

const RANGE_OPTIONS = ["6M", "1A", "5A", "Máx"];
const SERIE_COLORS = ["var(--serie-1)", "var(--serie-2)"];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BrechaComparison({ id }: { id: string }) {
  const [range, setRange] = useState("1A");
  const def = BRECHA_BY_ID[id];
  const dateFrom = rangeDateFrom(todayISO(), RANGE_MONTHS[range] ?? 12);

  const legA = def?.legs[0] ?? { code: "", source: "", label: "" };
  const legB = def?.legs[1] ?? { code: "", source: "", label: "" };
  const queryA = useIndicatorSeries(legA.code, { source: legA.source, order: "asc", date_from: dateFrom });
  const queryB = useIndicatorSeries(legB.code, { source: legB.source, order: "asc", date_from: dateFrom });
  const { data: eventsData } = usePoliticalEvents({ date_from: dateFrom, date_to: todayISO() });

  if (!def) {
    return null;
  }

  if (queryA.isLoading || queryB.isLoading) {
    return <Skeleton className="h-[360px] rounded-[10px]" />;
  }

  const pointsA = parsePoints(queryA.data?.points ?? []);
  const pointsB = parsePoints(queryB.data?.points ?? []);

  const aligned = alignSources([
    { source: legA.label, points: pointsA },
    { source: legB.label, points: pointsB },
  ]);
  const chartSeries: ChartSeries[] = aligned.lines.map((line, index) => ({
    name: line.source,
    color: SERIE_COLORS[index % SERIE_COLORS.length],
    data: line.data.map((value, position) => ({ t: formatDateAR(aligned.axis[position]), v: value })),
  }));
  const chartEvents = eventsToChartEvents(aligned.axis, eventsData ?? []);
  const xLabels = yearLabels(aligned.axis);
  const hasSeries = aligned.axis.length >= 2;

  const latestA = pointsA[pointsA.length - 1];
  const latestB = pointsB[pointsB.length - 1];
  const gap =
    latestA && latestB ? computeGap(def, latestA.value, latestB.value) : undefined;

  return (
    <Card
      title={def.label}
      subtitle={def.subtitle}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge tone="gap">Comparador</Badge>
          <RangeSelector options={RANGE_OPTIONS} active={range} onChange={setRange} />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {gap && latestA && latestB && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 20,
              padding: "12px 14px",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-md)",
              background: "var(--surface-inset)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                {legA.label}
              </span>
              <span className="num" style={{ fontSize: "1.375rem", fontWeight: 600, lineHeight: 1 }}>
                {def.format(latestA.value)}
              </span>
              <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>
                {sourceLabel(legA.source)} · {formatDateAR(latestA.date)}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                {legB.label}
              </span>
              <span className="num" style={{ fontSize: "1.375rem", fontWeight: 600, lineHeight: 1 }}>
                {def.format(latestB.value)}
              </span>
              <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>
                {sourceLabel(legB.source)} · {formatDateAR(latestB.date)}
              </span>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span
                className="num"
                style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1, color: "var(--brecha-strong)" }}
              >
                {gap.formattedGap}
              </span>
              <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>brecha actual</span>
            </div>
          </div>
        )}

        {hasSeries ? (
          <AnnotatedSeriesChart
            series={chartSeries}
            events={chartEvents}
            gapFill
            yFormat={(value) => def.format(value)}
            xLabels={xLabels}
            height={320}
          />
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
            No hay suficiente serie en el rango seleccionado para graficar esta brecha.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[legA, legB].map((leg) => (
            <SourceAttribution
              key={`${leg.code}-${leg.source}`}
              source={`${leg.label} — ${sourceLabel(leg.source)}`}
              note={SOURCE_METHODOLOGY[leg.source] ?? "Fuente oficial; ver publicación original."}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
