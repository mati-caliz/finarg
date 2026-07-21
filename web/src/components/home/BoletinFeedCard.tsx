"use client";

import { Badge, Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoletinSummaries } from "@/hooks/useLabrecha";
import type { BoletinSummary } from "@/lib/labrechaApi";
import { formatDateAR } from "@/lib/indicators";

const CATEGORY_LABELS: Record<string, string> = {
  impuesto: "Impuestos",
  regulacion: "Regulación",
  monetario: "Monetario",
  laboral: "Laboral",
  subsidio: "Subsidios",
  tarifa: "Tarifas",
  otro: "Otro",
};

function BoletinItem({ item }: { item: BoletinSummary }) {
  return (
    <li
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "14px 0",
        borderTop: "1px solid var(--border-1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Badge tone="accent">{CATEGORY_LABELS[item.category] ?? item.category}</Badge>
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          {formatDateAR(item.date)}
        </span>
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-body)" }}
      >
        {item.title}
      </a>
      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
        {item.summary.map((bullet) => (
          <li key={bullet} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
            {bullet}
          </li>
        ))}
      </ul>
    </li>
  );
}

export function BoletinFeedCard() {
  const { data, isLoading } = useBoletinSummaries({ limit: 6 });

  if (isLoading) {
    return <Skeleton className="h-[260px] rounded-[10px]" />;
  }

  const items = data ?? [];
  if (items.length === 0) {
    return null;
  }

  return (
    <Card
      title="Boletín Oficial, en criollo"
      subtitle="Las normas económicas y regulatorias del día, resumidas en 3 viñetas"
      actions={<Badge tone="evento">IA</Badge>}
      footer={
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          Resúmenes generados por IA a partir del Boletín Oficial (primera sección). Verificá siempre
          contra la norma original en el enlace.
        </span>
      }
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((item) => (
          <BoletinItem key={item.norma_id} item={item} />
        ))}
      </ul>
    </Card>
  );
}
