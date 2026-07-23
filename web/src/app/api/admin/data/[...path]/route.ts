import { hasValidSession } from "@/lib/adminSession";
import type { NextRequest } from "next/server";

function getBackendUrl(): string {
  return (
    process.env.LABRECHA_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_LABRECHA_API_URL ||
    "http://localhost:8000"
  );
}

async function proxyToBackend(
  request: NextRequest,
  pathSegments: string[],
  method: "GET" | "POST" | "PUT" | "DELETE",
) {
  if (!hasValidSession(request)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const adminToken = process.env.LABRECHA_ADMIN_TOKEN || "";
  if (adminToken.length === 0) {
    return Response.json({ error: "LABRECHA_ADMIN_TOKEN no configurado" }, { status: 500 });
  }

  const url = `${getBackendUrl()}/${pathSegments.join("/")}`;
  const hasBody = method === "POST" || method === "PUT";
  const body = hasBody ? await request.text() : undefined;

  const backendResponse = await fetch(url, {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Admin-Token": adminToken,
    },
    body,
  });

  if (backendResponse.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = await backendResponse.json().catch(() => ({ error: "Respuesta inválida del backend" }));
  return Response.json(data, { status: backendResponse.status });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxyToBackend(request, path, "GET");
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxyToBackend(request, path, "POST");
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxyToBackend(request, path, "PUT");
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxyToBackend(request, path, "DELETE");
}
