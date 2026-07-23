"use client";

import { Badge, Card } from "@/components/core";
import {
  POST_CATEGORY_LABELS,
  POST_CATEGORY_TONES,
  formatPostDate,
} from "@/components/posts/postCategories";
import { QueryError } from "@/components/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/useLabrecha";
import { POST_CATEGORIES, type Post } from "@/lib/labrechaApi";
import Link from "next/link";
import { type CSSProperties, useState } from "react";

const SKELETON_KEYS = ["p1", "p2", "p3", "p4"];
const ALL_FILTER = "Todas";
const GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "var(--sp-4)",
  alignItems: "stretch",
};

function PostItem({ post }: { post: Post }) {
  return (
    <Link
      href={`/ideas/${post.slug}`}
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
        <Badge tone={POST_CATEGORY_TONES[post.category]}>
          {POST_CATEGORY_LABELS[post.category]}
        </Badge>
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          {formatPostDate(post.created_at)}
        </span>
      </div>
      <h3
        style={{
          font: "var(--fw-semibold) 1rem/var(--lh-heading) var(--font-sans)",
          margin: 0,
          color: "var(--text-body)",
        }}
      >
        {post.title}
      </h3>
      {post.summary && (
        <p
          style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}
        >
          {post.summary}
        </p>
      )}
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
                borderRadius: "var(--radius-md)",
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
            <Skeleton key={key} className="h-[110px] rounded-[10px]" />
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
