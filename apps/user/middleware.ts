import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/signin",
  "/signup",
  "/verify-otp",
  "/set-credentials",
  "/forgot-password",
  "/reset-password",  
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow API routes and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) return NextResponse.next();

  // ✅ Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  // 🔐 Protect all other pages
  const token = req.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // ⚠ No token verification here (Edge limitation)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};