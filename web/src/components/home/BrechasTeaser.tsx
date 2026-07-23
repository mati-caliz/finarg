"use client";

import { Eyebrow } from "@/components/home/homeShared";
import { useIndicatorSources } from "@/hooks/useLabrecha";
import { formatNumberAR, getIndicatorDisplay, sourceLabel } from "@/lib/indicators";

const TEASER_CODES = ["reservas_internacionales", "ipc_mensual", "dolar_oficial"];

function BrechaItem({ code }: { code: string }) {
  const indicator = getIndicatorDisplay(code);
  const { data } = useIndicatorSources(code);
  const sources = (data ?? []).slice(0, 2);
  if (sources.length < 2) {
    return null;
  }
  const values = sources.map((source) => Number.parseFloat(source.latest_value));
  const base = Math.max(Math.abs(values[0]), Math.abs(values[1])) || 1;
  const gapPct = (Math.abs(values[0] - values[1]) / base) * 100;

  return (
    <div style={{ background: "var(--raise)", padding: "18px 20px" }}>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", marginBottom: 12, color: "var(--ink)" }}>
        {indicator.label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-jb-mono)",
          fontWeight: 700,
          fontSize: "1.875rem",
          color: "var(--brecha)",
          fontVariantNumeric: "tabular-nums",
          marginBottom: 12,
        }}
      >
        {formatNumberAR(gapPct, 1)}%
      </div>
      <div style={{ fontFamily: "var(--font-jb-mono)", fontSize: "0.7rem", color: "var(--ink2)", lineHeight: 1.7 }}>
        {sources.map((source, index) => (
          <span key={source.source}>
            {sourceLabel(source.source)}{" "}
            <b style={{ color: "var(--ink)" }}>{indicator.format(values[index])}</b>
            {index === 0 ? " · " : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BrechasTeaser() {
  return (
    <section className="lb-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div
        style={{
          background: "var(--brecha-bg)",
          border: "1px solid var(--brecha-ln)",
          borderRadius: 10,
          padding: "30px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <Eyebrow>◆ La brecha entre mediciones</Eyebrow>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.1875rem",
                lineHeight: 1.45,
                color: "var(--ink)",
                margin: "10px 0 0",
              }}
            >
              Cuando un mismo dato lo miden dos fuentes distintas, casi nunca coinciden. Estas son
              algunas de las discrepancias de hoy.
            </p>
          </div>
          <a
            href="/brechas"
            style={{
              fontFamily: "var(--font-jb-mono)",
              fontSize: "0.78rem",
              color: "var(--brecha)",
              border: "1px solid var(--brecha)",
              borderRadius: "var(--radius-pill)",
              padding: "8px 16px",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Ver todas las brechas →
          </a>
        </div>
        <div className="lb-brechas-grid">
          {TEASER_CODES.map((code) => (
            <BrechaItem key={code} code={code} />
          ))}
        </div>
      </div>
    </section>
  );
}
