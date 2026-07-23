"use client";

import { Badge, Card } from "@/components/core";
import {
  POST_CATEGORY_LABELS,
  POST_CATEGORY_TONES,
  formatPostDate,
} from "@/components/posts/postCategories";
import { POST_IMPACT_META, readingTimeMinutes } from "@/components/posts/postImpacts";
import { QueryError } from "@/components/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/useLabrecha";
import { POST_CATEGORIES, type Post, type PostImpact } from "@/lib/labrechaApi";
import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { type CSSProperties, useState } from "react";

const SKELETON_KEYS = ["p1", "p2", "p3", "p4"];
const ALL_FILTER = "Todas";
const GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "var(--sp-4)",
  alignItems: "stretch",
};
const SUMMARY_CLAMP_STYLE: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--text-secondary)",
  margin: 0,
  lineHeight: 1.55,
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
};

function ImpactChip({ impact }: { impact: PostImpact }) {
  const meta = POST_IMPACT_META[impact.kind];
  const Icon = meta.icon;
  return (
    <span
      title={`${meta.label}: ${impact.label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: "var(--radius-pill)",
        background: meta.background,
        border: `1px solid ${meta.border}`,
        color: meta.color,
        fontSize: "0.75rem",
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={12} strokeWidth={2.2} aria-hidden />
      {impact.value}
    </span>
  );
}

function PostItem({ post }: { post: Post }) {
  const impacts = post.impacts ?? [];
  return (
    <Link
      href={`/ideas/${post.slug}`}
      className="group"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "16px 18px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-1)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        textDecoration: "none",
        color: "var(--text-body)",
        transition:
          "border-color 140ms ease-out, box-shadow 140ms ease-out, transform 140ms ease-out",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = "var(--accent-border)";
        event.currentTarget.style.boxShadow = "var(--shadow-raised)";
        event.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = "var(--border-1)";
        event.currentTarget.style.boxShadow = "var(--shadow-card)";
        event.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Badge tone={POST_CATEGORY_TONES[post.category]}>
          {POST_CATEGORY_LABELS[post.category]}
        </Badge>
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          {formatPostDate(post.created_at)}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
            marginLeft: "auto",
          }}
        >
          <Clock3 size={11} aria-hidden />
          {readingTimeMinutes(post.content)} min
        </span>
      </div>

      <h3
        style={{
          font: "var(--fw-semibold) 1.0625rem/var(--lh-heading) var(--font-sans)",
          margin: 0,
          color: "var(--text-body)",
          letterSpacing: "-0.01em",
        }}
      >
        {post.title}
      </h3>

      {post.summary && <p style={SUMMARY_CLAMP_STYLE}>{post.summary}</p>}

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          paddingTop: 10,
          borderTop: "1px solid var(--border-1)",
        }}
      >
        {impacts.length > 0 ? (
          impacts.map((impact) => (
            <ImpactChip key={`${impact.kind}-${impact.value}`} impact={impact} />
          ))
        ) : (
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Leer la propuesta</span>
        )}
        <span
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            color: "var(--text-link)",
          }}
        >
          <ArrowRight size={14} aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function PostsFeed() {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);
  const activeCategory = POST_CATEGORIES.find(
    (category) => POST_CATEGORY_LABELS[category] === activeFilter,
  );
  const { data, isLoading, isError, error, refetch } = usePosts(
    activeCategory ? { category: activeCategory } : undefined,
  );

  const filterItems = [ALL_FILTER, ...POST_CATEGORIES.map((category) => POST_CATEGORY_LABELS[category])];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {filterItems.map((item) => {
          const active = item === activeFilter;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setActiveFilter(item)}
              style={{
                padding: "5px 12px",
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${active ? "var(--accent-border)" : "var(--border-1)"}`,
                background: active ? "var(--accent-soft)" : "var(--surface-card)",
                color: active ? "var(--accent-strong)" : "var(--text-secondary)",
                fontSize: "0.8125rem",
                fontWeight: active ? 600 : 500,
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      {isError && <QueryError error={error} onRetry={() => refetch()} />}

      {isLoading && (
        <div style={GRID_STYLE}>
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-[170px] rounded-[10px]" />
          ))}
        </div>
      )}

      {!isLoading && !isError && (data ?? []).length === 0 && (
        <Card>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Todavía no hay publicaciones en esta categoría.
          </p>
        </Card>
      )}

      {(data ?? []).length > 0 && (
        <div style={GRID_STYLE}>
          {(data ?? []).map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
