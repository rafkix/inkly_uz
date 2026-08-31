import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * COMING_SOON = true bo'lsa, barcha /posts, /creators va boshqa
 * ichki sahifalarga kirish bloklansa, / sahifasiga yo'naltiriladi.
 * false qilsangiz — hamma sahifalar odatdagidek ochiladi.
 */
const COMING_SOON = false

// Ruxsat etilgan yo'llar (COMING_SOON = true bo'lsa ham ochiq)
const ALLOWED_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/privacy",
  "/terms",
]

export function proxy(request: NextRequest) {
  if (!COMING_SOON) return NextResponse.next()

  const { pathname } = request.nextUrl

  // API, _next, static fayllar — to'smaslik
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // fayllar (.png, .ico, ...)
  ) {
    return NextResponse.next()
  }

  // Ruxsat etilgan yo'llarga o'tkazish
  const isAllowed = ALLOWED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  if (isAllowed) return NextResponse.next()

  // Boshqa barcha sahifalar → asosiy sahifaga redirect
  return NextResponse.redirect(new URL("/?coming_soon=1", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
