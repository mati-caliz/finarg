import {
  ADMIN_SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  hasValidSession,
  verifyPassword,
} from "@/lib/adminSession";
import { clientIp } from "@/lib/clientIp";
import {
  blockedRetryAfterSeconds,
  clearFailedAttempts,
  registerFailedAttempt,
} from "@/lib/loginAttempts";
import type { NextRequest } from "next/server";

function sessionCookie(value: string, maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

export function GET(request: NextRequest) {
  return Response.json({ authenticated: hasValidSession(request) });
}

export async function POST(request: NextRequest) {
  const client = clientIp(request);
  const retryAfter = blockedRetryAfterSeconds(client);
  if (retryAfter !== null) {
    return Response.json(
      { error: "Demasiados intentos fallidos. Probá de nuevo más tarde." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof body.password === "string"
      ? body.password
      : "";

  if (!verifyPassword(password)) {
    registerFailedAttempt(client);
    return Response.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  clearFailedAttempts(client);
  const response = Response.json({ authenticated: true });
  response.headers.set("Set-Cookie", sessionCookie(createSessionToken(), SESSION_TTL_SECONDS));
  return response;
}

export function DELETE() {
  const response = Response.json({ authenticated: false });
  response.headers.set("Set-Cookie", sessionCookie("", 0));
  return response;
}
