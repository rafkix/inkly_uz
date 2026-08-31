"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Xatoni log qilish (Sentry yoki boshqa monitoring)
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="w-full max-w-[400px] text-center">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-inkly-orange-light text-primary">
          <AlertTriangle size={26} />
        </div>

        {/* Title */}
        <h1 className="mt-5 text-[22px] font-bold tracking-[-0.03em] text-text-primary">
          Xatolik yuz berdi
        </h1>

        {/* Message */}
        <p className="mt-2 text-[13px] leading-[1.6] text-text-muted">
          Sahifani yuklashda muammo chiqdi.
          <br />
          Qayta urinib ko'ring.
        </p>

        {/* Digest (dev mode only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <pre className="mt-4 overflow-auto rounded-md bg-bg-muted px-4 py-3 text-left text-[10px] text-[#525960]">
            {error.message}
          </pre>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-inkly-hover active:scale-[0.98]"
          >
            <RefreshCw size={14} />
            Qayta urinish
          </button>

          <a
            href="/"
            className="flex items-center rounded-lg border border-border-default px-5 py-2.5 text-[12px] font-semibold text-text-primary transition hover:bg-bg-muted"
          >
            Bosh sahifa
          </a>
        </div>
      </div>
    </main>
  )
}