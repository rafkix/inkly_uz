"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { SubmitButton, OutlineButton } from "@/components/auth/auth-visuals"

// ─────────────────────────────────────────────────────────────────────────────
// Error message map
// ─────────────────────────────────────────────────────────────────────────────

const authErrorMessages: Record<string, string> = {
  OAUTH_STATE_MISMATCH: "Google orqali kirishda sessiya muammosi yuz berdi. Qaytadan urinib ko'ring.",
  OAUTH_STATE_EXPIRED: "Google login sessiyasi muddati tugagan. Qaytadan urinib ko'ring.",
  GOOGLE_AUTH_FAILED: "Google orqali kirish amalga oshmadi. Qaytadan urinib ko'ring.",
  OAUTH_PROVIDER_ERROR: "Google orqali kirish amalga oshmadi. Qaytadan urinib ko'ring.",
  GOOGLE_AUTH_CANCELLED: "Google orqali kirish bekor qilindi.",
}

// ─────────────────────────────────────────────────────────────────────────────
// Google Icon
// ─────────────────────────────────────────────────────────────────────────────

function GoogleColorIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Callback content
// ─────────────────────────────────────────────────────────────────────────────

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, refresh } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const errorParam = searchParams.get("error")
    const status = searchParams.get("status")

    if (errorParam) {
      setError(authErrorMessages[errorParam] ?? "Google orqali kirishda xatolik yuz berdi.")
      return
    }

    if (status === "success" && !code && !state) {
      refresh()
        .then(() => router.replace("/dashboard"))
        .catch(() => setError("Sessiyani tiklab bo'lmadi. Qaytadan urinib ko'ring."))
      return
    }

    if (!code || !state) {
      setError("Google callback ma'lumotlari topilmadi. Qaytadan urinib ko'ring.")
      return
    }

    authApi
      .googleCallback(code, state)
      .then(async ({ tokens }) => {
        await login(tokens)
        router.replace("/dashboard")
      })
      .catch((err: unknown) => {
        const errCode = typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : ""
        setError(authErrorMessages[errCode] ?? (err instanceof Error ? err.message : "Xatolik yuz berdi"))
      })
  }, [searchParams, router, login, refresh])

  async function retryGoogle() {
    if (retrying) return
    setRetrying(true)
    setError(null)
    try {
      const url = await authApi.getGoogleUrl()
      window.location.assign(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google orqali kirishda xatolik yuz berdi")
      setRetrying(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 360,
    background: "#FFFFFF",
    borderRadius: 24,
    padding: "36px 28px",
    boxShadow: `
      0 0 0 1px rgba(0,0,0,0.06),
      0 2px 4px rgba(0,0,0,0.04),
      0 8px 20px rgba(0,0,0,0.06),
      0 24px 48px rgba(0,0,0,0.08)
    `,
    textAlign: "center",
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-muted)",
        padding: "16px",
      }}
    >
      <div style={cardStyle}>
        {error ? (
          /* ── Error state ── */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            {/* Error icon */}
            <div
              style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(239,68,68,0.08)",
                border: "1.5px solid rgba(239,68,68,0.20)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                Kirish amalga oshmadi
              </p>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{error}</p>
            </div>

            {/* Action buttons — using shared button components */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              <div onClick={retryGoogle} style={{ cursor: retrying ? "not-allowed" : "pointer" }}>
                <SubmitButton
                  label={retrying ? "Ulanmoqda…" : "Qayta urinish"}
                  loading={retrying}
                />
              </div>

              <OutlineButton onClick={() => router.replace("/login")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Login sahifasi
              </OutlineButton>
            </div>
          </div>
        ) : (
          /* ── Loading state ── */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            {/* Animated Google icon in spinning ring */}
            <div style={{ position: "relative", width: 64, height: 64 }}>
              <svg
                aria-hidden
                style={{ position: "absolute", inset: 0, animation: "spin 0.8s linear infinite" }}
                width="64" height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,106,0,0.20)"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="#FF6A00" strokeLinecap="round" />
              </svg>
              <div
                style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <GoogleColorIcon size={26} />
              </div>
            </div>

            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                Google orqali kiritilmoqda
              </p>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Iltimos, biroz kuting…
              </p>
            </div>

            {/* Animated dots */}
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#FF6A00",
                    animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>

            <style>{`
              @keyframes dotPulse {
                0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
                40% { opacity: 1; transform: scale(1); }
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-muted)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#FF6A00", opacity: 0.4,
                  animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  )
}
