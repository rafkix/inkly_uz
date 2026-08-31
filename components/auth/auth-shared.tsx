"use client"

import React, { useState } from "react"
import Link from "next/link"
import { LogoMark } from "@/components/ui/logo"
import { QUOTES, FEATURES, STATS } from "./auth-constants"
import { useQuoteRotator, getPasswordStrength } from "./auth-hooks"
import { AlertIcon } from "./auth-visuals"
import { WaveBackground } from "@/components/ui/wave-background"

// ─────────────────────────────────────────────────────────────────────────────
// AuthPageLayout — outer two-column shell
// ─────────────────────────────────────────────────────────────────────────────

export function AuthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-0 flex w-screen h-screen overflow-hidden"
      style={{ width: "100vw", height: "100dvh", background: "var(--color-bg-muted)" }}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthBrandPanel — left dark panel with logo, headline, quotes
// ─────────────────────────────────────────────────────────────────────────────

interface AuthBrandPanelProps {
  eyebrow?: string
  title: React.ReactNode
  description: string
}

export function AuthBrandPanel({ eyebrow = "Yozuvchilar platformasi", title, description }: AuthBrandPanelProps) {
  const { index, visible, goTo } = useQuoteRotator(QUOTES.length)
  const q = QUOTES[index]

  return (
    <aside
      className="hidden lg:flex lg:w-1/2 h-full min-h-0 min-w-0 relative flex-col justify-between overflow-hidden px-12 py-12"
      style={{ background: "linear-gradient(150deg, var(--color-text-primary) 0%, var(--color-text-primary) 100%)" }}
    >
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,106,0,0.20) 0%, transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-[280px] h-[280px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,138,61,0.10) 0%, transparent 70%)" }} />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-1.5 shrink-0">
        <LogoMark size={24} className="text-white" />
        <span className="text-white text-lg font-bold tracking-tighter">inkly</span>
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 flex flex-col justify-center min-h-0 py-10 space-y-5">
        {/* Eyebrow badge */}
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em] font-medium w-fit"
          style={{ background: "rgba(255,106,0,0.13)", border: "1px solid rgba(255,106,0,0.28)", color: "var(--color-inkly-coral)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-inkly-orange)" }} />
          {eyebrow}
        </span>

        {/* Title */}
        <h1 className="text-5xl xl:text-[3.4rem] font-bold leading-[1.08] tracking-tight text-white">
          {title}
        </h1>

        <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: "var(--color-text-muted)" }}>
          {description}
        </p>

        {/* Stats */}
        <div className="flex gap-8 pt-1">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold tabular-nums text-white">{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-col gap-2.5 pt-1">
          {FEATURES.map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,106,0,0.12)", border: "1px solid rgba(255,106,0,0.20)", color: "var(--color-inkly-coral)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.iconPath} />
                </svg>
              </div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div
        className="relative z-10 rounded-2xl p-6 shrink-0"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 400ms ease, transform 400ms ease",
        }}
      >
        <span className="text-4xl leading-none font-serif select-none" style={{ color: "var(--color-inkly-orange)" }}>"</span>
        <p className="text-sm leading-relaxed mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>{q.text}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-inkly-orange), var(--color-inkly-coral))" }}
            >
              {q.author[0]}
            </div>
            <div>
              <div className="text-xs font-medium text-white">{q.author}</div>
              <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{q.role}</div>
            </div>
          </div>
          {/* Dot pagination */}
          <div className="flex gap-1.5">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: i === index ? "var(--color-inkly-orange)" : "rgba(255,255,255,0.2)",
                  transform: i === index ? "scale(1.4)" : "scale(1)",
                }}
                aria-label={`Fikr ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthCardShell — right panel scroll container + white card
// ─────────────────────────────────────────────────────────────────────────────

export function AuthCardShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="w-full lg:w-1/2 h-full min-h-0 min-w-0 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden"
      style={{ background: "var(--color-bg-muted)", position: "relative", isolation: "isolate", overscrollBehavior: "contain" }}
    >
      <WaveBackground />
      <div className="w-full min-h-full flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10" style={{ position: "relative", zIndex: 1 }}>
        <section
          className="w-full max-w-[400px]"
          style={{
            background: "var(--color-white)",
            borderRadius: "24px",
            padding: "28px 24px 24px",
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.06),
              0 2px 4px rgba(0,0,0,0.04),
              0 8px 20px rgba(0,0,0,0.06),
              0 24px 48px rgba(0,0,0,0.08)
            `,
          }}
        >
          {children}
        </section>
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthCardHeader — logo row inside the card
// ─────────────────────────────────────────────────────────────────────────────

