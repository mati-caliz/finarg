import type { CSSProperties, ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "pos" | "neg" | "gap" | "evento";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  style?: CSSProperties;
}

const tones: Record<BadgeTone, CSSProperties> = {
  neutral: {
    background: "var(--surface-inset)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-1)",
  },
  accent: {
    background: "var(--accent-soft)",
    color: "var(--accent-strong)",
    border: "1px solid var(--accent-border)",
  },
  pos: { background: "var(--pos-bg)", color: "var(--pos)", border: "1px solid transparent" },
  neg: { background: "var(--neg-bg)", color: "var(--neg)", border: "1px solid transparent" },
  gap: { background: "var(--gap-bg)", color: "var(--gap-accent)", border: "1px solid transparent" },
  evento: {
    background: "var(--evento-bg)",
    color: "var(--evento)",
    border: "1px solid transparent",
  },
};

export function Badge({ tone = "neutral", children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        lineHeight: 1.6,
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
