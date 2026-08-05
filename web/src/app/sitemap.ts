import { INDICATOR_META } from "@/lib/indicators";
import type { CongressVote, Post } from "@/lib/labrechaApi";
import { congressVotesQuery, postsQuery } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

const SITEMAP_VOTES_LIMIT = 300;
const SITEMAP_POSTS_LIMIT = 200;

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

interface SitemapRoute {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  lastModified?: string;
}

const STATIC_ROUTES: SitemapRoute[] = [
  { path: "", changeFrequency: "hourly", priority: 1 },
  { path: "/indicadores", changeFrequency: "daily", priority: 0.9 },
  { path: "/brechas", changeFrequency: "daily", priority: 0.9 },
  { path: "/comparar", changeFrequency: "weekly", priority: 0.8 },
  { path: "/congreso", changeFrequency: "weekly", priority: 0.8 },
  { path: "/noticias", changeFrequency: "hourly", priority: 0.6 },
  { path: "/ideas", changeFrequency: "weekly", priority: 0.7 },
  { path: "/feriados", changeFrequency: "monthly", priority: 0.5 },
  { path: "/estado", changeFrequency: "daily", priority: 0.4 },
  { path: "/metodologia", changeFrequency: "monthly", priority: 0.6 },
  { path: "/api-publica", changeFrequency: "monthly", priority: 0.5 },
  { path: "/calculadoras", changeFrequency: "monthly", priority: 0.6 },
  { path: "/calculadora-sueldo-neto", changeFrequency: "monthly", priority: 0.7 },
  { path: "/calculadora-impacto-fiscal", changeFrequency: "monthly", priority: 0.7 },
  { path: "/calculadora-interes-compuesto", changeFrequency: "monthly", priority: 0.6 },
  { path: "/calculadora-ajuste-inflacion", changeFrequency: "monthly", priority: 0.6 },
  { path: "/boletin.xml", changeFrequency: "daily", priority: 0.5 },
  { path: "/brechas.xml", changeFrequency: "daily", priority: 0.5 },
];

function indicatorRoutes(): SitemapRoute[] {
  return Object.keys(INDICATOR_META).flatMap((code) => [
    { path: `/indicador/${code}`, changeFrequency: "daily" as const, priority: 0.85 },
    { path: `/indicador/${code}/feed.xml`, changeFrequency: "daily" as const, priority: 0.4 },
  ]);
}

function isUsableId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function postRoutes(posts: Post[]): SitemapRoute[] {
  return posts
    .filter((post) => isUsableId(post.slug))
    .map((post) => ({
      path: `/ideas/${post.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(isUsableId(post.updated_at) ? { lastModified: post.updated_at } : {}),
    }));
}

function voteRoutes(votes: CongressVote[]): SitemapRoute[] {
  return votes
    .filter((vote) => isUsableId(vote.vote_record_id))
    .map((vote) => ({
      path: `/congreso/votacion/${vote.vote_record_id}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
      ...(isUsableId(vote.date) ? { lastModified: vote.date } : {}),
    }));
}

function deduplicateByPath(routes: SitemapRoute[]): SitemapRoute[] {
  const byPath = new Map<string, SitemapRoute>();
  for (const route of routes) {
    if (!byPath.has(route.path)) {
      byPath.set(route.path, route);
    }
  }
  return Array.from(byPath.values());
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, votes] = await Promise.all([
    postsQuery({ limit: SITEMAP_POSTS_LIMIT })
      .queryFn()
      .catch(() => [] as Post[]),
    congressVotesQuery({ limit: SITEMAP_VOTES_LIMIT })
      .queryFn()
      .catch(() => [] as CongressVote[]),
  ]);

  const now = new Date();
  return deduplicateByPath([
    ...STATIC_ROUTES,
    ...indicatorRoutes(),
    ...postRoutes(posts),
    ...voteRoutes(votes),
  ]).map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: route.lastModified === undefined ? now : new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
