import { BrechaMedicionesCard } from "@/components/home/BrechaMedicionesCard";
import { IndicatorTileConnected } from "@/components/home/IndicatorTileConnected";
import { InflationClockCard } from "@/components/home/InflationClockCard";
import { MonitorBcraCard } from "@/components/home/MonitorBcraCard";
import { FEATURED_INDICATOR_CODES } from "@/lib/indicators";

export default function HomePage() {
  const today = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
            letterSpacing: "-0.01em",
          }}
        >
          Estado del país
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", margin: 0 }}>
          Indicadores político-económicos de Argentina, con su fuente y fecha. Actualizado al{" "}
          {today}.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gap: "var(--sp-4)",
          gridTemplateColumns: "repeat(auto-fill, minmax(var(--tile-min), 1fr))",
        }}
      >
        {FEATURED_INDICATOR_CODES.map((code) => (
          <IndicatorTileConnected key={code} code={code} />
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gap: "var(--sp-4)",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        <InflationClockCard />
        <BrechaMedicionesCard />
      </section>

      <section>
        <MonitorBcraCard />
      </section>
    </div>
  );
}
