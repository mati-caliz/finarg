import { PostsFeed } from "@/components/posts/PostsFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ideas - La Brecha",
  description:
    "Ideas, leyes y análisis para Argentina: propuestas concretas publicadas por el observatorio.",
};

export default function IdeasPage() {
  return (
    <div
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-6)",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h1
          style={{
            font: "var(--fw-bold) var(--fs-h1)/var(--lh-heading) var(--font-sans)",
            color: "var(--text-body)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Ideas
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", margin: 0 }}>
          Propuestas concretas para Argentina: ideas, leyes y análisis publicados por el
          observatorio.
        </p>
      </header>

      <PostsFeed />
    </div>
  );
}
