import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "labrecha_admin_session";

const SESSION_PAYLOAD = "labrecha-admin-session-v1";

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function computeSessionToken(password: string): string {
  return createHmac("sha256", password).update(SESSION_PAYLOAD).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyPassword(candidate: string): boolean {
  const password = getAdminPassword();
  return password.length > 0 && safeEqual(candidate, password);
}

export function createSessionToken(): string {
  return computeSessionToken(getAdminPassword());
}

export function hasValidSession(request: NextRequest): boolean {
  const password = getAdminPassword();
  if (password.length === 0) {
    return false;
  }
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  return cookieValue.length > 0 && safeEqual(cookieValue, computeSessionToken(password));
}
