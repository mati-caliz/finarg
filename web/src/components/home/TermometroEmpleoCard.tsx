"use client";

import { Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicatorSeries } from "@/hooks/useLabrecha";
import type { IndicatorSeries } from "@/lib/labrechaApi";
import { formatDateAR, formatNumberAR } from "@/lib/indicators";

const SOURCE = "datosgobar";

function latestValue(series: IndicatorSeries | undefined): number | undefined {
  const point = series?.points?.[0];
  return point ? Number.parseFloat(point.value) : undefined;
}

function latestDate(series: IndicatorSeries | undefined): string | undefined {
  return series?.points?.[0]?.date;
}

interface Segment {
  label: string;
  value: number;
  color: string;
}

export function TermometroEmpleoCard() {
  const privado = useIndicatorSeries("empleo_asalariado_privado", { source: SOURCE, limit: 1 });
  const publico = useIndicatorSeries("empleo_asalariado_publico", { source: SOURCE, limit: 1 });
  const autonomo = useIndicatorSeries("empleo_independiente_autonomo", { source: SOURCE, limit: 1 });
  const monotributo = useIndicatorSeries("empleo_independiente_monotributo", {
    source: SOURCE,
    limit: 1,
  });
  const monotributoSocial = useIndicatorSeries("empleo_independiente_monotributo_social", {
    source: SOURCE,
    limit: 1,
  });
  const casasParticulares = useIndicatorSeries("empleo_casas_particulares", {
    source: SOURCE,
    limit: 1,
  });
  const noRegistrado = useIndicatorSeries("empleo_no_registrado", { source: SOURCE, limit: 1 });

  const queries = [
    privado,
    publico,
    autonomo,
    monotributo,
    monotributoSocial,
    casasParticulares,
    noRegistrado,
  ];
  if (queries.some((query) => query.isLoading)) {
    return <Skeleton className="h-[220px] rounded-[10px]" />;
  }

  const privadoValue = latestValue(privado.data);
  const publicoValue = latestValue(publico.data);
  const autonomoValue = latestValue(autonomo.data);
  const monotributoValue = latestValue(monotributo.data);
  const monotributoSocialValue = latestValue(monotributoSocial.data);
  const casasValue = latestValue(casasParticulares.data);
  const noRegistradoValue = latestValue(noRegistrado.data);

  if (
    privadoValue === undefined ||
    publicoValue === undefined ||
    autonomoValue === undefined ||
    monotributoValue === undefined ||
    monotributoSocialValue === undefined ||
    casasValue === undefined
  ) {
    return null;
  }

  const independientes = autonomoValue + monotributoValue + monotributoSocialValue;
  const segments: Segment[] = [
    { label: "Asalariados privados", value: privadoValue, color: "var(--serie-1)" },
    { label: "Sector público", value: publicoValue, color: "var(--serie-2)" },
    { label: "Independientes (autónomos + monotributo)", value: independientes, color: "var(--serie-3)" },
    { label: "Casas particulares", value: casasValue, color: "var(--serie-4)" },
  ];
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const compositionDate = latestDate(privado.data);

  return (
    <Card
      title="Termómetro del empleo"
      subtitle="Composición del empleo registrado (SIPA), en millones de trabajadores"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", height: 34, borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          {segments.map((segment) => (
            <div
              key={segment.label}
              title={`${segment.label}: ${formatNumberAR(segment.value / 1000, 2)} M (${formatNumberAR((segment.value / total) * 100, 1)}%)`}
              style={{ width: `${(segment.value / total) * 100}%`, background: segment.color }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {segments.map((segment) => (
            <div
              key={segment.label}
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem" }}
            >
              <span
                style={{ width: 10, height: 10, borderRadius: 3, background: segment.color, flexShrink: 0 }}
              />
              <span style={{ color: "var(--text-secondary)", flex: 1 }}>{segment.label}</span>
              <span className="num" style={{ fontWeight: 600 }}>
                {formatNumberAR(segment.value / 1000, 2)} M
              </span>
              <span className="num" style={{ color: "var(--text-muted)", minWidth: 48, textAlign: "right" }}>
                {formatNumberAR((segment.value / total) * 100, 1)}%
              </span>
            </div>
          ))}
        </div>

        {noRegistradoValue !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--gap-bg)",
              color: "var(--gap-accent)",
            }}
          >
            <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Empleo no registrado ("en negro")</span>
            <span className="num" style={{ fontSize: "1.125rem", fontWeight: 600 }}>
              {formatNumberAR(noRegistradoValue, 1)}%
            </span>
            <span style={{ fontSize: "0.6875rem" }}>de los asalariados</span>
          </div>
        )}

        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Composición: trabajadores registrados (SIPA, Secretaría de Trabajo) vía datos.gob.ar
          {compositionDate ? ` · ${formatDateAR(compositionDate)}` : ""}. El empleo no registrado surge de
          la EPH (INDEC, trimestral{noRegistrado.data?.points?.[0]
            ? ` · ${formatDateAR(noRegistrado.data.points[0].date)}`
            : ""}), con base de medición distinta a los registrados: por eso se muestra aparte y no dentro
          de la barra.
        </div>
      </div>
    </Card>
  );
}
