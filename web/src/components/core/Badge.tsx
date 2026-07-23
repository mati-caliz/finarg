import type { CSSProperties, ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "pos" | "neg" | "gap" | "evento";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  style?: CSSProperties;
}

const tones: Record<BadgeTone, CSSProperties> = {
  neutral: {
    background: "var(--surface)",
    color: "var(--ink2)",
    border: "1px solid var(--line)",
  },
  accent: {
    background: "var(--evento-bg)",
    color: "var(--evento)",
    border: "1px solid var(--evento-ln)",
  },
  pos: { background: "var(--pos-bg)", color: "var(--pos)", border: "1px solid transparent" },
  neg: { background: "var(--neg-bg)", color: "var(--neg)", border: "1px solid transparent" },
  gap: { background: "var(--brecha-bg)", color: "var(--brecha)", border: "1px solid var(--brecha-ln)" },
  evento: {
    background: "var(--evento-bg)",
    color: "var(--evento)",
    border: "1px solid var(--evento-ln)",
  },
};

export function Badge({ tone = "neutral", children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-jb-mono)",
        fontSize: "0.62rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        lineHeight: 1.5,
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
