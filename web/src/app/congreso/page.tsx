import { BlocAttendance } from "@/components/congress/BlocAttendance";
import { DeputiesComposition } from "@/components/congress/DeputiesComposition";
import { LatestVotes } from "@/components/congress/LatestVotes";
import { RecentLaws } from "@/components/congress/RecentLaws";
import { SenateComposition } from "@/components/congress/SenateComposition";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Congreso - La Brecha",
  description:
    "Composición del Senado por bloque y últimas votaciones nominales de la Cámara de Diputados de Argentina.",
};

export default function CongresoPage() {
  return (
    <div
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-8)",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h1
          style={{
            font: "var(--fw-bold) var(--fs-h1)/var(--lh-heading) var(--font-sans)",
            color: "var(--text-body)",
            margin: 0,
          }}
        >
          Congreso
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", margin: 0 }}>
          Composición del Senado y votaciones nominales de Diputados.
        </p>
      </header>

      <SenateComposition />

      <DeputiesComposition />

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
        <h2
          style={{
            font: "var(--fw-semibold) var(--fs-h3)/var(--lh-heading) var(--font-sans)",
            margin: 0,
          }}
        >
          Últimas leyes sancionadas
        </h2>
        <RecentLaws />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
        <h2
          style={{
            font: "var(--fw-semibold) var(--fs-h3)/var(--lh-heading) var(--font-sans)",
            margin: 0,
          }}
        >
          Últimas votaciones de Diputados
        </h2>
        <LatestVotes />
      </section>

      <BlocAttendance />
    </div>
  );
}
