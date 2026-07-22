import { NewsFeed } from "@/components/news/NewsFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Noticias económicas - La Brecha",
  description:
    "Últimos titulares de economía de Argentina, con su fuente y fecha, enlazados a la nota original.",
};

export default function NoticiasPage() {
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
          Noticias económicas
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", margin: 0 }}>
          Los últimos titulares de economía, con su fuente y fecha. Cada nota enlaza al medio
          original.
        </p>
      </header>

      <NewsFeed />
    </div>
  );
}
