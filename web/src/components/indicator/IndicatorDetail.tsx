"use client";

import { AnnotatedSeriesChart, type ChartSeries } from "@/components/core";
import { SeriesExport } from "@/components/indicator/SeriesExport";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useIndicatorSeriesMulti,
  useIndicatorSources,
  usePoliticalEvents,
} from "@/hooks/useLabrecha";
import { freshnessForCode } from "@/lib/freshness";
import { GAPS } from "@/lib/gaps";
import {
  INDICATOR_FAMILY_LABELS,
  type IndicatorDisplay,
  RANGE_MONTHS,
  SOURCE_METHODOLOGY,
  formatDateAR,
  formatNumberAR,
  getIndicatorDisplay,
  getIndicatorMeta,
  sourceLabel,
} from "@/lib/indicators";
import type { IndicatorSourceSummary } from "@/lib/labrechaApi";
import {
  type AlignedSeries,
  type ParsedPoint,
  alignSources,
  eventsToChartEvents,
  parsePoints,
  rangeDateFrom,
  yearLabels,
} from "@/lib/series";
import Link from "next/link";
import { type CSSProperties, useState } from "react";

const RANGE_OPTIONS = ["6M", "1A", "5A", "Máx"];
const SOURCE_COLORS = ["var(--chart)", "var(--gap)", "var(--serie-3)"];

function sourceColor(index: number): string {
  return SOURCE_COLORS[index % SOURCE_COLORS.length] ?? "var(--chart)";
}
const MONO = "var(--font-jb-mono)";

interface IndicatorDetailProps {
  code: string;
}

interface VariationDisplay {
  text: string;
  color: string;
  background: string;
}

function computeVariation(
  latest: number,
  base: number | undefined,
  mode: "pct" | "delta" | "none",
  suffix: string | undefined,
  goodWhen: "up" | "down" | "neutral",
): VariationDisplay | undefined {
  if (base === undefined || mode === "none") {
    return undefined;
  }
  let delta: number;
  let label: string;
  if (mode === "pct") {
    if (base === 0) {
      return undefined;
    }
    delta = ((latest - base) / base) * 100;
    label = `${formatNumberAR(Math.abs(delta), 1)}%`;
  } else {
    delta = latest - base;
    label = `${formatNumberAR(Math.abs(delta), 1)}${suffix ?? " pp"}`;
  }
  if (delta === 0) {
    return { text: `= ${label}`, color: "var(--ink2)", background: "transparent" };
  }
  const rising = delta > 0;
  const good = goodWhen === "neutral" ? true : goodWhen === "up" ? rising : !rising;
  return {
    text: `${rising ? "▲" : "▼"} ${label}`,
    color: good ? "var(--pos)" : "var(--neg)",
    background: good ? "var(--pos-bg)" : "var(--neg-bg)",
  };
}

function valueBefore(points: ParsedPoint[], targetDate: string): number | undefined {
  let result: number | undefined;
  for (const point of points) {
    if (point.date <= targetDate) {
      result = point.value;
    } else {
      break;
    }
  }
  return result;
}

function shiftDate(isoDate: string, months: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
}

const CARD_STYLE: CSSProperties = {
  background: "var(--raise)",
  border: "1px solid var(--line)",
  borderRadius: 10,
};

function SourceChipDot({ source, date, color }: { source: string; date: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: MONO,
        fontSize: "0.72rem",
        color: "var(--ink2)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-pill)",
        padding: "5px 12px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {source} · {date}
    </span>
  );
}

function VariationRow({
  label,
  reference,
  variation,
}: {
  label: string;
  reference: string;
  variation: VariationDisplay | undefined;
}) {
  return (
    <div
      style={{
        ...CARD_STYLE,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--ink3)",
            marginBottom: 6,
          }}
        >
          {label}
        </div>
        <div style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--ink3)" }}>
          {reference}
        </div>
      </div>
      <span
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: "1.5rem",
          fontVariantNumeric: "tabular-nums",
          color: variation?.color ?? "var(--ink3)",
        }}
      >
        {variation?.text ?? "—"}
      </span>
    </div>
  );
}

function variationVsPreviousPoint(
  indicator: IndicatorDisplay,
  points: ParsedPoint[],
): VariationDisplay | undefined {
  const lastPoint = points[points.length - 1];
  const previousPoint = points[points.length - 2];
  if (!lastPoint || !previousPoint) {
    return undefined;
  }
  return computeVariation(
    lastPoint.value,
    previousPoint.value,
    indicator.variation,
    indicator.variationSuffix,
    indicator.goodWhen,
  );
}

