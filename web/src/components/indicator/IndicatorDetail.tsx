"use client";

import { AnnotatedSeriesChart, type ChartSeries } from "@/components/core";
import { SeriesExport } from "@/components/indicator/SeriesExport";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useIndicatorSeriesMulti,
  useIndicatorSources,
  usePoliticalEvents,
} from "@/hooks/useLabrecha";
import { GAPS } from "@/lib/gaps";
import { freshnessForCode } from "@/lib/freshness";
import {
  INDICATOR_FAMILY_LABELS,
  RANGE_MONTHS,
  SOURCE_METHODOLOGY,
  formatDateAR,
  formatNumberAR,
  getIndicatorDisplay,
  getIndicatorMeta,
  sourceLabel,
} from "@/lib/indicators";
import {
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
        <div style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--ink3)" }}>{reference}</div>
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
    color: SOURCE_COLORS[index % SOURCE_COLORS.length],
    data: line.data.map((value, position) => ({ t: formatDateAR(aligned.axis[position]), v: value })),
  }));
  const chartEvents = eventsToChartEvents(aligned.axis, eventsData ?? []);
  const xLabels = yearLabels(aligned.axis);
  const hasSeries = aligned.axis.length >= 2;
  const isComparator = ordered.length >= 2;

  const primary = ordered[0];
  const primaryPoints =
    parsedSources.find((source) => source.source === primary?.source)?.points ?? [];
  const primaryValue = primary ? Number.parseFloat(primary.latest_value) : undefined;
  const lastPoint = primaryPoints[primaryPoints.length - 1];
  const prevPoint = primaryPoints[primaryPoints.length - 2];

  const stepVariation =
    lastPoint && prevPoint
      ? computeVariation(lastPoint.value, prevPoint.value, indicator.variation, indicator.variationSuffix, indicator.goodWhen)
      : undefined;
  const monthVariation =
    lastPoint
      ? computeVariation(lastPoint.value, valueBefore(primaryPoints, shiftDate(lastPoint.date, 1)), indicator.variation, indicator.variationSuffix, indicator.goodWhen)
      : undefined;
  const yearVariation =
    lastPoint
      ? computeVariation(lastPoint.value, valueBefore(primaryPoints, shiftDate(lastPoint.date, 12)), indicator.variation, indicator.variationSuffix, indicator.goodWhen)
      : undefined;

  const secondValue =
    isComparator && ordered[1] ? Number.parseFloat(ordered[1].latest_value) : undefined;
  const gapBase =
    primaryValue !== undefined && secondValue !== undefined
      ? Math.max(Math.abs(primaryValue), Math.abs(secondValue)) || 1
      : undefined;
  const gapPct =
    primaryValue !== undefined && secondValue !== undefined && gapBase !== undefined
      ? (Math.abs(primaryValue - secondValue) / gapBase) * 100
      : undefined;

  const relatedGaps = GAPS.filter((gap) => gap.legs.some((leg) => leg.code === code));

  const tableStart = Math.max(0, aligned.axis.length - 8);
  const tableRows: { date: string; values: number[]; gap: number | undefined }[] = [];
  for (let i = aligned.axis.length - 1; i >= tableStart; i -= 1) {
    const values = aligned.lines.map((line) => line.data[i]);
    let gap: number | undefined;
    if (values.length >= 2) {
      const base = Math.max(Math.abs(values[0]), Math.abs(values[1])) || 1;
      gap = (Math.abs(values[0] - values[1]) / base) * 100;
    }
    tableRows.push({ date: aligned.axis[i], values, gap });
  }

  const stale = primary ? freshnessForCode(code, primary.last_date).stale : false;
  const cellPad = "12px 16px";

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "28px 24px 72px" }}>
      <div style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--ink3)", marginBottom: 20 }}>
        <Link href="/indicators" style={{ color: "var(--ink3)", textDecoration: "none" }}>
          Indicadores
        </Link>{" "}
        / {familyLabel} / <span style={{ color: "var(--ink2)" }}>{indicator.label}</span>
      </div>

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
            {familyLabel} · /indicator/{code}
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
          {ordered.map((source, index) => (
            <SourceChipDot
              key={source.source}
              source={sourceLabel(source.source)}
              date={formatDateAR(source.last_date)}
              color={SOURCE_COLORS[index % SOURCE_COLORS.length]}
            />
          ))}
          {stale ? (
            <span style={{ fontFamily: MONO, fontSize: "0.68rem", color: "var(--gap)" }}>
              ⚠ dato desactualizado
            </span>
          ) : null}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        {RANGE_OPTIONS.map((option) => {
          const active = option === range;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
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
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
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
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.0625rem", color: "var(--ink2)", lineHeight: 1.35 }}>
                de diferencia entre {sourceLabel(ordered[0].source)} y {sourceLabel(ordered[1].source)} hoy.
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {ordered.slice(0, 2).map((source, index) => (
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
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: SOURCE_COLORS[index] }} />
                  <span style={{ fontFamily: MONO, fontSize: "0.78rem", color: "var(--ink2)", flex: 1 }}>
                    {sourceLabel(source.source)}
                  </span>
                  <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: "1.125rem", fontVariantNumeric: "tabular-nums" }}>
                    {indicator.format(Number.parseFloat(source.latest_value))}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", lineHeight: 1.5, color: "var(--ink2)", margin: "18px 0 0" }}>
              {SOURCE_METHODOLOGY[ordered[0].source] ?? "Cada fuente publica con su propia metodología y rezago."}
            </p>
          </div>
        ) : (
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
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", lineHeight: 1.5, color: "var(--ink2)", margin: 0 }}>
              {primary ? SOURCE_METHODOLOGY[primary.source] ?? `Serie publicada por ${sourceLabel(primary.source)}.` : "Sin datos de fuente."}
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <VariationRow label="Variación reciente" reference="vs. dato anterior" variation={stepVariation} />
          <VariationRow label="Variación mensual" reference="vs. hace 1 mes" variation={monthVariation} />
          <VariationRow label="Variación interanual" reference="vs. hace 12 meses" variation={yearVariation} />
        </div>
      </div>

      {relatedGaps.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {relatedGaps.map((gap) => (
            <Link
              key={gap.id}
              href={`/gaps#${gap.id}`}
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
      )}

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
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1875rem", margin: 0 }}>
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
        {tableRows.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: "0.8125rem" }}>
              <thead>
                <tr style={{ color: "var(--ink3)", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <th style={{ textAlign: "left", padding: cellPad, fontWeight: 500 }}>Fecha</th>
                  {aligned.lines.map((line) => (
                    <th key={line.source} style={{ textAlign: "right", padding: cellPad, fontWeight: 500 }}>
                      {sourceLabel(line.source)}
                    </th>
                  ))}
                  {isComparator ? (
                    <th style={{ textAlign: "right", padding: cellPad, fontWeight: 500 }}>Brecha</th>
                  ) : null}
                </tr>
              </thead>
              <tbody style={{ color: "var(--ink)" }}>
                {tableRows.map((row) => (
                  <tr key={row.date} style={{ borderTop: "1px solid var(--line2)" }}>
                    <td style={{ textAlign: "left", padding: cellPad }}>{formatDateAR(row.date)}</td>
                    {row.values.map((value, index) => (
                      <td
                        key={aligned.lines[index].source}
                        style={{
                          textAlign: "right",
                          padding: cellPad,
                          fontVariantNumeric: "tabular-nums",
                          color: index === 0 ? "var(--ink)" : "var(--ink2)",
                        }}
                      >
                        {indicator.format(value)}
                      </td>
                    ))}
                    {isComparator ? (
                      <td style={{ textAlign: "right", padding: cellPad, color: "var(--gap)", fontVariantNumeric: "tabular-nums" }}>
                        {row.gap === undefined ? "—" : `${formatNumberAR(row.gap, 1)}%`}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontFamily: "var(--font-serif)", color: "var(--ink2)", margin: 0, padding: "18px 24px" }}>
            Sin datos en el rango seleccionado.
          </p>
        )}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--line)", fontFamily: MONO, fontSize: "0.68rem", color: "var(--ink3)" }}>
          Fuentes: {ordered.map((source) => sourceLabel(source.source)).join(" · ")}
          {indicator.unit ? ` · en ${indicator.unit}` : ""}
          {latestDate ? ` · última actualización ${formatDateAR(latestDate)}` : ""}
        </div>
      </div>
    </div>
  );
}
