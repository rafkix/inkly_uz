"use client"

import { useState, useCallback } from "react"
import { AlertCircle, ExternalLink } from "lucide-react"
import { authApi } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { TelegramLoginWidget } from "@/components/auth/telegram-login-widget"
import { OutlineButton } from "@/components/auth/auth-visuals"

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  )
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export function AuthMethods({
  onTelegramSuccess,
}: {
  onTelegramSuccess?: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [botLoading, setBotLoading] = useState(false)
  const [botLink, setBotLink] = useState<string | null>(null)
  const [botExpiresAt, setBotExpiresAt] = useState<string | null>(null)
  const [widgetFailed, setWidgetFailed] = useState(false)

  const handleWidgetError = useCallback(() => {
    setWidgetFailed(true)
    setError(null)
  }, [])

  const handleTelegramSuccess = useCallback(() => {
    onTelegramSuccess?.()
  }, [onTelegramSuccess])

  // ─────────────────────────────────────────────
  // GOOGLE
  // ─────────────────────────────────────────────

  async function continueWithGoogle() {
    if (googleLoading) return
    setError(null)
    setGoogleLoading(true)
    try {
      const url = await authApi.getGoogleUrl()
      window.location.assign(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google orqali kirishda xatolik yuz berdi")
      setGoogleLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // TELEGRAM BOT
  // ─────────────────────────────────────────────

  async function continueWithTelegramBot() {
    if (botLoading) return
    setError(null)
    setBotLoading(true)
    setBotLink(null)
    setBotExpiresAt(null)

    try {
      const response = await authApi.telegramBotStart()
      if (!response.deep_link) {
        throw new Error("Telegram bot uchun havola yaratilmadi")
      }
      setBotLink(response.deep_link)
      setBotExpiresAt(response.expires_at)
      window.open(response.deep_link, "_blank", "noopener,noreferrer")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bot orqali kirish havolasini yaratib bo'lmadi")
    } finally {
      setBotLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-2.5">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[14px] border border-inkly-peach bg-inkly-orange-light px-3.5 py-2.5 text-[13px] text-inkly-orange-dark"
        >
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* GOOGLE — OutlineButton: consistent shape with SubmitButton, Google brand colors preserved */}
      <OutlineButton
        onClick={continueWithGoogle}
        disabled={googleLoading}
        loading={googleLoading}
      >
        {!googleLoading && <GoogleIcon />}
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {googleLoading ? "Google'ga ulanmoqda…" : "Google orqali kirish"}
        </span>
      </OutlineButton>

      {/* TELEGRAM */}
      {!widgetFailed ? (
        <TelegramLoginWidget onSuccess={handleTelegramSuccess} onError={handleWidgetError} />
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={continueWithTelegramBot}
            disabled={botLoading}
            loading={botLoading}
            variant="primary"
            size="lg"
            className="w-full rounded-control bg-brand-telegram text-white shadow-[0_2px_10px_rgba(36,161,222,0.30)] hover:bg-brand-telegram hover:brightness-95"
          >
            {!botLoading && <TelegramIcon />}
            {botLoading ? "Havola yaratilmoqda…" : "Telegram bot orqali kirish"}
          </Button>

          {botLink && (
            <div className="flex flex-col items-center gap-1.5 rounded-[14px] border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-center">
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-sky-700 no-underline hover:underline"
              >
                Telegram botni ochish
                <ExternalLink size={13} aria-hidden="true" />
              </a>
              <span className="text-xs leading-relaxed text-text-muted">
                Botda tasdiqlang, keyin &quot;Saytga qaytish&quot; havolasini bosing.
              </span>
              {botExpiresAt && (
                <span className="text-[11px] text-text-muted">
                  Muddati: {new Date(botExpiresAt).toLocaleString("uz-UZ")}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// DIVIDER
// ─────────────────────────────────────────────

export function AuthDivider() {
  return (
    <div className="my-1 flex items-center gap-3" aria-hidden="true">
      <div className="h-px flex-1 bg-border-default" />
      <span className="text-xs font-medium text-text-muted">yoki</span>
      <div className="h-px flex-1 bg-border-default" />
    </div>
  )
}