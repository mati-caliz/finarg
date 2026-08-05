"use client";

import type { IndicatorDisplay } from "@/lib/indicators";
import { formatDateAR, sourceLabel } from "@/lib/indicators";
import type { ParsedPoint } from "@/lib/series";
import { SITE_URL } from "@/lib/site";
import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";

interface ParsedSource {
  source: string;
  points: ParsedPoint[];
}

interface LatestValue {
  source: string;
  value: number;
  date: string;
}

interface SeriesExportProps {
  code: string;
  indicator: IndicatorDisplay;
  sources: ParsedSource[];
  latest?: LatestValue | undefined;
}

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--line2)",
  background: "var(--raise)",
  color: "var(--ink2)",
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",
} as const;

function buildCsv(sources: ParsedSource[]): string {
  const rows: string[] = ["fecha,fuente,valor"];
  const flat = sources
    .flatMap((source) => source.points.map((point) => ({ ...point, source: source.source })))
    .sort((first, second) => (first.date < second.date ? -1 : first.date > second.date ? 1 : 0));
  for (const row of flat) {
    rows.push(`${row.date},${row.source},${row.value}`);
  }
  return rows.join("\n");
}

export function SeriesExport({ code, indicator, sources, latest }: SeriesExportProps) {
  const [copied, setCopied] = useState(false);
  const hasData = sources.some((source) => source.points.length > 0);

  const downloadCsv = () => {
    const csv = buildCsv(sources);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${code}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyWithSource = async () => {
    if (!latest) {
      return;
    }
    const unit = indicator.unit ? ` ${indicator.unit}` : "";
    const text = `${indicator.label}: ${indicator.format(latest.value)}${unit} — fuente ${sourceLabel(
      latest.source,
    )}, ${formatDateAR(latest.date)}. Vía ${SITE_URL}/indicador/${code}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!hasData) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button type="button" onClick={downloadCsv} style={buttonStyle}>
        <Download className="h-4 w-4" />
        Descargar CSV
      </button>
      {latest && (
        <button type="button" onClick={copyWithSource} style={buttonStyle}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar con fuente"}
        </button>
      )}
    </div>
  );
}
