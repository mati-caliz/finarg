"use client";

import { Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews } from "@/hooks/useLabrecha";
import Link from "next/link";

const TEASER_LIMIT = 5;

function formatDay(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export function NewsTeaserCard() {
  const { data, isLoading } = useNews({ limit: TEASER_LIMIT });

  if (isLoading) {
    return <Skeleton className="h-[280px] rounded-[10px]" />;
  }

  const articles = data ?? [];
  if (articles.length === 0) {
    return null;
  }

  return (
    <Card
      title="Últimas noticias"
      subtitle="Titulares de economía, con su fuente"
      footer={
        <Link href="/noticias" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
          Ver todas las noticias →
        </Link>
      }
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {articles.map((article, index) => (
          <a
            key={article.source_url}
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 0",
              borderTop: index === 0 ? "none" : "1px solid var(--border-1)",
              textDecoration: "none",
              color: "var(--text-body)",
            }}
          >
            <span
              className="num"
              style={{ fontSize: "0.6875rem", color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }}
            >
              {formatDay(article.published_date)}
            </span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 500, lineHeight: 1.4 }}>
              {article.title}
            </span>
          </a>
        ))}
      </div>
    </Card>
  );
}
