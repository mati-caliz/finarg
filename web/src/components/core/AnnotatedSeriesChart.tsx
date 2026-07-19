"use client";

import { type CSSProperties, type MouseEvent, useState } from "react";

export interface SeriesPoint {
  t?: string;
  v: number;
}

export interface ChartSeries {
  name: string;
  color?: string;
  dashed?: boolean;
  data: SeriesPoint[];
}

export interface ChartEvent {
  index: number;
  label: string;
}

interface AnnotatedSeriesChartProps {
  series: ChartSeries[];
  events?: ChartEvent[];
  height?: number;
  gapFill?: boolean;
  yFormat?: (value: number) => string;
  xLabels?: string[];
  style?: CSSProperties;
}

function scale(value: number, d0: number, d1: number, r0: number, r1: number) {
  return r0 + ((value - d0) / (d1 - d0 || 1)) * (r1 - r0);
}

export function AnnotatedSeriesChart({
  series,
  events = [],
  height = 280,
  gapFill = true,
  yFormat,
  xLabels = [],
  style,
}: AnnotatedSeriesChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 800;
  const H = height;
  const padL = 56;
  const padR = 16;
  const padT = 26;
  const padB = 26;
  const all = series.flatMap((s) => s.data.map((p) => p.v));
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const y0 = min - span * 0.08;
  const y1 = max + span * 0.1;
  const n = Math.max(...series.map((s) => s.data.length));
  const X = (i: number) => scale(i, 0, n - 1, padL, W - padR);
  const Y = (v: number) => scale(v, y0, y1, H - padB, padT);
  const fmt = yFormat || ((v: number) => v.toLocaleString("es-AR", { maximumFractionDigits: 1 }));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => y0 + t * (y1 - y0));
  const line = (s: ChartSeries) =>
    s.data.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ");

  let gapArea: string | null = null;
  if (gapFill && series.length >= 2) {
    const a = series[0].data;
    const b = series[1].data;
    const m = Math.min(a.length, b.length);
    const fwd = Array.from({ length: m }, (_, i) => `${X(i).toFixed(1)},${Y(a[i].v).toFixed(1)}`);
    const back = Array.from(
      { length: m },
      (_, i) => `${X(m - 1 - i).toFixed(1)},${Y(b[m - 1 - i].v).toFixed(1)}`,
    );
    gapArea = `M${fwd.join(" L")} L${back.join(" L")} Z`;
  }

  const onMove = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    const i = Math.round(scale(px, padL, W - padR, 0, n - 1));
    setHover(i >= 0 && i < n ? i : null);
  };

  return (
    <div style={{ position: "relative", ...style }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", width: "100%", height: "auto" }}
        role="img"
        aria-label={`Serie temporal: ${series.map((s) => s.name).join(", ")}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={`grid-${t}`}>
            <line
              x1={padL}
              x2={W - padR}
              y1={Y(t)}
              y2={Y(t)}
              stroke="var(--chart-grid)"
              strokeWidth="1"
            />
            <text
              x={padL - 8}
              y={Y(t) + 3}
              textAnchor="end"
              fontSize="10"
              fill="var(--chart-axis)"
              fontFamily="var(--font-mono)"
            >
              {fmt(t)}
            </text>
          </g>
        ))}
        {xLabels.map((label, i) =>
          label ? (
            <text
              key={`xl-${label}`}
              x={X(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="var(--chart-axis)"
              fontFamily="var(--font-mono)"
            >
              {label}
            </text>
          ) : null,
        )}
        {gapArea && <path d={gapArea} fill="var(--gap-accent)" opacity="0.12" />}
        {events.map((event) => (
          <g key={`ev-${event.index}-${event.label}`}>
            <line
              x1={X(event.index)}
              x2={X(event.index)}
              y1={padT - 6}
              y2={H - padB}
              stroke="var(--evento)"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <rect
              x={X(event.index) - 4}
              y={padT - 12}
              width="8"
              height="8"
              rx="1.5"
              fill="var(--evento)"
              transform={`rotate(45 ${X(event.index)} ${padT - 8})`}
            />
          </g>
        ))}
        {series.map((s, si) => (
          <path
            key={`line-${s.name}`}
            d={line(s)}
            fill="none"
            stroke={s.color || `var(--serie-${si + 1})`}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={s.dashed ? "5 4" : undefined}
          />
        ))}
        {hover !== null && (
          <g>
            <line
              x1={X(hover)}
              x2={X(hover)}
              y1={padT}
              y2={H - padB}
              stroke="var(--text-faint)"
              strokeWidth="1"
            />
            {series.map((s, si) =>
              s.data[hover] ? (
                <circle
                  key={`hover-${s.name}`}
                  cx={X(hover)}
                  cy={Y(s.data[hover].v)}
                  r="3.5"
                  fill={s.color || `var(--serie-${si + 1})`}
                  stroke="var(--surface-card)"
                  strokeWidth="1.5"
                />
              ) : null,
            )}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: hover > n / 2 ? 12 : "auto",
            right: hover > n / 2 ? "auto" : 12,
            background: "var(--surface-raised)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-raised)",
            padding: "8px 10px",
            fontSize: "0.6875rem",
            pointerEvents: "none",
            minWidth: 150,
          }}
        >
          <div
            style={{ color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-mono)" }}
          >
            {series[0].data[hover]?.t}
          </div>
          {series.map((s, si) =>
            s.data[hover] ? (
              <div
                key={`tip-${s.name}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    color: "var(--text-secondary)",
                  }}
                >
                  <span
                    style={{ width: 8, height: 2, background: s.color || `var(--serie-${si + 1})` }}
                  />
                  {s.name}
                </span>
                <b className="num">{fmt(s.data[hover].v)}</b>
              </div>
            ) : null,
          )}
          {(() => {
            const event = events.find((e) => e.index === hover);
            return event ? (
              <div
                style={{
                  marginTop: 5,
                  paddingTop: 5,
                  borderTop: "1px solid var(--border-1)",
                  color: "var(--evento)",
                  fontWeight: 600,
                }}
              >
                ◆ {event.label}
              </div>
            ) : null;
          })()}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 16px",
          marginTop: 8,
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
        }}
      >
        {series.map((s, si) => (
          <span
            key={`legend-${s.name}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 14,
                height: 0,
                borderTop: `2px ${s.dashed ? "dashed" : "solid"} ${s.color || `var(--serie-${si + 1})`}`,
              }}
            />
            {s.name}
          </span>
        ))}
        {events.length > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: "var(--evento)",
                transform: "rotate(45deg)",
              }}
            />
            Evento político
          </span>
        )}
        {gapFill && series.length >= 2 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 12,
                height: 10,
                background: "var(--gap-accent)",
                opacity: 0.25,
                borderRadius: 2,
              }}
            />
            Brecha entre mediciones
          </span>
        )}
      </div>
    </div>
  );
}
