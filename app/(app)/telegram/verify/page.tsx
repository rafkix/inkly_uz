"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2, ArrowRight, Copy, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/context"
import { telegramApi } from "@/lib/api/telegram"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { LoadingDots } from "@/components/ui/loading-dots"

type VerificationStep = "idle" | "started" | "pending" | "verified" | "failed"

interface VerificationData {
  verification_id: string
  token: string
  expires_at: string
}

interface VerificationStatus {
  status: "pending" | "verified" | "expired" | "failed"
}

export default function TelegramVerifyPage() {
  const { state } = useAuth()
  const { token, loading: authLoading } = state
  const router = useRouter()

  const [step, setStep] = useState<VerificationStep>("idle")
  const [verification, setVerification] = useState<VerificationData | null>(null)
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [startLoading, setStartLoading] = useState(false)
  const [completeLoading, setCompleteLoading] = useState(false)
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  // Status polling
  useEffect(() => {
    if (step !== "started" || !token || !verification) return

    const checkStatus = async () => {
      try {
        const res = await telegramApi.verificationStatus(token, verification.verification_id)
        setStatus(res as VerificationStatus)

        if (res.status === "verified") {
          if (pollInterval) clearInterval(pollInterval)
          setStep("verified")
          toast.success("Kanal tasdiqlandi!")
        } else if (res.status === "expired" || res.status === "failed") {
          if (pollInterval) clearInterval(pollInterval)
          setStep("failed")
        } else {
          setStep("pending")
        }
      } catch (err) {
        console.error("Status check failed:", err)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    setPollInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [step, token, verification, pollInterval])

  const handleStart = async () => {
    if (!token) return
    setStartLoading(true)
    try {
      const data = await telegramApi.startVerification(token)
      setVerification(data)
      setStep("started")
      setStatus({ status: "pending" })
      toast.success("Tasdiqlash boshlandi. Telegram botga o'ting.")
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string }
      if (error.code === "ALREADY_VERIFIED") {
        toast.error("Siz allaqachon tasdiqlangansiz")
        setStep("verified")
      } else {
        toast.error(error.message ?? "Tasdiqlashni boshlashda xatolik")
      }
    } finally {
      setStartLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!token || !verification) return
    setCompleteLoading(true)
    try {
      await telegramApi.completeVerification(token, {
        verification_id: verification.verification_id,
        token: verification.token,
      })
      setStep("verified")
      toast.success("Tasdiqlash muvaffaqiyatli yakunlandi!")
      setTimeout(() => router.push("/telegram/account"), 1500)
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string }
      toast.error(error.message ?? "Tasdiqlashda xatolik")
    } finally {
      setCompleteLoading(false)
    }
  }

  const copyToken = () => {
    if (verification) {
      navigator.clipboard.writeText(verification.token)
      toast.success("Token nusxalandi")
    }
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
        <h1 className="text-2xl font-bold text-text-primary">Kanalni tasdiqlash</h1>
        <p className="text-sm text-text-muted mt-1">
          Telegram bot orqali kanalga egalikni tasdiqlang va avtomatik yuborish imkoniyatini oling.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {["Boshlash", "Kuting", "Tasdiqlash"].map((label, idx) => {
          const isDone = (step === "verified") || (step === "pending" && idx < 1) || (step === "started" && idx === 0)
          const isActive = (step === "started" && idx === 0) || (step === "pending" && idx === 1) || (step === "verified" && idx === 2)
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                isDone ? "bg-green-500 text-white" : isActive ? "bg-primary text-white" : "bg-border-default text-text-muted"
              )}>
                {isDone ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              {idx < 2 && (
                <ArrowRight size={14} className={isDone ? "text-green-500" : "text-border-default"} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-border-default bg-white p-6">
        {step === "idle" && (
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-inkly-orange-light flex items-center justify-center mb-4">
              <ShieldCheck size={28} className="text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Tasdiqlashni boshlang</h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              Bot sizga tasdiqlash kodini yuboradi. Kodni olgach, uni bu yerga kiriting.
            </p>
            <Button
              onClick={handleStart}
              disabled={startLoading}
              className="rounded-full bg-primary px-6 py-2 font-semibold text-white hover:bg-inkly-hover"
            >
              {startLoading ? (
                <>
                  <LoadingDots size="md" className="mr-2" />
                  Boshlanmoqda...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} className="mr-2" />
                  Tasdiqlashni boshlash
                </>
              )}
            </Button>
          </div>
        )}

        {step === "started" && (
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <RefreshCw size={28} className="text-blue-500 animate-spin" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Tasdiqlash kutilmoqda...</h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              Telegram botga o'ting va tasdiqlash kodini yuboring. Status avtomatik tekshiriladi.
            </p>
            {verification && (
              <div className="bg-bg-muted rounded-xl p-4 max-w-sm mx-auto mb-4">
                <p className="text-xs text-text-muted mb-1">Tasdiqlash tokeni:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-white px-2 py-1 rounded flex-1 truncate">{verification.token}</code>
                  <Button variant="ghost" size="sm" onClick={copyToken} className="p-1.5 text-text-muted hover:text-text-primary">
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-text-muted">
              Botga o'tish: @inkly_uz_bot
            </p>
          </div>
        )}

        {step === "pending" && (
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <ShieldAlert size={28} className="text-amber-500" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Tasdiqlash kutilmoqda</h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              Bot sizga tasdiqlash kodini yuborgan bo'lishi kerak. Kodni olgach, quyidagi tugmani bosing.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleComplete}
                disabled={completeLoading}
                className="rounded-full bg-primary px-6 py-2 font-semibold text-white hover:bg-inkly-hover"
              >
                {completeLoading ? (
                  <>
                    <LoadingDots size="md" className="mr-2" />
                    Yakunlanmoqda...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="mr-2" />
                    Tasdiqlashni yakunlash
                  </>
                )}
              </Button>
            </div>
            {status?.status === "expired" && (
              <p className="text-sm text-amber-600 mt-4 flex items-center justify-center gap-1.5">
                <AlertCircle size={14} />
                Tasdiqlash muddati tugadi. Qaytadan boshlang.
              </p>
            )}
          </div>
        )}

        {step === "verified" && (
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Tasdiqlandi!</h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              Kanal muvaffaqiyatli tasdiqlandi. Endi maqolalarni avtomatik yuborishingiz mumkin.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => router.push("/telegram/account")}
                className="rounded-full bg-primary px-6 py-2 font-semibold text-white hover:bg-inkly-hover"
              >
                Akkauntga o'tish
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/telegram/channels")}
                className="rounded-full text-text-secondary hover:bg-bg-muted"
              >
                Kanallar
              </Button>
            </div>
          </div>
        )}

        {step === "failed" && (
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <ShieldAlert size={28} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Tasdiqlash amalga oshmadi</h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              Xatolik yuz berdi yoki muddat tugadi. Qaytadan urinib ko'ring.
            </p>
            <Button
              onClick={() => { setStep("idle"); setVerification(null); setStatus(null); }}
              className="rounded-full bg-primary px-6 py-2 font-semibold text-white hover:bg-inkly-hover"
            >
              <RefreshCw size={16} className="mr-2" />
              Qaytadan boshlash
            </Button>
          </div>
        )}
      </div>

      {/* Help */}
      {step === "idle" && (
        <div className="rounded-2xl bg-inkly-orange-light border border-inkly-peach p-6">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Qanday tasdiqlash kerak?
          </h3>
          <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
            <li>"Tasdiqlashni boshlash" tugmasini bosing</li>
            <li>Telegram botga (@inkly_uz_bot) o'ting va tasdiqlash so'rovini kuting</li>
            <li>Bot yuborgan kodni bu sahifaga kiriting yoki "Yakunlash" tugmasini bosing</li>
            <li>Tasdiqlash muvaffaqiyatli bo'lsa, kanalga maqola yuborish imkoniyati ochiladi</li>
          </ol>
        </div>
      )}
    </div>
  )
}