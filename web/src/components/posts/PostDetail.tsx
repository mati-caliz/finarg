"use client";

import { Badge } from "@/components/core";
import {
  POST_CATEGORY_LABELS,
  POST_CATEGORY_TONES,
  formatPostDate,
} from "@/components/posts/postCategories";
import { QueryError } from "@/components/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { usePost } from "@/hooks/useLabrecha";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
