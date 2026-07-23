import { BaseMonetariaClockCard } from "@/components/home/BaseMonetariaClockCard";
import { BoletinFeedCard } from "@/components/home/BoletinFeedCard";
import { BrechaMedicionesCard } from "@/components/home/BrechaMedicionesCard";
import { CoparticipacionCard } from "@/components/home/CoparticipacionCard";
import { GastoPublicoClockCard } from "@/components/home/GastoPublicoClockCard";
import { IndicatorTileConnected } from "@/components/home/IndicatorTileConnected";
import { ImpuestometroCard } from "@/components/home/ImpuestometroCard";
import { InflationClockCard } from "@/components/home/InflationClockCard";
import { MonitorAlquileresCard } from "@/components/home/MonitorAlquileresCard";
import { MonitorBcraCard } from "@/components/home/MonitorBcraCard";
import { NewsTeaserCard } from "@/components/home/NewsTeaserCard";
import { ProximoFeriadoCard } from "@/components/home/ProximoFeriadoCard";
import { PromesometroFiscalCard } from "@/components/home/PromesometroFiscalCard";
import { RadarCreditoCard } from "@/components/home/RadarCreditoCard";
import { TermometroEmpleoCard } from "@/components/home/TermometroEmpleoCard";
import { TermometroSubsidiosCard } from "@/components/home/TermometroSubsidiosCard";
import { FEATURED_INDICATOR_CODES } from "@/lib/indicators";
import type { ReactNode } from "react";

function HomeSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-4)",
        scrollMarginTop: "var(--sp-8)",
      }}
    >
      <h2
        style={{
          font: "var(--fw-bold) var(--fs-h3)/var(--lh-heading) var(--font-sans)",
          color: "var(--text-body)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

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

      <HomeSection id="destacados" title="Indicadores destacados">
        <div
          style={{
            display: "grid",
            gap: "var(--sp-4)",
            gridTemplateColumns: "repeat(auto-fill, minmax(var(--tile-min), 1fr))",
          }}
        >
          {FEATURED_INDICATOR_CODES.map((code) => (
            <IndicatorTileConnected key={code} code={code} />
          ))}
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "var(--sp-2) 0 0" }}>
          <a href="/indicadores" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>
            Ver el catálogo completo →
          </a>
        </p>
      </HomeSection>

      <HomeSection id="contadores" title="Contadores y brecha en vivo">
        <div
          style={{
            display: "grid",
            gap: "var(--sp-4)",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <InflationClockCard />
          <BaseMonetariaClockCard />
          <GastoPublicoClockCard />
          <BrechaMedicionesCard />
        </div>
      </HomeSection>

      <HomeSection id="monitores" title="Monitores fiscal, monetario y social">
        <div
          style={{
            display: "grid",
            gap: "var(--sp-4)",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <PromesometroFiscalCard />
          <MonitorBcraCard />
          <TermometroEmpleoCard />
          <RadarCreditoCard />
          <ImpuestometroCard />
          <TermometroSubsidiosCard />
          <MonitorAlquileresCard />
        </div>
      </HomeSection>

      <HomeSection id="agenda" title="Agenda y noticias">
        <div
          style={{
            display: "grid",
            gap: "var(--sp-4)",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <NewsTeaserCard />
          <ProximoFeriadoCard />
        </div>
      </HomeSection>

      <section id="boletin" style={{ scrollMarginTop: "var(--sp-8)" }}>
        <BoletinFeedCard />
      </section>

      <section id="coparticipacion" style={{ scrollMarginTop: "var(--sp-8)" }}>
        <CoparticipacionCard />
      </section>
    </div>
  );
}
