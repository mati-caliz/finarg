import { IndicatorDetail } from "@/components/indicator/IndicatorDetail";
import { getIndicatorDisplay } from "@/lib/indicators";
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
  };
}

export default async function IndicatorPage({ params }: IndicatorPageProps) {
  const { code } = await params;
  return <IndicatorDetail code={code} />;
}
