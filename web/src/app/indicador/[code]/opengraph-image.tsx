import { formatDateAR, getIndicatorDisplay, sourceLabel } from "@/lib/indicators";
import type { IndicatorSeries } from "@/lib/labrechaApi";
import { serverGet } from "@/lib/serverApi";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Indicador de La Brecha";

const COLORS = {
  bg: "#f7f4ee",
  card: "#ffffff",
  ink: "#1a1f24",
  muted: "#6b7280",
  border: "#e5e0d6",
  accent: "#1e4fa3",
  brecha: "#c77b1e",
};

function sparklinePath(values: number[], width: number, height: number): string {
  if (values.length < 2) {
    return "";
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / span) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const indicator = getIndicatorDisplay(code);

  let points: { value: number; date: string; source: string }[] = [];
  try {
    const sourceParam = indicator.preferredSource ? `&source=${indicator.preferredSource}` : "";
    const series = await serverGet<IndicatorSeries>(
      `/indicators/${code}?limit=48&order=desc${sourceParam}`,
      1800,
    );
    points = (series.points ?? [])
      .map((point) => ({
        value: Number.parseFloat(point.value),
        date: point.date,
        source: point.source,
      }))
      .filter((point) => Number.isFinite(point.value));
  } catch {
    points = [];
  }

  const latest = points[0];
  const ascending = [...points].reverse().map((point) => point.value);
  const path = sparklinePath(ascending, 1080, 200);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: COLORS.bg,
        padding: 56,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: COLORS.ink }}>La</div>
        <div style={{ width: 5, height: 30, background: COLORS.brecha, borderRadius: 3 }} />
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: COLORS.ink }}>
          Brecha
        </div>
        <div style={{ display: "flex", marginLeft: 14, fontSize: 22, color: COLORS.muted }}>
          Observatorio político-económico de Argentina
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", fontSize: 38, fontWeight: 600, color: COLORS.muted }}>
          {indicator.label}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 700,
              color: COLORS.ink,
              lineHeight: 1,
            }}
          >
            {latest ? indicator.format(latest.value) : "—"}
          </div>
          {indicator.unit && (
            <div style={{ display: "flex", fontSize: 40, color: COLORS.muted, paddingBottom: 16 }}>
              {indicator.unit}
            </div>
          )}
        </div>
        {latest && (
          <div style={{ display: "flex", fontSize: 26, color: COLORS.muted }}>
            Fuente {sourceLabel(latest.source)} · {formatDateAR(latest.date)}
          </div>
        )}
      </div>

      <svg width={1080} height={200} viewBox="0 0 1080 200" role="img" aria-label="Serie histórica">
        {path && <path d={path} fill="none" stroke={COLORS.accent} strokeWidth={5} />}
      </svg>
    </div>,
    size,
  );
}
