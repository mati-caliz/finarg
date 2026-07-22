import type { BoletinSummary } from "@/lib/labrechaApi";
import { serverGet } from "@/lib/serverApi";

const SITE_URL = "https://labrecha.ar";
const AI_DISCLAIMER = "Resumen generado por IA. Verificá siempre contra la fuente oficial.";
const REVALIDATE_SECONDS = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string): string {
  const parsed = new Date(date.length <= 10 ? `${date}T12:00:00Z` : date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toUTCString();
  }
  return parsed.toUTCString();
}

function itemXml(summary: BoletinSummary): string {
  const bullets = (summary.summary ?? []).map((line) => `• ${line}`).join("\n");
  const description = `${bullets}\n\n${AI_DISCLAIMER}`;
  return `    <item>
      <title>${escapeXml(summary.title)}</title>
      <link>${escapeXml(summary.url)}</link>
      <guid isPermaLink="false">${escapeXml(summary.norma_id)}</guid>
      <category>${escapeXml(summary.category)}</category>
      <pubDate>${toRfc822(summary.date)}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
}

export async function GET() {
  let summaries: BoletinSummary[] = [];
  try {
    summaries = await serverGet<BoletinSummary[]>("/boletin/summaries?limit=50", REVALIDATE_SECONDS);
  } catch {
    summaries = [];
  }

  const items = summaries.map(itemXml).join("\n");
  const lastBuild =
    summaries.length > 0 ? toRfc822(summaries[0].date) : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>La Brecha — Boletín Oficial en criollo</title>
    <link>${SITE_URL}</link>
    <description>Las normas económicas y regulatorias del Boletín Oficial, resumidas por IA. ${AI_DISCLAIMER}</description>
    <language>es-AR</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS * 2}`,
    },
  });
}
