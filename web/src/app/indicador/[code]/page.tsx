import { JsonLd } from "@/components/JsonLd";
import { IndicatorDetail } from "@/components/indicator/IndicatorDetail";
import { getIndicatorDisplay } from "@/lib/indicators";
import { indicatorDetailData } from "@/lib/pageQueries";
import { PrefetchedQueries } from "@/lib/prefetch";
import { breadcrumbStructuredData, indicatorDatasetStructuredData } from "@/lib/structuredData";
import type { Metadata } from "next";

interface IndicatorPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: IndicatorPageProps): Promise<Metadata> {
  const { code } = await params;
  const indicator = getIndicatorDisplay(code);
  return {
    title: `${indicator.label} - La Brecha`,
    description: `Serie histórica de ${indicator.label} en Argentina, con su fuente, fecha y eventos políticos.`,
    alternates: { canonical: `/indicador/${code}` },
  };
}

export default async function IndicatorPage({ params }: IndicatorPageProps) {
  const { code } = await params;
  const indicator = getIndicatorDisplay(code);
  const { queries, sources } = await indicatorDetailData(code);

  return (
    <>
      <JsonLd data={indicatorDatasetStructuredData(indicator, sources)} />
      <JsonLd
        data={breadcrumbStructuredData([
          { name: "Indicadores", path: "/indicadores" },
          { name: indicator.label, path: `/indicador/${code}` },
        ])}
      />
      <PrefetchedQueries queries={queries}>
        <IndicatorDetail code={code} />
      </PrefetchedQueries>
    </>
  );
}