export function AuthCardHeader() {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6 lg:justify-start">
      <LogoMark size={22} className="text-primary" />
      <span className="text-lg font-bold tracking-tighter" style={{ color: "var(--color-text-primary)" }}>inkly</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthErrorBanner
// ─────────────────────────────────────────────────────────────────────────────

export function AuthErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm"
      style={{
        background: "linear-gradient(135deg, var(--color-inkly-orange-light), var(--color-inkly-orange-light))",
        border: "1px solid rgba(255,106,0,0.25)",
        color: "var(--color-inkly-orange-dark)",
        boxShadow: "0 2px 8px rgba(255,106,0,0.08)",
      }}
    >
      <AlertIcon size={15} />
      <span className="min-w-0 break-words">{message}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthSecurityFooter
// ─────────────────────────────────────────────────────────────────────────────

export function AuthSecurityFooter() {
  return (
    <>
      <div className="mt-5 flex items-center justify-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
        <p className="text-center text-xs" style={{ color: "#9CA3AF" }}>Ma'lumotlaringiz xavfsiz saqlanadi</p>
      </div>
      <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: "#9CA3AF" }}>
        Ro'yxatdan o'tib, siz{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600" style={{ color: "var(--color-text-muted)" }}>
          foydalanish shartlari
        </Link>{" "}va{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600" style={{ color: "var(--color-text-muted)" }}>
          maxfiylik siyosati
        </Link>{" "}ga rozilik bildirasiz.
      </p>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BackButton — standardized to Lexis interaction language
// Same 46px height, 14px radius, 160ms ease as SubmitButton family
// ─────────────────────────────────────────────────────────────────────────────

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 46,
        width: 46,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        background: "var(--color-bg-muted)",
        border: "1.5px solid var(--color-border-default)",
        cursor: "pointer",
        color: "var(--color-text-muted)",
        transition: "background 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = "translateY(-1px)"
        el.style.background = "var(--color-border-default)"
        el.style.borderColor = "transparent"
        el.style.boxShadow = "0 3px 10px rgba(0,0,0,0.08)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = "translateY(0)"
        el.style.background = "var(--color-bg-muted)"
        el.style.borderColor = "var(--color-border-default)"
        el.style.boxShadow = "none"
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(0.985)"
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)"
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = "none"
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,106,0,0.20)"
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none"
      }}
      aria-label="Ortga"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UsernamePreview
// ─────────────────────────────────────────────────────────────────────────────

export function UsernamePreview({ username }: { username: string }) {
  if (!username) return null
  return (
    <div
      style={{
        marginTop: 8,
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 8,
        background: "rgba(255,106,0,0.07)",
        border: "1px solid rgba(255,106,0,0.18)",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-inkly-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      <span style={{ fontSize: 12, color: "#494949", fontWeight: 500 }}>
        inkly.uz/@<strong>{username}</strong>
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PasswordStrengthBar
// ─────────────────────────────────────────────────────────────────────────────

export function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password)
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }} role="status" aria-label={`Parol kuchi: ${label}`}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 99,
              background: i <= score ? color : "var(--color-border-default)",
              transition: "background 300ms ease",
            }}
          />
        ))}
      </div>
      <p style={{ marginTop: 4, fontSize: 11, color, fontWeight: 500 }}>{label}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OtpInput
