import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "labrecha_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const SESSION_PAYLOAD = "labrecha-admin-session-v2";
const TOKEN_SEPARATOR = ".";
const MS_PER_SECOND = 1000;
const EXPIRY_PATTERN = /^\d+$/;

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function sign(password: string, expiresAt: number): string {
  return createHmac("sha256", password)
    .update(`${SESSION_PAYLOAD}${TOKEN_SEPARATOR}${expiresAt}`)
    .digest("hex");
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

export function createSessionToken(nowMs: number = Date.now()): string {
  const expiresAt = Math.floor(nowMs / MS_PER_SECOND) + SESSION_TTL_SECONDS;
  return `${expiresAt}${TOKEN_SEPARATOR}${sign(getAdminPassword(), expiresAt)}`;
}

export function isValidSessionToken(token: string, nowMs: number = Date.now()): boolean {
  const password = getAdminPassword();
  if (password.length === 0) {
    return false;
  }
  const [expiresAtToken = "", signature = "", ...rest] = token.split(TOKEN_SEPARATOR);
  if (rest.length > 0 || signature.length === 0 || !EXPIRY_PATTERN.test(expiresAtToken)) {
    return false;
  }
  const expiresAt = Number(expiresAtToken);
  if (expiresAt * MS_PER_SECOND <= nowMs) {
    return false;
  }
  return safeEqual(signature, sign(password, expiresAt));
}

export function hasValidSession(request: NextRequest, nowMs: number = Date.now()): boolean {
  return isValidSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? "", nowMs);
}
