import type { NextRequest } from "next/server";

const CACHE_RULES: Array<{ pattern: RegExp; revalidate: number }> = [
  { pattern: /^political-events/, revalidate: 86400 },
  { pattern: /^congress/, revalidate: 86400 },
  { pattern: /^senate/, revalidate: 86400 },
  { pattern: /^holidays/, revalidate: 86400 },
  { pattern: /^scrape-runs/, revalidate: 300 },
  { pattern: /^news/, revalidate: 900 },
  { pattern: /^indicators/, revalidate: 1800 },
];

function getBackendUrl(): string {
  return (
    process.env.LABRECHA_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_LABRECHA_API_URL ||
    "http://localhost:8000"
  );
}

function getRevalidateTime(path: string): number {
  for (const rule of CACHE_RULES) {
    if (rule.pattern.test(path)) {
      return rule.revalidate;
    }
  }
  return 1800;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : "";
  const url = `${getBackendUrl()}/${pathStr}${queryString}`;
  const revalidate = getRevalidateTime(pathStr);

  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    return Response.json({ error: "Backend unavailable" }, { status: res.status });
  }

  const data = await res.json();

  return Response.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${getBackendUrl()}/${pathStr}`;
  const body = await request.text();

  const res = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body,
  });

  const data = await res.json().catch(() => ({ error: "Invalid response" }));
  return Response.json(data, { status: res.status });
}
