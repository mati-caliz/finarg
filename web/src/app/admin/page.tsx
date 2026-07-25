import { AdminPostsPanel } from "@/components/admin/AdminPostsPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración - La Brecha",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
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
            font: "var(--fw-bold) var(--fs-h1)/var(--lh-heading) var(--font-display)",
            color: "var(--ink)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Administración
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--ink3)", margin: 0 }}>
          Alta, edición y baja de publicaciones de la sección Ideas.
        </p>
      </header>

      <AdminPostsPanel />
    </div>
  );
}
