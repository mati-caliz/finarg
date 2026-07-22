"use client";

import { QueryError } from "@/components/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicators } from "@/hooks/useLabrecha";
import type { IndicatorSummary } from "@/lib/labrechaApi";
import {
  INDICATOR_FAMILY_LABELS,
  INDICATOR_FAMILY_ORDER,
  type IndicatorFamily,
  formatDateAR,
  getIndicatorMeta,
  indicatorLabel,
  sourceLabel,
} from "@/lib/indicators";
import { useMemo, useState } from "react";

const OTHER_FAMILY_LABEL = "Otros";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"];

interface FamilyGroup {
  key: string;
  label: string;
  items: IndicatorSummary[];
}

const DIACRITICS = /\p{Diacritic}/gu;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "");
}

function groupByFamily(indicators: IndicatorSummary[], query: string): FamilyGroup[] {
  const normalizedQuery = normalize(query.trim());
  const matches = indicators.filter((indicator) => {
    if (normalizedQuery.length === 0) {
      return true;
    }
    const haystack = normalize(`${indicator.indicator_code} ${indicatorLabel(indicator.indicator_code)}`);
    return haystack.includes(normalizedQuery);
  });

  const byFamily = new Map<string, IndicatorSummary[]>();
  for (const indicator of matches) {
    const family: IndicatorFamily | undefined = getIndicatorMeta(indicator.indicator_code)?.family;
    const key = family ?? OTHER_FAMILY_LABEL;
    const bucket = byFamily.get(key) ?? [];
    bucket.push(indicator);
    byFamily.set(key, bucket);
  }

  const groups: FamilyGroup[] = [];
  for (const family of INDICATOR_FAMILY_ORDER) {
    const items = byFamily.get(family);
    if (items && items.length > 0) {
      groups.push({ key: family, label: INDICATOR_FAMILY_LABELS[family], items });
    }
  }
  const others = byFamily.get(OTHER_FAMILY_LABEL);
  if (others && others.length > 0) {
    groups.push({ key: OTHER_FAMILY_LABEL, label: OTHER_FAMILY_LABEL, items: others });
  }
  for (const group of groups) {
    group.items.sort((first, second) =>
      indicatorLabel(first.indicator_code).localeCompare(indicatorLabel(second.indicator_code), "es"),
    );
  }
  return groups;
}

function IndicatorCatalogCard({ indicator }: { indicator: IndicatorSummary }) {
  return (
    <a
      href={`/indicador/${indicator.indicator_code}`}
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
      <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-body)" }}>
        {indicatorLabel(indicator.indicator_code)}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
        }}
      >
        {indicator.indicator_code}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
        {indicator.sources.map((source) => (
          <span
            key={source}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-1)",
              background: "var(--bg-page)",
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {sourceLabel(source)}
          </span>
        ))}
        {indicator.sources.length >= 2 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              background: "var(--brecha-bg)",
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--brecha-strong)",
            }}
          >
            comparador
          </span>
        )}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        {indicator.count.toLocaleString("es-AR")} datos · último {formatDateAR(indicator.last_date)}
      </div>
    </a>
  );
}

export function IndicatorCatalog() {
  const { data, isLoading, isError, error, refetch } = useIndicators();
  const [query, setQuery] = useState("");

  const groups = useMemo(() => groupByFamily(data ?? [], query), [data, query]);
  const total = data?.length ?? 0;
  const shown = groups.reduce((sum, group) => sum + group.items.length, 0);

  if (isError) {
    return <QueryError error={error} onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "grid",
          gap: "var(--sp-4)",
          gridTemplateColumns: "repeat(auto-fill, minmax(var(--tile-min), 1fr))",
        }}
      >
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-[112px] rounded-[10px]" />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar indicador…"
        aria-label="Buscar indicador"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-2)",
          background: "var(--surface-card)",
          color: "var(--text-body)",
          fontSize: "0.9375rem",
        }}
      />
      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
        {query.trim().length > 0
          ? `${shown} de ${total} indicadores`
          : `${total} indicadores en ${groups.length} familias`}
      </p>

      {groups.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>No hay indicadores que coincidan con la búsqueda.</p>
      )}

      {groups.map((group) => (
        <section key={group.key} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          <h2
            style={{
              font: "var(--fw-bold) var(--fs-h3)/var(--lh-heading) var(--font-sans)",
              color: "var(--text-body)",
              margin: 0,
            }}
          >
            {group.label}
            <span style={{ marginLeft: 8, fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-muted)" }}>
              {group.items.length}
            </span>
          </h2>
          <div
            style={{
              display: "grid",
              gap: "var(--sp-4)",
              gridTemplateColumns: "repeat(auto-fill, minmax(var(--tile-min), 1fr))",
            }}
          >
            {group.items.map((indicator) => (
              <IndicatorCatalogCard key={indicator.indicator_code} indicator={indicator} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
