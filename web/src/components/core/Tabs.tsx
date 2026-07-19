"use client";

import type { CSSProperties } from "react";

interface TabsProps {
  items: string[];
  active: string;
  onChange?: (item: string) => void;
  style?: CSSProperties;
}

export function Tabs({ items, active, onChange, style }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border-1)", ...style }}
    >
      {items.map((item) => {
        const on = item === active;
        return (
          <button
            type="button"
            key={item}
            role="tab"
            aria-selected={on}
            onClick={() => onChange?.(item)}
            style={{
              padding: "8px 14px",
              background: "none",
              border: "none",
              borderBottom: on ? "2px solid var(--ds-accent)" : "2px solid transparent",
              marginBottom: -1,
              color: on ? "var(--text-body)" : "var(--text-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              fontWeight: on ? 600 : 500,
              cursor: "pointer",
              transition: "color 120ms ease-out",
            }}
            onMouseEnter={(event) => {
              if (!on) {
                event.currentTarget.style.color = "var(--text-secondary)";
              }
            }}
            onMouseLeave={(event) => {
              if (!on) {
                event.currentTarget.style.color = "var(--text-muted)";
              }
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

interface RangeSelectorProps {
  options?: string[];
  active: string;
  onChange?: (option: string) => void;
  style?: CSSProperties;
}

export function RangeSelector({
  options = ["1M", "6M", "1A", "5A", "Máx"],
  active,
  onChange,
  style,
}: RangeSelectorProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        border: "1px solid var(--border-1)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        ...style,
      }}
    >
      {options.map((option, index) => {
        const on = option === active;
        return (
          <button
            type="button"
            key={option}
            onClick={() => onChange?.(option)}
            style={{
              padding: "5px 12px",
              background: on ? "var(--ds-accent)" : "var(--surface-card)",
              color: on ? "#fff" : "var(--text-secondary)",
              border: "none",
              borderLeft: index ? "1px solid var(--border-1)" : "none",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 120ms ease-out",
            }}
            onMouseEnter={(event) => {
              if (!on) {
                event.currentTarget.style.background = "var(--surface-inset)";
              }
            }}
            onMouseLeave={(event) => {
              if (!on) {
                event.currentTarget.style.background = "var(--surface-card)";
              }
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
