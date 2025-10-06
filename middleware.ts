// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "simple_session";
const COOKIE_VALUE = "simple-ok";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Don't guard login and static assets while debugging
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Protect only /dashboard and /api/products
  const protectedRoots = ["/dashboard", "/api/products"];
  const isProtected = protectedRoots.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  const cookieVal = req.cookies.get(COOKIE_NAME)?.value;

  // 🔎 Debug header so you can see it in the Network tab → Response headers
  const debugHeaders = new Headers();
  debugHeaders.set("x-pathname", pathname);
  debugHeaders.set("x-cookie-name", COOKIE_NAME);
  debugHeaders.set("x-cookie-value", cookieVal ?? "(none)");

  if (cookieVal === COOKIE_VALUE) {
    return NextResponse.next({ headers: debugHeaders });
  }

  const url = new URL("/login", req.url);
  url.searchParams.set("next", pathname);
  const res = NextResponse.redirect(url);
  // also attach debug headers on the redirect
  debugHeaders.forEach((v, k) => res.headers.set(k, v));
  return res;
}

export const config = {
  // Catch ALL dashboard routes + the API (kept)
  matcher: ["/dashboard/:path*", "/api/products/:path*"],
};
