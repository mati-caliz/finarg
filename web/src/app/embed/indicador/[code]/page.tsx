import { EmbeddedIndicator } from "@/components/indicator/EmbeddedIndicator";
import type { IndicatorSeries } from "@/lib/labrechaApi";
import { indicatorSeriesQuery } from "@/lib/queries";
import type { Metadata } from "next";

const EMBED_POINTS = 180;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface EmbedPageProps {
  params: Promise<{ code: string }>;
}

export default async function EmbedIndicatorPage({ params }: EmbedPageProps) {
  const { code } = await params;
  const series = await indicatorSeriesQuery(code, { limit: EMBED_POINTS, order: "asc" })
    .queryFn()
    .catch(() => ({ indicator_code: code, points: [] }) as IndicatorSeries);

  return <EmbeddedIndicator code={code} points={series.points ?? []} />;
}
