import { getRevalidateTime } from "@/lib/cacheRules";
import { getBackendUrl } from "@/lib/serverApi";
import type { NextRequest } from "next/server";

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
