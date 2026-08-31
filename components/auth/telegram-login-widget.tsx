"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { LoadingDots } from "@/components/ui/loading-dots"

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface TelegramLoginWidgetProps {
  onSuccess: () => void
  onError?: () => void
}

export function TelegramLoginWidget({
  onSuccess,
  onError,
}: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const handledRef = useRef(false)
  const mountedRef = useRef(false)

  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  const { login } = useAuth()

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    mountedRef.current = true
    handledRef.current = false

    const callbackName = `onTelegramAuth_${Math.random()
      .toString(36)
      .slice(2)}`

    const telegramWindow = window as unknown as Record<
      string,
      (user: TelegramAuthData) => void
    >

    const cleanup = () => {
      window.clearTimeout(timeoutId)

      delete telegramWindow[callbackName]

      if (containerRef.current) {
        containerRef.current.replaceChildren()
      }
    }

    const fireError = () => {
      if (!mountedRef.current) return
      if (handledRef.current) return

      cleanup()

      onErrorRef.current?.()
    }

    const handleAuth = async (
      userData: TelegramAuthData,
    ) => {
      if (!mountedRef.current) return
      if (handledRef.current) return

      handledRef.current = true

      window.clearTimeout(timeoutId)

      setError(null)
      setLoading(true)

      try {
        const { tokens } =
          await authApi.telegramLogin({
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name ?? null,
            username: userData.username ?? null,
            photo_url: userData.photo_url ?? null,
            auth_date: userData.auth_date,
            hash: userData.hash,
          })

        if (!mountedRef.current) return

        await login(tokens)

        if (!mountedRef.current) return

        onSuccessRef.current()
      } catch (err) {
        if (!mountedRef.current) return

        handledRef.current = false

        setError(
          err instanceof Error
            ? err.message
            : "Telegram orqali kirishda xatolik yuz berdi",
        )
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    telegramWindow[callbackName] = handleAuth

    const script = document.createElement("script")

    script.src =
      "https://telegram.org/js/telegram-widget.js?22"

    script.async = true

    /*
     * MUHIM:
     *
     * BotFather'dagi username aynan shu bo'lishi kerak.
     *
     * @ belgisi yozilmaydi.
     *
     * Masalan:
     * @inkly_uz_bot
     *
     * => inkly_uz_bot
     */
    script.setAttribute(
      "data-telegram-login",
      "inkly_uz_bot",
    )

    script.setAttribute(
      "data-size",
      "large",
    )

    script.setAttribute(
      "data-radius",
      "10",
    )

    script.setAttribute(
      "data-onauth",
      `${callbackName}(user)`,
    )

    script.setAttribute(
      "data-request-access",
      "write",
    )

    /*
     * Telegram widget script yuklanmasa
     * fallbackga o'tamiz.
     */
    script.onerror = () => {
      fireError()
    }

    /*
     * Container'ni tozalab,
     * yangi Telegram widget qo'yamiz.
     */
    if (containerRef.current) {
      containerRef.current.replaceChildren()
      containerRef.current.appendChild(script)
    }

    /*
     * MUHIM:
     *
     * Telegram widget iframe cross-origin.
     *
     * Shuning uchun:
     *
     * iframe.textContent
     * container.textContent
     *
     * orqali "Username invalid"ni
     * o'qib bo'lmaydi.
     *
     * Callback kelmasa fallback ishlaydi.
     */
    const timeoutId = window.setTimeout(() => {
      if (!mountedRef.current) return
      if (handledRef.current) return

      fireError()
    }, 3500)

    return () => {
      mountedRef.current = false

      window.clearTimeout(timeoutId)

      delete telegramWindow[callbackName]

      if (containerRef.current) {
        containerRef.current.replaceChildren()
      }
    }
  }, [login])

  return (
    <div className="flex w-full flex-col items-center gap-2.5">
      <div ref={containerRef} aria-busy={loading} className="flex min-h-12 w-full items-center justify-center" />

      {loading && (
        <div className="flex items-center justify-center gap-2">
          <LoadingDots size="sm" className="text-brand-telegram" />
          <span className="text-[13px] text-text-muted">Tekshirilmoqda…</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="box-border flex w-full items-start gap-1.5 rounded-control border border-inkly-peach bg-inkly-orange-light px-3 py-2 text-xs text-inkly-orange-dark"
        >
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}
    </div>
  )
}