"use client"

import React from "react"
import { useFormContext } from "react-hook-form"
import {
  AtSignIcon,
  MailIcon,
  LockIcon,
  AlertIcon,
  StyledInput,
  SubmitButton,
  Divider,
} from "./auth-visuals"
import { AuthMethods } from "./auth-methods"
import {
  BackButton,
  UsernamePreview,
  PasswordStrengthBar,
} from "./auth-shared"
import type { Step1Data, Step2Data, Step3Data } from "./auth-constants"
import Link from "next/link"

// ─────────────────────────────────────────────────────────────────────────────
// Shared small icon
// ─────────────────────────────────────────────────────────────────────────────

function UserIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Username
// ─────────────────────────────────────────────────────────────────────────────

interface Step1Props {
  onNext: (data: Step1Data) => void
  onTelegramSuccess: () => void
}

export function RegisterStep1({ onNext, onTelegramSuccess }: Step1Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useFormContext<Step1Data>()
  const username = watch("username") ?? ""

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>
          Username tanlang
        </h2>
        <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
          Bu sizning sahifa manzilingiz bo'ladi.
        </p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)" }}>
            Username
          </label>
          <StyledInput
            id="username"
            type="text"
            autoComplete="username"
            placeholder="diyorbek_99"
            hasError={!!errors.username}
            leftIcon={<AtSignIcon size={16} />}
            autoFocus
            aria-describedby={errors.username ? "username-error" : "username-preview"}
            {...register("username")}
          />
          {errors.username ? (
            <p id="username-error" className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-warning)" }} role="alert">
              <AlertIcon size={12} />{errors.username.message}
            </p>
          ) : (
            <div id="username-preview"><UsernamePreview username={username} /></div>
          )}
        </div>

        <SubmitButton label="Davom etish" loading={false} />
      </form>

      <Divider />
      <AuthMethods onTelegramSuccess={onTelegramSuccess} />

      <p className="mt-5 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
        Akkauntingiz bormi?{" "}
        <Link href="/login" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-inkly-orange)" }}>
          Tizimga kiring
        </Link>
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Full name
// ─────────────────────────────────────────────────────────────────────────────

interface Step2Props {
  onNext: (data: Step2Data) => void
  onBack: () => void
  username: string
}

export function RegisterStep2({ onNext, onBack, username }: Step2Props) {
  const { register, handleSubmit, formState: { errors } } = useFormContext<Step2Data>()

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>
          Ismingizni kiriting
        </h2>
        <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
          Bu profil sahifangizda ko'rinadi.
        </p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="full_name" className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)" }}>
            To'liq ism
          </label>
          <StyledInput
            id="full_name"
            type="text"
            autoComplete="name"
            placeholder="Ism Familiya"
            hasError={!!errors.full_name}
            leftIcon={<UserIcon size={16} />}
            autoFocus
            aria-describedby={errors.full_name ? "fullname-error" : undefined}
            {...register("full_name")}
          />
          {errors.full_name && (
            <p id="fullname-error" className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-warning)" }} role="alert">
              <AlertIcon size={12} />{errors.full_name.message}
            </p>
          )}
        </div>

        {/* Username badge */}
        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--color-white)", border: "1px solid var(--color-border-default)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-inkly-orange), var(--color-inkly-coral))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AtSignIcon size={13} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>Username</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{username}</div>
            </div>
          </div>
          <button type="button" onClick={onBack} style={{ fontSize: 11, color: "var(--color-inkly-orange)", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}>
            O'zgartirish
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <BackButton onClick={onBack} />
          <SubmitButton label="Davom etish" loading={false} flex />
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Email + Password
// ─────────────────────────────────────────────────────────────────────────────

interface Step3Props {
  onNext: (data: Step3Data) => void
  onBack: () => void
  fullName: string
  username: string
}

export function RegisterStep3({ onNext, onBack, fullName, username }: Step3Props) {
  const [showPass, setShowPass] = React.useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useFormContext<Step3Data>()
  const password = watch("password") ?? ""

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>
          Kirish ma'lumotlari
        </h2>
        <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
          Deyarli tayyor! Email va parol kiriting.
        </p>
      </div>

      {/* Summary badge */}
      <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "var(--color-white)", border: "1px solid var(--color-border-default)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-inkly-orange), var(--color-inkly-coral))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--color-white)", flexShrink: 0 }}>
          {fullName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>@{username}</div>
        </div>
        <button type="button" onClick={onBack} style={{ fontSize: 11, color: "var(--color-inkly-orange)", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, flexShrink: 0 }}>
          Tahrirlash
        </button>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-4" noValidate>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)" }}>Email</label>
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

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)" }}>Parol</label>
          <StyledInput
            id="password"
            type={showPass ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            hasError={!!errors.password}
            leftIcon={<LockIcon size={16} />}
            rightElement={<PasswordToggle shown={showPass} onToggle={() => setShowPass((v) => !v)} />}
            aria-describedby="password-strength"
            {...register("password")}
          />
          <div id="password-strength">
            <PasswordStrengthBar password={password} />
          </div>
          {errors.password && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-warning)" }} role="alert">
              <AlertIcon size={12} />{errors.password.message}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <BackButton onClick={onBack} />
          <SubmitButton label="Ro'yxatdan o'tish" loading={isSubmitting} flex />
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Password toggle button (extracted from inline)
// ─────────────────────────────────────────────────────────────────────────────

export function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      style={{ color: "#9CA3AF", display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "2px", borderRadius: "6px" }}
      aria-label={shown ? "Parolni yashirish" : "Parolni ko'rsatish"}
      aria-pressed={shown}
    >
      {shown ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}