import { BrechaComparison } from "@/components/indicator/BrechaComparison";
import { BRECHAS } from "@/lib/brechas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brechas entre mediciones - La Brecha",
  description:
    "La brecha cambiaria, la brecha financiera, la inflación esperada vs. medida y las reservas según distintas fuentes: dos series superpuestas con su discrepancia, fuente y fecha.",
};

export default function BrechasPage() {
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
          Brechas entre mediciones
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", margin: 0 }}>
          Un mismo fenómeno medido de dos maneras. Mostrar la discrepancia —el ámbar entre las
          curvas— es la razón de ser del observatorio. Cada brecha lleva su fuente y fecha por
          medición.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-[var(--sp-6)] xl:grid-cols-2">
        {BRECHAS.map((def) => (
          <section key={def.id} id={def.id} style={{ scrollMarginTop: "var(--sp-8)" }}>
            <BrechaComparison id={def.id} />
          </section>
        ))}
      </div>
    </div>
  );
}
