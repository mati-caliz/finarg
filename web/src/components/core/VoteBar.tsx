"use client";

import type { CSSProperties } from "react";

interface VoteTally {
  afirmativos: number;
  negativos: number;
  abstenciones: number;
  ausentes: number;
}

interface VoteBarProps extends VoteTally {
  height?: number;
  style?: CSSProperties;
}

export function VoteBar({
  afirmativos,
  negativos,
  abstenciones,
  ausentes,
  height = 10,
  style,
}: VoteBarProps) {
  const total = afirmativos + negativos + abstenciones + ausentes;
  const segment = (count: number, color: string) =>
    count > 0 ? (
      <div
        style={{ width: `${(count / total) * 100}%`, background: color }}
        title={String(count)}
      />
    ) : null;
  return (
    <div style={{ ...style }}>
      <div
        style={{
          display: "flex",
          height,
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          gap: 1,
        }}
      >
        {segment(afirmativos, "var(--pos)")}
        {segment(negativos, "var(--neg)")}
        {segment(abstenciones, "var(--gap-accent)")}
        {segment(ausentes, "var(--border-2)")}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 14px",
          marginTop: 6,
          fontSize: "0.6875rem",
          color: "var(--text-secondary)",
        }}
      >
        <span>
          <b className="num" style={{ color: "var(--pos)" }}>
            {afirmativos}
          </b>{" "}
          afirmativos
        </span>
        <span>
          <b className="num" style={{ color: "var(--neg)" }}>
            {negativos}
          </b>{" "}
          negativos
        </span>
        <span>
          <b className="num" style={{ color: "var(--gap-accent)" }}>
            {abstenciones}
          </b>{" "}
          abstenciones
        </span>
        <span>
          <b className="num" style={{ color: "var(--text-muted)" }}>
            {ausentes}
          </b>{" "}
          ausentes
        </span>
      </div>
    </div>
  );
}

interface VoteCardProps extends VoteTally {
  title: string;
  date: string;
  result: string;
  href?: string;
  style?: CSSProperties;
}

export function VoteCard({
  title,
  date,
  result,
  afirmativos,
  negativos,
  abstenciones,
  ausentes,
  href,
  style,
}: VoteCardProps) {
  const won = result === "afirmativa";
  return (
    <a
      href={href || "#"}
      style={{
        display: "block",
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
          <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 3 }}>
            Diputados · {date}
          </div>
        </div>
        <span
          style={{
            flexShrink: 0,
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            background: won ? "var(--pos-bg)" : "var(--neg-bg)",
            color: won ? "var(--pos)" : "var(--neg)",
          }}
        >
          {result}
        </span>
      </div>
      <VoteBar
        afirmativos={afirmativos}
        negativos={negativos}
        abstenciones={abstenciones}
        ausentes={ausentes}
      />
    </a>
  );
}
