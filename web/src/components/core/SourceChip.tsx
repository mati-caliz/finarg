import type { CSSProperties } from "react";

interface SourceChipProps {
  source: string;
  date?: string;
  href?: string;
  style?: CSSProperties;
}

export function SourceChip({ source, date, href, style }: SourceChipProps) {
  const inner = (
    <>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "var(--ds-accent)",
          flexShrink: 0,
        }}
      />
      <span style={{ fontWeight: 600 }}>{source}</span>
      {date && <span style={{ color: "var(--text-muted)" }}>· {date}</span>}
    </>
  );
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "2px 9px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--border-1)",
    background: "var(--surface-card)",
    fontSize: "0.6875rem",
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    textDecoration: "none",
    ...style,
  };
  return href ? (
    <a href={href} style={base}>
      {inner}
    </a>
  ) : (
    <span style={base}>{inner}</span>
  );
}

interface SourceAttributionProps {
  source: string;
  date?: string;
  note?: string;
  style?: CSSProperties;
}

export function SourceAttribution({ source, date, note, style }: SourceAttributionProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: 6,
        fontSize: "0.6875rem",
        color: "var(--text-muted)",
        ...style,
      }}
    >
      <span
        style={{
          textTransform: "uppercase",
          letterSpacing: "var(--ls-caps)",
          fontWeight: 600,
          fontSize: "0.625rem",
        }}
      >
        Fuente
      </span>
      <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{source}</span>
      {date && <span>· {date}</span>}
      {note && <span>· {note}</span>}
    </div>
  );
}
