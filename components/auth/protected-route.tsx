"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { LoadingDots } from "@/components/ui/loading-dots"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!state.loading && !state.user) {
      const next = encodeURIComponent(pathname || "/dashboard")
      router.replace(`/login?next=${next}`)
    }
  }, [pathname, router, state.loading, state.user])

  if (state.loading || !state.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-live="polite">
        <LoadingDots size="lg" className="text-primary" />
      </div>
    )
  }

  return children
}
