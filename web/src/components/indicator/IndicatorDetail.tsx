"use client";

import {
  AnnotatedSeriesChart,
  Badge,
  Card,
  type ChartSeries,
  DataTable,
  type DataTableRow,
  RangeSelector,
  SourceAttribution,
  VariationBadge,
} from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useIndicatorSeriesMulti,
  useIndicatorSources,
  usePoliticalEvents,
} from "@/hooks/useLabrecha";
import {
  RANGE_MONTHS,
  SOURCE_METHODOLOGY,
  formatDateAR,
  getIndicatorDisplay,
  sourceLabel,
} from "@/lib/indicators";
import { BRECHAS } from "@/lib/brechas";
import {
  alignSources,
  eventsToChartEvents,
  parsePoints,
  rangeDateFrom,
  yearLabels,
} from "@/lib/series";
import Link from "next/link";
import { useState } from "react";

const RANGE_OPTIONS = ["6M", "1A", "5A", "Máx"];
const SERIE_COLORS = ["var(--serie-1)", "var(--serie-2)", "var(--serie-3)"];

interface IndicatorDetailProps {
  code: string;
}

export function IndicatorDetail({ code }: IndicatorDetailProps) {
  const [range, setRange] = useState("1A");
  const indicator = getIndicatorDisplay(code);
  const { data: sourcesData, isLoading: loadingSources } = useIndicatorSources(code);

  const sources = sourcesData ?? [];
  const ordered = [...sources].sort((a, b) => {
    if (a.source === indicator.preferredSource) {
      return -1;
    }
    if (b.source === indicator.preferredSource) {
      return 1;
    }
    return b.count - a.count;
  });
  const sourceCodes = ordered.map((source) => source.source);
  const latestDate = ordered.reduce(
    (max, source) => (source.last_date > max ? source.last_date : max),
    "",
  );
  const dateFrom = rangeDateFrom(latestDate, RANGE_MONTHS[range] ?? 12);

  const seriesQueries = useIndicatorSeriesMulti(code, sourceCodes, {
    order: "asc",
    date_from: dateFrom,
  });
  const { data: eventsData } = usePoliticalEvents({ date_from: dateFrom, date_to: latestDate });

  if (loadingSources) {
    return <Skeleton className="h-64 w-full rounded-[10px]" />;
  }

  const parsedSources = ordered
    .map((source, index) => ({
      source: source.source,
      points: parsePoints(seriesQueries[index]?.data?.points ?? []),
    }))
    .filter((source) => source.points.length > 0);

  const aligned = alignSources(parsedSources);
  const chartSeries: ChartSeries[] = aligned.lines.map((line, index) => ({
    name: sourceLabel(line.source),
    color: SERIE_COLORS[index % SERIE_COLORS.length],
    data: line.data.map((value, position) => ({
      t: formatDateAR(aligned.axis[position]),
      v: value,
    })),
  }));
  const chartEvents = eventsToChartEvents(aligned.axis, eventsData ?? []);
  const xLabels = yearLabels(aligned.axis);
  const hasSeries = aligned.axis.length >= 2;
  const isComparator = ordered.length >= 2;

  const relatedBrechas = BRECHAS.filter((brecha) =>
    brecha.legs.some((leg) => leg.code === code),
  );

  const primary = ordered[0];
  const primaryPoints = parsedSources.find((source) => source.source === primary?.source)?.points;
  const primaryValue = primary ? Number.parseFloat(primary.latest_value) : undefined;
  let primaryVariation: number | undefined;
  if (primaryPoints && primaryPoints.length >= 2 && indicator.variation !== "none") {
    const latest = primaryPoints[primaryPoints.length - 1].value;
    const previous = primaryPoints[primaryPoints.length - 2].value;
    if (indicator.variation === "pct" && previous !== 0) {
      primaryVariation = ((latest - previous) / previous) * 100;
    } else if (indicator.variation === "delta") {
      primaryVariation = latest - previous;
    }
  }

  const comparatorRows: DataTableRow[] = ordered.map((source) => {
    const value = Number.parseFloat(source.latest_value);
    const gap =
      primaryValue !== undefined && source.source !== primary?.source
        ? value - primaryValue
        : undefined;
    return {
      id: source.source,
      cells: [
        sourceLabel(source.source),
        indicator.format(value),
        formatDateAR(source.last_date),
        gap === undefined ? "—" : `${gap > 0 ? "+" : "−"}${indicator.format(Math.abs(gap))}`,
      ],
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1
            style={{
              font: "var(--fw-bold) var(--fs-h1)/var(--lh-heading) var(--font-sans)",
              margin: 0,
              color: "var(--text-body)",
            }}
          >
            {indicator.label}
          </h1>
          {primaryValue !== undefined && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <span
                className="num"
                style={{ fontSize: "var(--fs-num-xl)", fontWeight: 600, lineHeight: 1.1 }}
              >
                {indicator.format(primaryValue)}
                {indicator.unit && (
                  <span style={{ fontSize: "1rem", color: "var(--text-muted)", marginLeft: 6 }}>
                    {indicator.unit}
                  </span>
                )}
              </span>
              {primaryVariation !== undefined && (
                <VariationBadge
                  value={primaryVariation}
                  goodWhen={indicator.goodWhen}
                  suffix={indicator.variationSuffix}
                />
              )}
            </div>
          )}
          {primary && (
            <SourceAttribution
              source={sourceLabel(primary.source)}
              date={formatDateAR(primary.last_date)}
            />
          )}
        </div>
        <RangeSelector options={RANGE_OPTIONS} active={range} onChange={setRange} />
      </div>

      <Card
        title="Evolución"
        subtitle={
          isComparator
            ? "Serie por fuente, anotada con eventos políticos"
            : "Serie anotada con eventos políticos"
        }
        actions={isComparator ? <Badge tone="gap">Comparador de fuentes</Badge> : undefined}
      >
        {hasSeries ? (
          <AnnotatedSeriesChart
            series={chartSeries}
            events={chartEvents}
            gapFill={isComparator}
            yFormat={(value) => indicator.format(value)}
            xLabels={xLabels}
            height={320}
          />
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
            Todavía no hay suficiente serie histórica para graficar este indicador en el rango
            seleccionado.
          </p>
        )}
      </Card>

      {relatedBrechas.length > 0 && (
        <Card title="Este indicador forma parte de una brecha">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {relatedBrechas.map((brecha) => (
              <Link
                key={brecha.id}
                href={`/brechas#${brecha.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-1)",
                  background: "var(--surface-inset)",
                  textDecoration: "none",
                  color: "var(--text-body)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                <Badge tone="gap">Brecha</Badge>
                {brecha.label} →
              </Link>
            ))}
          </div>
        </Card>
      )}

      {isComparator && (
        <Card
          title="La brecha entre mediciones"
          subtitle={`Distintas fuentes miden ${indicator.label.toLowerCase()} con metodologías propias`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <DataTable
              columns={[
                { key: "fuente", label: "Fuente" },
                { key: "valor", label: "Último valor", align: "right", numeric: true },
                { key: "fecha", label: "Último dato", align: "right" },
                {
                  key: "brecha",
                  label: `Brecha vs ${sourceLabel(primary.source)}`,
                  align: "right",
                  numeric: true,
                },
              ]}
              rows={comparatorRows}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ordered.map((source) => (
                <div
                  key={source.source}
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <SourceAttribution
                    source={sourceLabel(source.source)}
                    note={
                      SOURCE_METHODOLOGY[source.source] ??
                      "Fuente oficial; ver publicación original."
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
