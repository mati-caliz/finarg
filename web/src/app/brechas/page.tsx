import { BrechaComparison } from "@/components/indicator/BrechaComparison";
import { BrechaRankList } from "@/components/indicator/BrechaRankList";
import { BRECHAS } from "@/lib/brechas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brechas entre mediciones - La Brecha",
  description:
    "La brecha cambiaria, la brecha financiera, la inflación esperada vs. medida y las reservas según distintas fuentes: dos series superpuestas con su discrepancia, fuente y fecha.",
};

export default function BrechasPage() {
  return (
    <div>
      <section style={{ background: "var(--brecha-bg)", borderBottom: "1px solid var(--brecha-ln)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "52px 24px 46px" }}>
          <div
            style={{
              fontFamily: "var(--font-jb-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--brecha)",
              marginBottom: 16,
            }}
          >
            ◆ /brechas
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(2.25rem, 6vw, 3.25rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.025em",
              margin: "0 0 18px",
              maxWidth: 820,
              color: "var(--ink)",
              textWrap: "balance",
            }}
          >
            Cuando dos fuentes miden lo mismo y no coinciden
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1rem, 2.2vw, 1.25rem)",
              lineHeight: 1.5,
              color: "var(--ink2)",
              margin: 0,
              maxWidth: 660,
              textWrap: "pretty",
            }}
          >
            Las discrepancias que seguimos, ordenadas por magnitud. Cada brecha compara dos
            mediciones del mismo fenómeno y muestra la fuente y la fecha de cada una.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px 72px" }}>
        <BrechaRankList />

        <div style={{ marginTop: 56, borderTop: "2px solid var(--ink)", paddingTop: 32 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
              letterSpacing: "-0.02em",
              margin: "0 0 24px",
            }}
          >
            El detalle de cada brecha
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {BRECHAS.map((def) => (
              <section key={def.id} id={def.id} style={{ scrollMarginTop: 80 }}>
                <BrechaComparison id={def.id} />
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
