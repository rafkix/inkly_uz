"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { LoadingDots } from "@/components/ui/loading-dots"
import { LogoMark } from "@/components/ui/logo"

const telegramBotErrorMessages: Record<string, string> = {
  TOKEN_EXPIRED: "Tasdiqlash havolasining muddati tugagan. Botga qaytib, qaytadan urinib ko'ring.",
  TOKEN_INVALID: "Tasdiqlash havolasi yaroqsiz. Botga qaytib, qaytadan urinib ko'ring.",
  VERIFICATION_NOT_FOUND: "Tasdiqlash so'rovi topilmadi. Botga qaytib, qaytadan urinib ko'ring.",
  VERIFICATION_EXPIRED: "Tasdiqlash muddati tugagan. Botga qaytib, qaytadan urinib ko'ring.",
  ALREADY_USED: "Bu havoladan allaqachon foydalanilgan. Qaytadan kirish uchun botni oching.",
}

type Status = "loading" | "success" | "error"

function TelegramBotCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, refresh } = useAuth()

  const [status, setStatus] = useState<Status>("loading")
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  const token = searchParams.get("token")

  const complete = useCallback(
    async (t: string) => {
      setStatus("loading")
      setError(null)
      try {
        const { tokens } = await authApi.telegramBotCallback(t)
        await login(tokens)
        setStatus("success")
        setTimeout(() => router.replace("/dashboard"), 900)
      } catch (err: unknown) {
        const code = typeof err === "object" && err && "code" in err ? String((err as { code?: string }).code) : ""
        setError(
          telegramBotErrorMessages[code] ??
            (err instanceof Error ? err.message : "Telegram orqali kirishda xatolik yuz berdi."),
        )
        setStatus("error")
      }
    },
    [login, router],
  )

  useEffect(() => {
    if (!token) {
      setError("Havolada tasdiqlash tokeni topilmadi. Botga qaytib, havolani qayta bosing.")
      setStatus("error")
      return
    }
    complete(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function retry() {
    if (retrying) return
    setRetrying(true)
    try {
      if (token) {
        await complete(token)
      } else {
        await refresh()
        router.replace("/dashboard")
      }
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5">
            <LogoMark size={26} />
            <span className="text-xl font-bold tracking-tighter text-text-primary">inkly</span>
          </Link>

          <div className="rounded-panel border border-border-default bg-white p-8 shadow-card">
            {status === "loading" && (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#29B6F6" aria-hidden="true">
                    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                  </svg>
                </div>
                <h1 className="text-lg font-semibold text-text-primary">Telegram orqali kirilmoqda…</h1>
                <p className="mt-2 text-sm text-text-muted">Iltimos, kutib turing, hisobingiz tasdiqlanmoqda.</p>
                <div className="mt-6 flex justify-center">
                  <LoadingDots size="lg" className="text-primary" />
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 size={28} className="text-green-500" />
                </div>
                <h1 className="text-lg font-semibold text-text-primary">Tasdiqlandi!</h1>
                <p className="mt-2 text-sm text-text-muted">Sizni boshqaruv paneliga yo'naltiryapmiz…</p>
                <div className="mt-6 flex justify-center">
                  <LoadingDots size="md" className="text-primary" />
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                  <XCircle size={28} className="text-red-500" />
                </div>
                <h1 className="text-lg font-semibold text-text-primary">Kirish amalga oshmadi</h1>
                <p className="mt-2 text-sm text-text-muted">{error}</p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button onClick={retry} disabled={retrying} loading={retrying} variant="primary" size="md">
                    {!retrying && <RefreshCw size={16} />}
                    Qayta urinish
                  </Button>
                  <Button onClick={() => router.replace("/login")} variant="outline" size="md">
                    Login sahifasi
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function TelegramBotCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <LoadingDots size="lg" className="text-primary" />
        </div>
      }
    >
      <TelegramBotCallbackContent />
    </Suspense>
  )
}
