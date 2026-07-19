import type { CSSProperties } from "react";

export type EventCategory = "politica" | "economia" | "eleccion";

interface EventDotProps {
  category?: EventCategory;
  label: string;
  date?: string;
  style?: CSSProperties;
}

const colors: Record<EventCategory, string> = {
  politica: "var(--evento)",
  economia: "var(--gap-accent)",
  eleccion: "var(--ds-accent)",
};

export function EventDot({ category = "politica", label, date, style }: EventDotProps) {
  const color = colors[category] || colors.politica;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: "0.75rem",
        color: "var(--text-secondary)",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: color,
          flexShrink: 0,
          transform: "rotate(45deg)",
        }}
      />
      <span style={{ fontWeight: 600 }}>{label}</span>
      {date && <span style={{ color: "var(--text-muted)" }}>· {date}</span>}
    </span>
  );
}