// ─────────────────────────────────────────────────────────────────────────────

interface OtpInputProps {
  digits: string[]
  refs: React.RefObject<HTMLInputElement | null>[]
  onChange: (i: number, v: string) => void
  onKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste: (e: React.ClipboardEvent) => void
  hasError: boolean
}

export function OtpInput({ digits, refs, onChange, onKeyDown, onPaste, hasError }: OtpInputProps) {
  return (
    <div style={{ display: "flex", gap: 8 }} role="group" aria-label="Tasdiqlash kodi">
      {digits.map((digit, i) => (
        <OtpCell
          key={i}
          index={i}
          value={digit}
          inputRef={refs[i]}
          hasError={hasError}
          autoFocus={i === 0}
          onChange={(v) => onChange(i, v)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
        />
      ))}
    </div>
  )
}

interface OtpCellProps {
  index: number
  value: string
  inputRef: React.RefObject<HTMLInputElement | null>
  hasError: boolean
  autoFocus?: boolean
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste: (e: React.ClipboardEvent) => void
}

function OtpCell({ index, value, inputRef, hasError, autoFocus, onChange, onKeyDown, onPaste }: OtpCellProps) {
  const [focused, setFocused] = useState(false)
  const filled = value !== ""

  const borderBg = focused
    ? "linear-gradient(135deg, var(--color-inkly-orange), var(--color-inkly-coral))"
    : hasError
      ? "linear-gradient(135deg, #EF4444, #F97316)"
      : filled
        ? "linear-gradient(135deg, var(--color-border-default), #D1D5DB)"
        : "linear-gradient(135deg, var(--color-border-default), var(--color-bg-muted))"

  return (
    <div
      style={{
        flex: 1, aspectRatio: "1", borderRadius: 14, padding: "1.5px",
        background: borderBg,
        boxShadow: focused
          ? "0 0 0 4px rgba(255,106,0,0.12)"
          : hasError ? "0 0 0 3px rgba(239,68,68,0.10)" : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "all 180ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 12.5, background: "var(--color-white)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", height: "100%",
            background: "transparent", border: "none", outline: "none",
            textAlign: "center", fontSize: 20, fontWeight: 700,
            color: hasError ? "#EF4444" : "var(--color-text-primary)",
            caretColor: "var(--color-inkly-orange)",
            fontVariantNumeric: "tabular-nums",
          }}
          aria-label={`Kod raqami ${index + 1}`}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StepIndicator
// ─────────────────────────────────────────────────────────────────────────────

const STEP_LABELS = ["Username", "Ismingiz", "Parol", "Tasdiqlash"] as const

export function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }} role="list" aria-label="Ro'yxatdan o'tish bosqichlari">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }} role="listitem">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600, flexShrink: 0,
                  transition: "all 300ms cubic-bezier(0.23,1,0.32,1)",
                  background: done || active
                    ? "linear-gradient(135deg, var(--color-inkly-orange), var(--color-inkly-coral))"
                    : "var(--color-bg-muted)",
                  color: done || active ? "var(--color-white)" : "#9CA3AF",
                  boxShadow: active ? "0 0 0 4px rgba(255,106,0,0.15)" : "none",
                }}
                aria-current={active ? "step" : undefined}
              >
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  : step
                }
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, whiteSpace: "nowrap", transition: "color 300ms ease", color: active ? "var(--color-inkly-orange)" : done ? "var(--color-text-muted)" : "#9CA3AF" }}>
                {label}
              </span>
            </div>
            {i < 3 && (
              <div style={{ flex: 1, height: 2, marginBottom: 16, marginLeft: 4, marginRight: 4, borderRadius: 99, background: done ? "var(--color-inkly-orange)" : "var(--color-border-default)", transition: "background 400ms ease" }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
