import type { NextRequest } from "next/server";

const CACHE_RULES: Array<{ pattern: RegExp; revalidate: number }> = [
  { pattern: /exchange-bands/, revalidate: 86400 },
  { pattern: /governments/, revalidate: 3600 },
  { pattern: /history/, revalidate: 3600 },
  { pattern: /inflation/, revalidate: 3600 },
  { pattern: /indicators/, revalidate: 3600 },
  { pattern: /reserves/, revalidate: 1800 },
  { pattern: /country-risk/, revalidate: 1800 },
  { pattern: /quotes/, revalidate: 300 },
  { pattern: /gap/, revalidate: 300 },
  { pattern: /crypto/, revalidate: 300 },
  { pattern: /investments\/crypto/, revalidate: 300 },
  { pattern: /investments\/stocks/, revalidate: 300 },
  { pattern: /investments\/cedears/, revalidate: 300 },
  { pattern: /investments\/bonds/, revalidate: 1800 },
  { pattern: /investments\/etf/, revalidate: 300 },
  { pattern: /investments\/metals/, revalidate: 300 },
  { pattern: /rates/, revalidate: 1800 },
  { pattern: /news/, revalidate: 300 },
  { pattern: /feriados/, revalidate: 86400 },
];

function getBackendUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1"
  );
}

function getRevalidateTime(path: string): number {
  for (const rule of CACHE_RULES) {
    if (rule.pattern.test(path)) {
      return rule.revalidate;
    }
  }
  return 300;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : "";
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/${pathStr}${queryString}`;
  const revalidate = getRevalidateTime(pathStr);

  const res = await fetch(url, {
    next: { revalidate },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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
