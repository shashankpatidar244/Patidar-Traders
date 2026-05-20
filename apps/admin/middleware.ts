import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAccessToken } from "@repo/auth/src/jwt"
import { hasPermission } from "@repo/auth/src/checkPermission"
import { PERMISSIONS, type Permission } from "@repo/auth/src/permissions"

export const runtime = "nodejs"

// 🔥 Route → Permission mapping
const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/dashboard": PERMISSIONS.VIEW_DASHBOARD,
  "/dashboard/products": PERMISSIONS.MANAGE_PRODUCTS,
  "/dashboard/orders": PERMISSIONS.MANAGE_ORDERS,
  "/dashboard/user": PERMISSIONS.MANAGE_USERS,
  "/dashboard/analytics": PERMISSIONS.VIEW_ANALYTICS,
  "/dashboard/category": PERMISSIONS.MANAGE_CATEGORY,
}


export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get("accessToken")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const decoded = verifyAccessToken(token)

    const role = decoded.role

    // 🔥 Find required permission
    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find((route) =>
    pathname.startsWith(route)
  )
  
  if (matchedRoute) {
    const requiredPermission =
      ROUTE_PERMISSIONS[matchedRoute as keyof typeof ROUTE_PERMISSIONS]
  
    if (requiredPermission) {
      const allowed = hasPermission(role, requiredPermission)
  
      if (!allowed) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }
  }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
}