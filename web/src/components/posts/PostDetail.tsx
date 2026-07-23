"use client";

import { Badge } from "@/components/core";
import {
  POST_CATEGORY_LABELS,
  POST_CATEGORY_TONES,
  formatPostDate,
} from "@/components/posts/postCategories";
import { POST_IMPACT_META, readingTimeMinutes } from "@/components/posts/postImpacts";
import { QueryError } from "@/components/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { usePost } from "@/hooks/useLabrecha";
import type { PostImpact } from "@/lib/labrechaApi";
import { ArrowLeft, Clock3 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ImpactTile({ impact }: { impact: PostImpact }) {
  const meta = POST_IMPACT_META[impact.kind];
  const Icon = meta.icon;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "12px 14px",
        borderRadius: "var(--radius-lg)",
        background: meta.background,
        border: `1px solid ${meta.border}`,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: "0.6875rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: meta.color,
        }}
      >
        <Icon size={13} strokeWidth={2.2} aria-hidden />
        {meta.label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.25rem",
          fontWeight: 700,
          color: meta.color,
          lineHeight: 1.1,
        }}
      >
        {impact.value}
      </span>
      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
        {impact.label}
      </span>
    </div>
  );
}

function ImpactGrid({ impacts }: { impacts: PostImpact[] }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h2
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
          margin: 0,
        }}
      >
        Impacto estimado
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--sp-3)",
        }}
      >
        {impacts.map((impact) => (
          <ImpactTile key={`${impact.kind}-${impact.value}`} impact={impact} />
        ))}
      </div>
    </section>
  );
}

export function PostDetail({ slug }: { slug: string }) {
  const { data: post, isLoading, isError, error, refetch } = usePost(slug);

  if (isError) {
    return <QueryError error={error} onRetry={() => refetch()} />;
  }

  if (isLoading || !post) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
        <Skeleton className="h-[40px] w-2/3 rounded-[10px]" />
        <Skeleton className="h-[300px] rounded-[10px]" />
      </div>
    );
  }

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
      <Link
        href="/ideas"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--text-link)",
          textDecoration: "none",
        }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a Ideas
      </Link>

      <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Badge tone={POST_CATEGORY_TONES[post.category]}>
            {POST_CATEGORY_LABELS[post.category]}
          </Badge>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {formatPostDate(post.created_at)}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            <Clock3 size={12} aria-hidden />
            {readingTimeMinutes(post.content)} min de lectura
          </span>
        </div>
        <h1
          style={{
            font: "var(--fw-bold) var(--fs-h1)/var(--lh-heading) var(--font-sans)",
            color: "var(--text-body)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {post.title}
        </h1>
        {post.summary && (
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            {post.summary}
          </p>
        )}
      </header>

      {(post.impacts ?? []).length > 0 && <ImpactGrid impacts={post.impacts ?? []} />}

      <div
        className="post-markdown"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-card)",
          padding: "var(--sp-6)",
          fontSize: "0.9375rem",
          lineHeight: 1.7,
          color: "var(--text-body)",
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
