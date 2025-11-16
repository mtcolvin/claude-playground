import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/verify",
  "/api/auth",
]

// Define routes that require specific roles
const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/provider": ["ADMIN", "PROVIDER"],
}

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect to signin if not authenticated
  if (!isLoggedIn) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (nextUrl.pathname.startsWith(route)) {
      const userRole = req.auth?.user?.role
      if (userRole && !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
