"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import {
  AuthPageLayout,
  AuthBrandPanel,
  AuthCardShell,
  AuthCardHeader,
  AuthErrorBanner,
  OtpInput,
} from "@/components/auth/auth-shared"
import { useOtp, useCountdown } from "@/components/auth/auth-hooks"
import { SubmitButton, GhostButton, MailIcon } from "@/components/auth/auth-visuals"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const email = searchParams.get("email") ?? ""

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const otp = useOtp()
  const countdown = useCountdown(60)

  useEffect(() => {
    if (!email) {
      router.replace("/register")
    }
  }, [email, router])

  // Auto-submit when OTP complete
  useEffect(() => {
    if (otp.isComplete && !error && !loading) {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp.value])

  const handleVerify = async () => {
    if (!otp.isComplete) {
      setError("6 xonali kodni to'liq kiriting")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { tokens } = await authApi.confirmRegistration({ email, code: otp.value })
      await login(tokens)
      setSuccess(true)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kod noto'g'ri yoki muddati tugagan")
      otp.reset()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown.active || !email) return
    setError(null)
    try {
      await authApi.resendVerification(email)
      countdown.start()
      otp.reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kodni qayta yuborishda xatolik yuz berdi")
    }
  }

  return (
    <AuthPageLayout>
      <AuthBrandPanel
        eyebrow="Email tasdiqlash"
        title={
          <>
            Emailingizni<br />
            <span style={{ background: "linear-gradient(90deg, var(--color-inkly-orange), var(--color-inkly-coral))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              tasdiqlang
            </span>
          </>
        }
        description="Email manzilingizga 6 xonali tasdiqlash kodi yuborildi."
      />

      <AuthCardShell>
        <AuthCardHeader />

        <div style={{ marginBottom: 20 }}>
          <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>
            Emailni tasdiqlang
          </h2>
          <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
            <strong style={{ color: "var(--color-text-label)" }}>{email}</strong> manziliga 6 xonali kod yuborildi.
          </p>
        </div>

        <AuthErrorBanner message={error} />

        {/* Email badge */}
        <div
          style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "rgba(255,106,0,0.05)", border: "1px solid rgba(255,106,0,0.15)" }}
        >
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-inkly-orange), var(--color-inkly-coral))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MailIcon size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>Tasdiqlash kodi yuborildi</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {email}
            </div>
          </div>
        </div>

        {/* OTP input */}
        <div style={{ marginBottom: 20 }}>
          <label className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)", display: "block", marginBottom: 8 }}>
            Tasdiqlash kodi
          </label>
          <OtpInput
            digits={otp.digits}
            refs={otp.refs}
            onChange={otp.handleChange}
            onKeyDown={otp.handleKeyDown}
            onPaste={otp.handlePaste}
            hasError={!!error}
          />
        </div>

        <SubmitButton label={success ? "Tasdiqlandi!" : "Tasdiqlash"} loading={loading} />

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <GhostButton
            onClick={handleResend}
            disabled={countdown.active}
            style={{ color: countdown.active ? "#9CA3AF" : "var(--color-inkly-orange)" }}
          >
            {countdown.active ? `Qayta yuborish (${countdown.seconds}s)` : "Kodni qayta yuborish"}
          </GhostButton>
        </div>
      </AuthCardShell>
    </AuthPageLayout>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
