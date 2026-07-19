import type { CSSProperties } from "react";

export type GoodWhen = "up" | "down";

interface VariationBadgeProps {
  value: number;
  goodWhen?: GoodWhen;
  suffix?: string;
  period?: string;
  style?: CSSProperties;
}

export function VariationBadge({
  value,
  goodWhen = "down",
  suffix = "%",
  period,
  style,
}: VariationBadgeProps) {
  const up = value > 0;
  const zero = value === 0;
  const good = zero ? null : (up && goodWhen === "up") || (!up && goodWhen === "down");
  const color = zero ? "var(--text-muted)" : good ? "var(--pos)" : "var(--neg)";
  const background = zero ? "var(--surface-inset)" : good ? "var(--pos-bg)" : "var(--neg-bg)";
  const arrow = zero ? "·" : up ? "▲" : "▼";
  const num = Math.abs(value).toLocaleString("es-AR", { maximumFractionDigits: 2 });
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 4,
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        background,
        color,
        fontFamily: "var(--font-mono)",
        fontSize: "0.8125rem",
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: "0.625rem" }}>
        {arrow}
      </span>
      {zero ? "0" : `${up ? "+" : "−"}${num}`}
      {suffix}
      {period && (
        <span
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "0.6875rem",
          }}
        >
          {period}
        </span>
      )}
    </span>
  );
}