function variationVsMonthsAgo(
  indicator: IndicatorDisplay,
  points: ParsedPoint[],
  monthsAgo: number,
): VariationDisplay | undefined {
  const lastPoint = points[points.length - 1];
  if (!lastPoint) {
    return undefined;
  }
  return computeVariation(
    lastPoint.value,
    valueBefore(points, shiftDate(lastPoint.date, monthsAgo)),
    indicator.variation,
    indicator.variationSuffix,
    indicator.goodWhen,
  );
}

function gapPercent(first: number | undefined, second: number | undefined): number | undefined {
  if (first === undefined || second === undefined) {
    return undefined;
  }
  const base = Math.max(Math.abs(first), Math.abs(second)) || 1;
  return (Math.abs(first - second) / base) * 100;
}

interface TableRow {
  date: string;
  values: number[];
  gap: number | undefined;
}

const TABLE_ROW_LIMIT = 8;

function buildTableRows(aligned: AlignedSeries): TableRow[] {
  const firstRowIndex = Math.max(0, aligned.axis.length - TABLE_ROW_LIMIT);
  const rows: TableRow[] = [];
  for (let index = aligned.axis.length - 1; index >= firstRowIndex; index -= 1) {
    const values = aligned.lines.map((line) => line.data[index] ?? 0);
    rows.push({ date: aligned.axis[index] ?? "", values, gap: gapPercent(values[0], values[1]) });
  }
  return rows;
}

function IndicatorHero({
  code,
  familyLabel,
  indicator,
  primaryValue,
  stepVariation,
  sources,
  stale,
}: {
  code: string;
  familyLabel: string;
  indicator: IndicatorDisplay;
  primaryValue: number | undefined;
  stepVariation: VariationDisplay | undefined;
  sources: IndicatorSourceSummary[];
  stale: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 32,
        flexWrap: "wrap",
        borderBottom: "2px solid var(--ink)",
        paddingBottom: 24,
        marginBottom: 28,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.72rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink3)",
            marginBottom: 12,
          }}
        >
          {familyLabel} · /indicador/{code}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 2.875rem)",
            lineHeight: 1.0,
            letterSpacing: "-0.025em",
            margin: "0 0 18px",
            color: "var(--ink)",
          }}
        >
          {indicator.label}
        </h1>
        {primaryValue !== undefined && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: "clamp(2.25rem, 6vw, 3.25rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {indicator.format(primaryValue)}
              {indicator.unit ? (
                <span style={{ fontSize: "0.5em", color: "var(--ink3)" }}> {indicator.unit}</span>
              ) : null}
            </span>
            {stepVariation ? (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: stepVariation.color,
                  background: stepVariation.background,
                  padding: "4px 9px",
                  borderRadius: 5,
                  marginBottom: 6,
                }}
              >
                {stepVariation.text}
              </span>
            ) : null}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
        {sources.map((source, index) => (
          <SourceChipDot
            key={source.source}
            source={sourceLabel(source.source)}
            date={formatDateAR(source.last_date)}
            color={sourceColor(index)}
          />
        ))}
        {stale ? (
          <span style={{ fontFamily: MONO, fontSize: "0.68rem", color: "var(--gap)" }}>
            ⚠ dato desactualizado
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RangeSelector({
  range,
  onRangeChange,
}: {
  range: string;
  onRangeChange: (range: string) => void;
}) {
  return (
    <div
      style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}
    >
      {RANGE_OPTIONS.map((option) => {
        const active = option === range;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onRangeChange(option)}
            style={{
              fontFamily: MONO,
              fontSize: "0.75rem",
              padding: "7px 15px",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              border: active ? "1px solid var(--ink)" : "1px solid var(--line)",
              background: active ? "var(--ink)" : "transparent",
              color: active ? "var(--paper)" : "var(--ink2)",
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function GapPanel({
  indicator,
  gapPct,
  sources,
}: {
  indicator: IndicatorDisplay;
  gapPct: number;
  sources: IndicatorSourceSummary[];
}) {
  const [firstSource, secondSource] = sources;
  if (!firstSource || !secondSource) {
    return null;
  }
  return (
    <div
      style={{
        background: "var(--gap-bg)",
        border: "1px solid var(--gap-ln)",
        borderRadius: 10,
        padding: "28px 30px",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.72rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--gap)",
          marginBottom: 20,
        }}
      >
        ◆ La brecha entre fuentes
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginBottom: 22,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: "clamp(2.75rem, 8vw, 4rem)",
            lineHeight: 0.8,
            color: "var(--gap)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatNumberAR(gapPct, 1)}%
        </span>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.0625rem",
            color: "var(--ink2)",
            lineHeight: 1.35,
          }}
        >
          de diferencia entre {sourceLabel(firstSource.source)} y {sourceLabel(secondSource.source)}{" "}
          hoy.
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {sources.slice(0, 2).map((source, index) => (
          <div
            key={source.source}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--raise)",
              padding: "14px 16px",
              borderRadius: index === 0 ? "7px 7px 0 0" : "0 0 7px 7px",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: sourceColor(index),
              }}
            />
            <span style={{ fontFamily: MONO, fontSize: "0.78rem", color: "var(--ink2)", flex: 1 }}>
              {sourceLabel(source.source)}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 600,
                fontSize: "1.125rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {indicator.format(Number.parseFloat(source.latest_value))}
            </span>
          </div>
        ))}
      </div>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "0.9rem",
          lineHeight: 1.5,
          color: "var(--ink2)",
          margin: "18px 0 0",
        }}
      >
        {SOURCE_METHODOLOGY[firstSource.source] ??
          "Cada fuente publica con su propia metodología y rezago."}
      </p>
    </div>
  );
}

