// components/layout/conditional-footer.tsx
"use client"

import { usePathname } from "next/navigation"

import { Footer } from "@/components/layout/footer"

// Aniq (static) route'lar — bu yerlarda footer ko'rinmaydi
const HIDDEN_ON: string[] = [
  "/login",
  "/register",
  "/write",
  "/dashboard",
]

// Dinamik route'lar uchun pattern tekshiruvi
function isHiddenDynamicRoute(pathname: string): boolean {
  // /@username — profil sahifasi (app/@[username]/page.tsx ga mos)
  if (/^\/@[^/]+\/?$/.test(pathname)) return true

  return false
}

export function ConditionalFooter() {
  const pathname = usePathname()

  const shouldHide =
    HIDDEN_ON.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    isHiddenDynamicRoute(pathname)

  if (shouldHide) return null

  return <Footer />
}