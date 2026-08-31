"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
} from "@/components/auth/auth-shared"
import { StyledInput, SubmitButton, MailIcon, AlertIcon } from "@/components/auth/auth-visuals"

const forgotSchema = z.object({
  email: z.string().email("Yaroqli email kiriting"),
})

type ForgotData = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotData) => {
    setError(null)
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
      // Small delay then navigate so user sees success briefly
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`)
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.")
    }
  }

  return (
    <AuthPageLayout>
      <AuthBrandPanel
        eyebrow="Parolni tiklash"
        title={
          <>
            Parolingizni<br />
            <span style={{ background: "linear-gradient(90deg, var(--color-inkly-orange), var(--color-inkly-coral))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              tiklang
            </span>
          </>
        }
        description="Email manzilingizni kiriting, biz sizga 6 xonali tasdiqlash kodini yuboramiz."
      />

      <AuthCardShell>
        <AuthCardHeader />

        <div style={{ marginBottom: 20 }}>
          <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>
            Parolni tiklash
          </h2>
          <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
            Email manzilingizga 6 xonali kod yuboramiz.
          </p>
        </div>

        <AuthErrorBanner message={error} />

        {sent ? (
          /* ── Success state ── */
          <div
            className="flex flex-col items-center gap-3 rounded-xl p-5 text-center"
            style={{ background: "var(--color-success-soft)", border: "1px solid var(--color-success-soft-border)" }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ background: "rgba(22,163,74,0.12)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>Kod yuborildi!</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                <strong style={{ color: "var(--color-text-primary)" }}>{getValues("email")}</strong> manziliga kod yuborildi. Yo'naltirilmoqda…
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)" }}>
                Email manzilingiz
              </label>
              <StyledInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ism@gmail.com"
                hasError={!!errors.email}
                leftIcon={<MailIcon size={16} />}
                autoFocus
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-warning)" }} role="alert">
                  <AlertIcon size={12} />{errors.email.message}
                </p>
              )}
            </div>

            <SubmitButton label="Kodni olish" loading={isSubmitting} />
          </form>
        )}

        <p className="mt-5 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Esingizga tushdimi?{" "}
          <Link href="/login" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-inkly-orange)" }}>
            Tizimga kiring
          </Link>
        </p>
      </AuthCardShell>
    </AuthPageLayout>
  )
}
