"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Xatolikni tizimga yozish uchun (faqat development log)
  }, [error])

  return (
    <html lang="uz">
      <body style={{ margin: 0, backgroundColor: "var(--color-white)", fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", maxWidth: "440px", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div
              style={{
                marginBottom: "24px",
                display: "flex",
                height: "64px",
                width: "64px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                backgroundColor: "rgba(255,106,0,0.08)",
                color: "var(--color-inkly-orange)",
              }}
            >
              <AlertTriangle size={30} strokeWidth={1.75} />
            </div>

            <h1 style={{ marginBottom: "12px", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
              Tizim xatoligi yuz berdi
            </h1>
            <p style={{ marginBottom: "32px", fontSize: "16px", lineHeight: 1.6, color: "var(--color-text-muted)" }}>
              Ilova yuklanishida kutilmagan muammo yuzaga keldi. Iltimos, sahifani qayta yuklab ko&apos;ring.
            </p>

            <button
              onClick={() => reset()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "var(--color-inkly-orange)",
                color: "var(--color-white)",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} />
              Qayta urinish
            </button>

            {error?.digest && (
              <p style={{ marginTop: "24px", fontSize: "12px", color: "#9CA3AF" }}>Xatolik kodi: {error.digest}</p>
            )}
          </div>
        </main>
      </body>
    </html>
  )
}
