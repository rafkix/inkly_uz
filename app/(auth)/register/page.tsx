"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"

import {
  step1Schema, step2Schema, step3Schema,
  type Step1Data, type Step2Data, type Step3Data,
} from "@/components/auth/auth-constants"
import { useOtp, useCountdown, useStepTransition } from "@/components/auth/auth-hooks"
import {
  AuthPageLayout,
  AuthBrandPanel,
  AuthCardShell,
  AuthCardHeader,
  AuthErrorBanner,
  AuthSecurityFooter,
  StepIndicator,
} from "@/components/auth/auth-shared"
import { RegisterStep1, RegisterStep2, RegisterStep3 } from "@/components/auth/register-steps"
import { RegisterStep4Otp } from "@/components/auth/register-step4-otp"

// ─────────────────────────────────────────────────────────────────────────────
// Shared form data shape
// ─────────────────────────────────────────────────────────────────────────────

interface RegisterFormData {
  username: string
  full_name: string
  email: string
  password: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterLayout />
    </Suspense>
  )
}

function RegisterLayout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, login } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!state.loading && state.user) router.replace("/dashboard")
  }, [state.loading, state.user, router])

  // ── Shared state ─────────────────────────────────────────────────────────

  const [formData, setFormData] = useState<RegisterFormData>({
    username: searchParams.get("username") ?? "",
    full_name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)

  const { step, goTo, animKey, activeStyle } = useStepTransition(1)
  const otp = useOtp()
  const countdown = useCountdown()

  // ── Step 1 form ──────────────────────────────────────────────────────────

  const step1Methods = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { username: formData.username },
    mode: "onSubmit",
  })

  const step2Methods = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { full_name: formData.full_name },
    mode: "onSubmit",
  })

  const step3Methods = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { email: formData.email, password: formData.password },
    mode: "onSubmit",
  })

  // ── Step handlers ─────────────────────────────────────────────────────────

  function handleStep1(data: Step1Data) {
    setFormData((prev) => ({ ...prev, username: data.username }))
    setError(null)
    goTo(2, "forward")
  }

  function handleStep2(data: Step2Data) {
    setFormData((prev) => ({ ...prev, full_name: data.full_name }))
    setError(null)
    goTo(3, "forward")
  }

  async function handleStep3(data: Step3Data) {
    setError(null)
    try {
      await authApi.register({ ...formData, ...data })
      setFormData((prev) => ({ ...prev, email: data.email, password: data.password }))
      otp.reset()
      countdown.start()
      goTo(4, "forward")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik yuz berdi")
    }
  }

  async function handleVerify() {
    if (!otp.isComplete) { setError("6 xonali kodni to'liq kiriting"); return }
    setOtpLoading(true)
    setError(null)
    try {
      const { tokens } = await authApi.confirmRegistration({ email: formData.email, code: otp.value })
      await login(tokens)
      router.replace("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod noto'g'ri yoki muddati tugagan")
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleResend() {
    if (countdown.active) return
    setError(null)
    try {
      await authApi.resendVerification(formData.email)
      countdown.start()
      otp.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kodni qayta yuborishda xatolik")
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AuthPageLayout>
      <AuthBrandPanel
        title={
          <>
            Fikrlaringizni<br />
            <span style={{ background: "linear-gradient(90deg, var(--color-inkly-orange), var(--color-inkly-coral))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              dunyoga yetkazing
            </span>
          </>
        }
        description="Inkly — yozish, ulashish va o'z auditoriyangizni topish uchun yaratilgan zamonaviy platforma."
      />

      <AuthCardShell>
        <AuthCardHeader />
        <StepIndicator current={step} />
        <AuthErrorBanner message={error} />

        {/* Steps are always mounted — hidden via display:none so there's no
            unmount/remount flash. The active step wrapper gets a changing key
            so React restarts the CSS animation on every navigation. */}

        <div
          key={step === 1 ? `s1-${animKey}` : "s1"}
          style={step === 1 ? activeStyle : { display: "none" }}
          aria-hidden={step !== 1}
        >
          <FormProvider {...step1Methods}>
            <RegisterStep1
              onNext={handleStep1}
              onTelegramSuccess={() => router.replace("/dashboard")}
            />
          </FormProvider>
        </div>

        <div
          key={step === 2 ? `s2-${animKey}` : "s2"}
          style={step === 2 ? activeStyle : { display: "none" }}
          aria-hidden={step !== 2}
        >
          <FormProvider {...step2Methods}>
            <RegisterStep2
              onNext={handleStep2}
              onBack={() => goTo(1, "back")}
              username={formData.username}
            />
          </FormProvider>
        </div>

        <div
          key={step === 3 ? `s3-${animKey}` : "s3"}
          style={step === 3 ? activeStyle : { display: "none" }}
          aria-hidden={step !== 3}
        >
          <FormProvider {...step3Methods}>
            <RegisterStep3
              onNext={handleStep3}
              onBack={() => goTo(2, "back")}
              fullName={formData.full_name}
              username={formData.username}
            />
          </FormProvider>
        </div>

        <div
          key={step === 4 ? `s4-${animKey}` : "s4"}
          style={step === 4 ? activeStyle : { display: "none" }}
          aria-hidden={step !== 4}
        >
          <RegisterStep4Otp
            email={formData.email}
            otp={otp}
            countdown={countdown}
            hasError={!!error}
            isLoading={otpLoading}
            onVerify={handleVerify}
            onResend={handleResend}
            onWrongEmail={() => { setError(null); goTo(3, "back") }}
          />
        </div>

        <AuthSecurityFooter />
      </AuthCardShell>
    </AuthPageLayout>
  )
}