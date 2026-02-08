import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES: string[] = [];

const PUBLIC_ONLY_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  if (PROTECTED_ROUTES.length === 0) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => path.startsWith(route));
  const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.includes(path);
  const token = request.cookies.get("accessToken")?.value || "";

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicOnlyRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)"],
};
