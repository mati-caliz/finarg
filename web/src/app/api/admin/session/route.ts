import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  hasValidSession,
  verifyPassword,
} from "@/lib/adminSession";
import type { NextRequest } from "next/server";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function GET(request: NextRequest) {
  return Response.json({ authenticated: hasValidSession(request) });
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof body.password === "string"
      ? body.password
      : "";

  if (!verifyPassword(password)) {
    return Response.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const response = Response.json({ authenticated: true });
  response.headers.set(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=${createSessionToken()}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return response;
}

export function DELETE() {
  const response = Response.json({ authenticated: false });
  response.headers.set(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
  );
  return response;
}
