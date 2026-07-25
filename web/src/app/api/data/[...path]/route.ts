import { getRevalidateTime } from "@/lib/cacheRules";
import { getBackendUrl } from "@/lib/serverApi";
import type { NextRequest } from "next/server";

const JSON_CONTENT_TYPE = "application/json";
const FORWARDED_FOR = "x-forwarded-for";

function clientHeaders(request: NextRequest, accept: string): HeadersInit {
  const forwardedFor = request.headers.get(FORWARDED_FOR);
  return forwardedFor === null
    ? { Accept: accept }
    : { Accept: accept, [FORWARDED_FOR]: forwardedFor };
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
  const accept = request.headers.get("accept") ?? JSON_CONTENT_TYPE;

  const res = await fetch(url, {
    next: { revalidate },
    headers: clientHeaders(request, accept),
  });

  if (!res.ok) {
    return Response.json({ error: "Backend unavailable" }, { status: res.status });
  }

  const cacheControl = `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`;
  const contentType = res.headers.get("content-type") ?? JSON_CONTENT_TYPE;

  if (!contentType.includes(JSON_CONTENT_TYPE)) {
    const disposition = res.headers.get("content-disposition");
    return new Response(await res.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
        ...(disposition === null ? {} : { "Content-Disposition": disposition }),
      },
    });
  }

  const data = await res.json();

  return Response.json(data, { headers: { "Cache-Control": cacheControl } });
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
    headers: {
      "Content-Type": JSON_CONTENT_TYPE,
      ...clientHeaders(request, JSON_CONTENT_TYPE),
    },
    body,
  });

  const data = await res.json().catch(() => ({ error: "Invalid response" }));
  return Response.json(data, { status: res.status });
}
