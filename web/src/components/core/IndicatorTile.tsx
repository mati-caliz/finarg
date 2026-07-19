"use client";

import type { CSSProperties } from "react";
import { SourceChip } from "./SourceChip";
import { Sparkline } from "./Sparkline";
import { type GoodWhen, VariationBadge } from "./VariationBadge";

interface IndicatorTileProps {
  label: string;
  value: string | number;
  unit?: string;
  variation?: number;
  variationSuffix?: string;
  goodWhen?: GoodWhen;
  period?: string;
  data?: number[];
  source: string;
  date?: string;
  href?: string;
  style?: CSSProperties;
}

export function IndicatorTile({
  label,
  value,
  unit,
  variation,
  variationSuffix,
  goodWhen = "down",
  period,
  data,
  source,
  date,
  href,
  style,
}: IndicatorTileProps) {
  return (
    <a
      href={href || "#"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "14px 16px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-1)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        textDecoration: "none",
        color: "var(--text-body)",
        transition: "border-color 120ms ease-out,box-shadow 120ms ease-out",
        ...style,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = "var(--border-2)";
        event.currentTarget.style.boxShadow = "var(--shadow-raised)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = "var(--border-1)";
        event.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.625rem",
              fontWeight: 600,
              lineHeight: 1.1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
            {unit && (
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  marginLeft: 4,
                }}
              >
                {unit}
              </span>
            )}
          </div>
          {variation !== undefined && (
            <div style={{ marginTop: 6 }}>
              <VariationBadge
                value={variation}
                goodWhen={goodWhen}
                suffix={variationSuffix}
                period={period}
              />
            </div>
          )}
        </div>
        {data && <Sparkline data={data} width={96} height={40} fill />}
      </div>
      <SourceChip source={source} date={date} style={{ alignSelf: "flex-start" }} />
    </a>
  );
}
