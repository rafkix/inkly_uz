"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authApi } from "@/lib/api/auth"
import {
  AuthPageLayout,
  AuthBrandPanel,
  AuthCardShell,
  AuthCardHeader,
  AuthErrorBanner,
  OtpInput,
} from "@/components/auth/auth-shared"
import { useOtp } from "@/components/auth/auth-hooks"
import {
  StyledInput,
  SubmitButton,
  LockIcon,
  AlertIcon,
  PasswordToggleButton,
} from "@/components/auth/auth-visuals"

const resetSchema = z
  .object({
    new_password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak").max(128, "Parol juda uzun"),
    confirm_password: z.string().min(1, "Parolni tasdiqlang"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Parollar mos emas",
    path: ["confirm_password"],
  })

type ResetData = z.infer<typeof resetSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const otp = useOtp()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
  })

  // No email → redirect to forgot-password
  if (!email && typeof window !== "undefined") {
    router.replace("/forgot-password")
    return null
  }

  const onSubmit = async (data: ResetData) => {
    if (!otp.isComplete) {
      setError("Iltimos, 6 xonali tasdiqlash kodini to'liq kiriting")
      return
    }
    setError(null)
    try {
      await authApi.resetPassword({
        email,
        code: otp.value,
        new_password: data.new_password,
      })
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kod noto'g'ri yoki muddati tugagan")
    }
  }

  return (
    <AuthPageLayout>
      <AuthBrandPanel
        eyebrow="Yangi parol"
        title={
          <>
            Parolni<br />
            <span style={{ background: "linear-gradient(90deg, var(--color-inkly-orange), var(--color-inkly-coral))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              yangilang
            </span>
          </>
        }
        description="Emailingizga yuborilgan 6 xonali kodni va yangi parolingizni kiriting."
      />

      <AuthCardShell>
        <AuthCardHeader />

        <div style={{ marginBottom: 20 }}>
          <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>
            Yangi parol
          </h2>
          <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
            <strong style={{ color: "var(--color-text-label)" }}>{email}</strong> manziliga kod yuborildi.
          </p>
        </div>

        <AuthErrorBanner message={error} />

        {success ? (
          <div
            className="flex flex-col items-center gap-3 rounded-xl p-5 text-center"
            style={{ background: "var(--color-success-soft)", border: "1px solid var(--color-success-soft-border)" }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "rgba(22,163,74,0.12)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>Parol muvaffaqiyatli yangilandi!</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Login sahifasiga yo'naltirilmoqda…</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {/* OTP */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)" }}>
                Tasdiqlash kodi
              </label>
              <OtpInput
                digits={otp.digits}
                refs={otp.refs}
                onChange={otp.handleChange}
                onKeyDown={otp.handleKeyDown}
                onPaste={otp.handlePaste}
                hasError={false}
              />
            </div>

            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="new_password" className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)" }}>
                Yangi parol
              </label>
              <StyledInput
                id="new_password"
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                hasError={!!errors.new_password}
                leftIcon={<LockIcon size={16} />}
                rightElement={<PasswordToggleButton shown={showPass} onToggle={() => setShowPass((v) => !v)} />}
                aria-describedby={errors.new_password ? "newpass-error" : undefined}
                {...register("new_password")}
              />
              {errors.new_password && (
                <p id="newpass-error" className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-warning)" }} role="alert">
                  <AlertIcon size={12} />{errors.new_password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm_password" className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)" }}>
                Parolni tasdiqlash
              </label>
              <StyledInput
                id="confirm_password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                hasError={!!errors.confirm_password}
                leftIcon={<LockIcon size={16} />}
                rightElement={<PasswordToggleButton shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />}
                aria-describedby={errors.confirm_password ? "confirm-error" : undefined}
                {...register("confirm_password")}
              />
              {errors.confirm_password && (
                <p id="confirm-error" className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-warning)" }} role="alert">
                  <AlertIcon size={12} />{errors.confirm_password.message}
                </p>
              )}
            </div>

            <SubmitButton label="Parolni yangilash" loading={isSubmitting} />

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm transition-opacity hover:opacity-80"
                style={{ color: "var(--color-text-muted)" }}
              >
                Bekor qilish va ortga qaytish
              </Link>
            </div>
          </form>
        )}
      </AuthCardShell>
    </AuthPageLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
