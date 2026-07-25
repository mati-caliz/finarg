import { formatDateAR, getIndicatorDisplay, sourceLabel } from "@/lib/indicators";
import type { IndicatorSeries } from "@/lib/labrechaApi";
import { buildRssResponse, toRfc822 } from "@/lib/rss";
import { serverGet } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";

const REVALIDATE_SECONDS = 1800;
const FEED_POINTS = 30;

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const indicator = getIndicatorDisplay(code);
  const pageUrl = `${SITE_URL}/indicador/${code}`;

  let series: IndicatorSeries | undefined;
  try {
    series = await serverGet<IndicatorSeries>(
      `/indicators/${code}?limit=${FEED_POINTS}&order=desc`,
      REVALIDATE_SECONDS,
    );
  } catch {
    series = undefined;
  }

  const points = series?.points ?? [];

  return buildRssResponse(
    {
      title: `La Brecha — ${indicator.label}`,
      link: pageUrl,
      selfUrl: `${pageUrl}/feed.xml`,
      description: `Cada nuevo dato de ${indicator.label} en Argentina, con su fuente y su fecha.`,
      items: points.map((point) => {
        const value = Number.parseFloat(point.value);
        return {
          title: `${indicator.label}: ${indicator.format(value)}${indicator.unit ? ` ${indicator.unit}` : ""}`,
          link: pageUrl,
          guid: `${code}-${point.source}-${point.date}`,
          pubDate: toRfc822(point.date),
          category: sourceLabel(point.source),
          description: `${indicator.label} del ${formatDateAR(point.date)}: ${indicator.format(value)}${
            indicator.unit ? ` ${indicator.unit}` : ""
          }. Fuente: ${sourceLabel(point.source)}.`,
        };
      }),
    },
    REVALIDATE_SECONDS,
  );
}
