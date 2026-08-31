"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Unlink2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/context"
import { telegramApi } from "@/lib/api/telegram"
import type { TelegramAccountResponse } from "@/lib/api/telegram"
import { toast } from "sonner"
import { LoadingDots } from "@/components/ui/loading-dots"

export default function TelegramAccountPage() {
  const { state } = useAuth()
  const { user, token, loading: authLoading } = state
  const router = useRouter()

  const [account, setAccount] = useState<TelegramAccountResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlinking, setUnlinking] = useState(false)

  // Akkaunt ma'lumotlarini yuklash
  useEffect(() => {
    if (!token) return
    setLoading(true)
    telegramApi.getAccount(token)
      .then(setAccount)
      .catch((err: unknown) => {
        // Bog'lanmagan akkaunt normal holat — xato sifatida ko'rsatilmaydi
        const code = typeof err === "object" && err && "code" in err ? String(err.code) : ""
        if (code === "TELEGRAM_NOT_CONNECTED" || code === "NOT_FOUND") {
          setAccount(null)
          return
        }
        console.error("Failed to load telegram account:", err)
        toast.error("Telegram akkaunt ma'lumotlari yuklanmadi")
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleUnlink = async () => {
    if (!token) return
    const ok = window.confirm("Telegram akkauntini uzishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.")
    if (!ok) return

    setUnlinking(true)
    try {
      await telegramApi.unlinkAccount(token)
      toast.success("Telegram akkaunti uzildi")
      setAccount(null)
    } catch (err) {
      console.error("Unlink failed:", err)
      toast.error("Akkauntni uzishda xatolik yuz berdi")
    } finally {
      setUnlinking(false)
    }
  }

  const handleStartVerification = () => {
    router.push("/telegram/verify")
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingDots size="lg" className="text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Telegram akkaunti</h1>
        <p className="text-sm text-text-muted mt-1">
          Telegram akkauntingizni bog'lang, kanallarni boshqaring va maqolalarni avtomatik yuboring.
        </p>
      </div>

      {/* Status Card */}
      <div className="rounded-2xl border bg-white p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingDots size="lg" className="text-primary" />
          </div>
        ) : account ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 rounded-xl bg-inkly-orange-light flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                  <path d="M11.944 2A8 8 0 0 0 4 10.2C4 13.85 6.15 17.01 9.6 18.89 10.15 19.1 10.45 19.35 10.5 19.7a.75.75 0 0 1-1.19.89c-.48-.48-.9-1.11-1.13-1.87A6.5 6.5 0 0 1 4 10.2a6.5 6.5 0 0 1 7.15-6.25c.36-.15.72-.2 1.08-.2.36 0 .72.05 1.08.2A6.5 6.5 0 0 1 20 10.2c0 2.17-.96 4.13-2.51 5.45-.09.2-.13.45-.13.7 0 .42.26.8.66.94a.75.75 0 0 1-.16 1.29c-.18.07-.37.11-.57.11-.42 0-.81-.15-1.11-.4C16.63 20.63 14.53 22 11.94 22A8 8 0 0 1 4 14a8 8 0 0 1 13.54-7.31.75.75 0 0 1 .55 1.31 6.5 6.5 0 0 0-9.09 5.72.75.75 0 0 0 1.42.43 5 5 0 0 1 7.23-4.54c.83 0 1.6.32 2.19.89a.75.75 0 0 1-.5 1.32 6.27 6.27 0 0 1-1.07-.06c-.38.5-.89.89-1.47 1.13a.75.75 0 0 1-1.2-.6c-.1-.25-.16-.52-.16-.8 0-1.5.72-2.86 1.89-3.71A.75.75 0 0 1 12.75 4a.75.75 0 0 1 .67.4c.34.42.58.91.7 1.46.09.36.09.72.09 1.08 0 .42-.12.83-.33 1.2a.75.75 0 0 1-.98.72c-.48-.36-1.02-.57-1.6-.57-.46 0-.91.13-1.3.38a.75.75 0 0 1-.7-.22 8.17 8.17 0 0 0-1.15-2.82.75.75 0 0 1 .43-1.25c.3-.1.61-.17.93-.21a10.47 10.47 0 0 0 1.91-4.5.75.75 0 0 1 1.23-.66 10.22 10.22 0 0 1 4.65 1.1c.38.22.7.55.9.95a.75.75 0 0 1-.16 1.28c-.38.06-.77.09-1.15.09-.32 0-.64-.05-.96-.15a.75.75 0 0 1-.4-1.16 13.06 13.06 0 0 0 1.63-5.12c0-.7.12-1.39.35-2.05a.75.75 0 0 1 1.24-.68 8.38 8.38 0 0 1 3.4.42c.38.15.7.4.9.73a.75.75 0 0 1 .03 1.17c-.36.6-.86 1.07-1.46 1.38a.75.75 0 0 1-.7.05 7.4 7.4 0 0 1-2.2-.64.75.75 0 0 1-.68-.73c-.03-.53.2-1.04.6-1.43a.75.75 0 0 1 1.07-.21 6.6 6.6 0 0 1 2.7.95c.4.23.74.55.98.93a.75.75 0 0 1-.3 1.17c-.5.08-1 .12-1.5.12-.36 0-.72-.05-1.07-.14a.75.75 0 0 1-.3-1.14 11.5 11.5 0 0 0 2.15-5.36.75.75 0 0 1 1.45-.28ZM13.25 15.5a4.25 4.25 0 1 1-8.5 0 4.25 4.25 0 0 1 8.5 0Z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">{account.first_name} {account.last_name ?? ""}</p>
                <p className="text-sm text-text-muted">@{account.telegram_username ?? "username yo'q"}</p>
                <p className="text-xs text-text-muted mt-1">ID: {account.telegram_user_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <CheckCircle2 size={12} />
                Bog'langan
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-inkly-orange-light flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary">Telegram akkaunti bog'lanmagan</h3>
            <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto">
              Telegram akkauntingizni bog'lang va kanallar orqali maqolalarni avtomatik yuboring.
            </p>
            <Button
              onClick={handleStartVerification}
              className="mt-4 rounded-full bg-primary px-6 py-2 font-semibold text-white hover:bg-inkly-hover"
            >
              <ShieldCheck size={16} className="mr-2" />
              Kanallarni sozlash
            </Button>
          </div>
        )}
      </div>

      {account && (
        <>
          {/* Actions */}
          <div className="rounded-2xl border border-border-default bg-white p-6">
            <h3 className="font-semibold text-text-primary mb-4">Amallar</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleStartVerification}
                className="flex-1 gap-2 rounded-full border-border-default text-text-secondary hover:border-primary hover:text-primary"
              >
                <ShieldCheck size={16} />
                Kanallarni boshqarish
              </Button>
              <Button
                variant="ghost"
                onClick={handleUnlink}
                disabled={unlinking}
                className="flex-1 gap-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Unlink2 size={16} />
                {unlinking ? (
                  <>
                    <LoadingDots size="md" />
                    Uzilmoqda...
                  </>
                ) : (
                  "Akkauntni uzish"
                )}
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-2xl border border-border-default bg-white p-6">
            <h3 className="font-semibold text-text-primary mb-4">Ma'lumot</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Bog'langan sana</dt>
                <dd className="font-medium text-text-primary">{new Date(account.created_at).toLocaleDateString("uz-UZ")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Telegram ID</dt>
                <dd className="font-medium text-text-primary font-mono">{account.telegram_user_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Username</dt>
                <dd className="font-medium text-text-primary">@{account.telegram_username ?? "—"}</dd>
              </div>
            </dl>
          </div>

          {/* What you can do */}
          <div className="rounded-2xl bg-inkly-orange-light border border-inkly-peach p-6">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              Nimalar amalga oshirishingiz mumkin?
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Maqolalarni Telegram kanallariga avtomatik yuborish</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Bir nechta kanal qo'shish va ularni boshqarish</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Kanal tasdiqlash uchun tekshiruv o'tkazish</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Yuborilgan maqolalar tarixi va holatini kuzatish</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}