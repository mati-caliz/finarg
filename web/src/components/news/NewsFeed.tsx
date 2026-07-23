"use client";

import { Badge, Card } from "@/components/core";
import { QueryError } from "@/components/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews } from "@/hooks/useLabrecha";
import type { NewsArticle } from "@/lib/labrechaApi";
import { ExternalLink } from "lucide-react";

const NEWS_LIMIT = 40;

const CATEGORY_LABELS: Record<string, string> = {
  ECONOMY_GENERAL: "Economía",
  MARKETS: "Mercados",
  FINANCE: "Finanzas",
  ENERGY: "Energía",
  POLITICS: "Política",
};

const SKELETON_KEYS = ["n1", "n2", "n3", "n4", "n5", "n6"];

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ").toLowerCase();
}

function formatPublished(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NewsItem({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Badge tone="accent">{categoryLabel(article.category)}</Badge>
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          {article.source} · {formatPublished(article.published_date)}
        </span>
      </div>
      <h3
        style={{
          font: "var(--fw-semibold) 1rem/var(--lh-heading) var(--font-sans)",
          margin: 0,
          color: "var(--text-body)",
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
        }}
      >
        <span>{article.title}</span>
        <ExternalLink className="h-3.5 w-3.5" style={{ flexShrink: 0, marginTop: 3, color: "var(--text-muted)" }} />
      </h3>
      {article.summary && (
        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
          {article.summary}
        </p>
      )}
    </a>
  );
}

export function NewsFeed() {
  const { data, isLoading, isError, error, refetch } = useNews({ limit: NEWS_LIMIT });

  if (isError) {
    return <QueryError error={error} onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-[var(--sp-4)] md:grid-cols-2">
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-[120px] rounded-[10px]" />
        ))}
      </div>
    );
  }

  const articles = data ?? [];
  if (articles.length === 0) {
    return (
      <Card>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Todavía no hay noticias ingeridas. Volvé más tarde.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
      <div className="grid grid-cols-1 gap-[var(--sp-4)] md:grid-cols-2">
        {articles.map((article) => (
          <NewsItem key={article.source_url} article={article} />
        ))}
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
        Titulares de El Economista, enlazados a la nota original. La Brecha no edita ni reproduce el
        contenido completo.
      </p>
    </div>
  );
}
