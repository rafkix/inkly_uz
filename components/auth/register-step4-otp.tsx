"use client"

import React, { useEffect } from "react"
import { OtpInput } from "./auth-shared"
import { MailIcon, GhostButton, SubmitButton } from "./auth-visuals"
import type { useOtp } from "./auth-hooks"
import type { useCountdown } from "./auth-hooks"

// ─────────────────────────────────────────────────────────────────────────────
// RegisterStep4Otp
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  email: string
  otp: ReturnType<typeof useOtp>
  countdown: ReturnType<typeof useCountdown>
  hasError: boolean
  isLoading: boolean
  onVerify: () => void
  onResend: () => void
  onWrongEmail: () => void
}

export function RegisterStep4Otp({
  email, otp, countdown, hasError, isLoading, onVerify, onResend, onWrongEmail,
}: Props) {
  useEffect(() => {
    otp.refs[0]?.current?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (otp.isComplete && !hasError && !isLoading) {
      onVerify()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp.value])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "var(--color-text-primary)" }}>
          Emailni tasdiqlang
        </h2>
        <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
          <span style={{ fontWeight: 600, color: "var(--color-text-label)" }}>{email}</span> manziliga 6 xonali kod yuborildi.
        </p>
      </div>

      {/* Email info badge */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "rgba(255,106,0,0.05)", border: "1px solid rgba(255,106,0,0.15)" }}>
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
      <div style={{ marginBottom: 8 }}>
        <label className="text-[13px] font-semibold" style={{ color: "var(--color-text-label)", display: "block", marginBottom: 8 }}>
          Tasdiqlash kodi
        </label>
        <OtpInput
          digits={otp.digits}
          refs={otp.refs}
          onChange={otp.handleChange}
          onKeyDown={otp.handleKeyDown}
          onPaste={otp.handlePaste}
          hasError={hasError}
        />
      </div>

      {/* Verify button — uses shared SubmitButton for consistency */}
      <div style={{ marginTop: 20 }}>
        <SubmitButton label="Tasdiqlash" loading={isLoading} />
      </div>

      {/* Resend */}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <GhostButton
          onClick={onResend}
          disabled={countdown.active}
          style={{ color: countdown.active ? "#9CA3AF" : "var(--color-inkly-orange)" }}
        >
          {countdown.active ? `Qayta yuborish (${countdown.seconds}s)` : "Kodni qayta yuborish"}
        </GhostButton>
      </div>

      {/* Wrong email */}
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <button
          type="button"
          onClick={onWrongEmail}
          style={{
            background: "none", border: "none", fontSize: 12, color: "#9CA3AF",
            cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3,
            transition: "color 160ms ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#6B7280" }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF" }}
        >
          Noto&apos;g&apos;ri email? Orqaga qaytish
        </button>
      </div>
    </div>
  )
}