function SourcePanel({ primary }: { primary: IndicatorSourceSummary | undefined }) {
  return (
    <div style={{ ...CARD_STYLE, padding: "28px 30px" }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.72rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink3)",
          marginBottom: 14,
        }}
      >
        Fuente
      </div>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1rem",
          lineHeight: 1.5,
          color: "var(--ink2)",
          margin: 0,
        }}
      >
        {primary
          ? (SOURCE_METHODOLOGY[primary.source] ??
            `Serie publicada por ${sourceLabel(primary.source)}.`)
          : "Sin datos de fuente."}
      </p>
    </div>
  );
}

function RelatedGapLinks({ code }: { code: string }) {
  const relatedGaps = GAPS.filter((gap) => gap.legs.some((leg) => leg.code === code));
  if (relatedGaps.length === 0) {
    return null;
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
      {relatedGaps.map((gap) => (
        <Link
          key={gap.id}
          href={`/brechas#${gap.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--gap-ln)",
            background: "var(--gap-bg)",
            textDecoration: "none",
            color: "var(--gap)",
            fontFamily: MONO,
            fontSize: "0.75rem",
          }}
        >
          ◆ {gap.label} →
        </Link>
      ))}
    </div>
  );
}

const CELL_PAD = "12px 16px";

function SeriesTable({
  indicator,
  aligned,
  rows,
  isComparator,
}: {
  indicator: IndicatorDisplay;
  aligned: AlignedSeries;
  rows: TableRow[];
  isComparator: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--ink2)",
          margin: 0,
          padding: "18px 24px",
        }}
      >
        Sin datos en el rango seleccionado.
      </p>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: MONO,
          fontSize: "0.8125rem",
        }}
      >
        <thead>
          <tr
            style={{
              color: "var(--ink3)",
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <th style={{ textAlign: "left", padding: CELL_PAD, fontWeight: 500 }}>Fecha</th>
            {aligned.lines.map((line) => (
              <th
                key={line.source}
                style={{ textAlign: "right", padding: CELL_PAD, fontWeight: 500 }}
              >
                {sourceLabel(line.source)}
              </th>
            ))}
            {isComparator ? (
              <th style={{ textAlign: "right", padding: CELL_PAD, fontWeight: 500 }}>Brecha</th>
            ) : null}
          </tr>
        </thead>
        <tbody style={{ color: "var(--ink)" }}>
          {rows.map((row) => (
            <tr key={row.date} style={{ borderTop: "1px solid var(--line2)" }}>
              <td style={{ textAlign: "left", padding: CELL_PAD }}>{formatDateAR(row.date)}</td>
              {row.values.map((value, index) => (
                <td
                  key={aligned.lines[index]?.source ?? index}
                  style={{
                    textAlign: "right",
                    padding: CELL_PAD,
                    fontVariantNumeric: "tabular-nums",
                    color: index === 0 ? "var(--ink)" : "var(--ink2)",
                  }}
                >
                  {indicator.format(value)}
                </td>
              ))}
              {isComparator ? (
                <td
                  style={{
                    textAlign: "right",
                    padding: CELL_PAD,
                    color: "var(--gap)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {row.gap === undefined ? "—" : `${formatNumberAR(row.gap, 1)}%`}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IndicatorDetail({ code }: IndicatorDetailProps) {
  const [range, setRange] = useState("1A");
  const indicator = getIndicatorDisplay(code);
  const meta = getIndicatorMeta(code);
  const familyLabel = meta ? INDICATOR_FAMILY_LABELS[meta.family] : "Indicadores";
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
    color: sourceColor(index),
    data: line.data.map((value, position) => ({
      t: formatDateAR(aligned.axis[position] ?? ""),
      v: value,
    })),
  }));
  const chartEvents = eventsToChartEvents(aligned.axis, eventsData ?? []);
  const xLabels = yearLabels(aligned.axis);
  const hasSeries = aligned.axis.length >= 2;
  const isComparator = ordered.length >= 2;

  const primary = ordered[0];
  const primaryPoints =
    parsedSources.find((source) => source.source === primary?.source)?.points ?? [];
  const primaryValue = primary ? Number.parseFloat(primary.latest_value) : undefined;
  const stepVariation = variationVsPreviousPoint(indicator, primaryPoints);
  const monthVariation = variationVsMonthsAgo(indicator, primaryPoints, 1);
  const yearVariation = variationVsMonthsAgo(indicator, primaryPoints, 12);

  const secondValue =
    isComparator && ordered[1] ? Number.parseFloat(ordered[1].latest_value) : undefined;
  const gapPct = gapPercent(primaryValue, secondValue);
  const tableRows = buildTableRows(aligned);
  const stale = primary ? freshnessForCode(code, primary.last_date).stale : false;

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "28px 24px 72px" }}>
      <div
        style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--ink3)", marginBottom: 20 }}
      >
        <Link href="/indicadores" style={{ color: "var(--ink3)", textDecoration: "none" }}>
          Indicadores
        </Link>{" "}
        / {familyLabel} / <span style={{ color: "var(--ink2)" }}>{indicator.label}</span>
      </div>

      <IndicatorHero
        code={code}
        familyLabel={familyLabel}
        indicator={indicator}
        primaryValue={primaryValue}
        stepVariation={stepVariation}
        sources={ordered}
        stale={stale}
      />

      <RangeSelector range={range} onRangeChange={setRange} />

      <div style={{ ...CARD_STYLE, padding: "26px 28px 22px", marginBottom: 24 }}>
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
          <p style={{ fontFamily: "var(--font-serif)", color: "var(--ink2)", margin: 0 }}>
            Todavía no hay suficiente serie histórica para graficar este indicador en el rango
            seleccionado.
          </p>
        )}
      </div>

      <div className="lb-indicator-grid" style={{ marginBottom: 24 }}>
        {isComparator && gapPct !== undefined ? (
          <GapPanel indicator={indicator} gapPct={gapPct} sources={ordered} />
        ) : (
          <SourcePanel primary={primary} />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <VariationRow
            label="Variación reciente"
            reference="vs. dato anterior"
            variation={stepVariation}
          />
          <VariationRow
            label="Variación mensual"
            reference="vs. hace 1 mes"
            variation={monthVariation}
          />
          <VariationRow
            label="Variación interanual"
            reference="vs. hace 12 meses"
            variation={yearVariation}
          />
        </div>
      </div>

      <RelatedGapLinks code={code} />

      <div style={{ ...CARD_STYLE, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "18px 24px",
            borderBottom: "1px solid var(--line)",
            flexWrap: "wrap",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.1875rem",
              margin: 0,
            }}
          >
            Tabla de datos
          </h2>
          <SeriesExport
            code={code}
            indicator={indicator}
            sources={parsedSources}
            latest={
              primary && primaryValue !== undefined
                ? { source: primary.source, value: primaryValue, date: primary.last_date }
                : undefined
            }
          />
        </div>
        <SeriesTable
          indicator={indicator}
          aligned={aligned}
          rows={tableRows}
          isComparator={isComparator}
        />
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--line)",
            fontFamily: MONO,
            fontSize: "0.68rem",
            color: "var(--ink3)",
          }}
        >
          Fuentes: {ordered.map((source) => sourceLabel(source.source)).join(" · ")}
          {indicator.unit ? ` · en ${indicator.unit}` : ""}
          {latestDate ? ` · última actualización ${formatDateAR(latestDate)}` : ""}
        </div>
      </div>
    </div>
  );
}
