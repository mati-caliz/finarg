import { IndicatorCatalog } from "@/components/indicator/IndicatorCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indicadores - La Brecha",
  description:
    "Catálogo completo de indicadores político-económicos de Argentina: precios, dólar, monetario, fiscal, empleo y social, con su fuente y fecha.",
};

export default function IndicadoresPage() {
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
          Indicadores
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", margin: 0 }}>
          Catálogo completo de las series que reúne el observatorio, agrupadas por familia. Cada una
          abre su serie histórica anotada, con fuente y fecha.
        </p>
      </header>

      <IndicatorCatalog />
    </div>
  );
}
