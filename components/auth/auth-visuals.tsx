"use client"

import { useState, type InputHTMLAttributes, type ReactNode } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

export function AtSignIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  )
}

export function MailIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function LockIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function AlertIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function EyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export function PasswordToggleButton({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      style={{
        color: "#9CA3AF",
        display: "flex",
        alignItems: "center",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px",
        borderRadius: "6px",
        transition: "color 150ms ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "#FF6A00" }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF" }}
      aria-label={shown ? "Yashirish" : "Ko'rsatish"}
    >
      {shown ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLED INPUT
// ─────────────────────────────────────────────────────────────────────────────

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  leftIcon?: ReactNode
  rightElement?: ReactNode
}

export function StyledInput({ hasError, leftIcon, rightElement, style, ...props }: StyledInputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "14px",
        padding: "1.5px",
        background: focused
          ? "linear-gradient(135deg, #FF6A00, #FF8A3D)"
          : hasError
            ? "linear-gradient(135deg, var(--color-warning), #FB923C)"
            : "linear-gradient(135deg, #E5E7EB, #F3F4F6)",
        boxShadow: focused
          ? "0 0 0 4px rgba(255,106,0,0.12), 0 2px 8px rgba(255,106,0,0.15)"
          : hasError
            ? "0 0 0 3px rgba(249,115,22,0.10)"
            : "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        transition: "box-shadow 180ms cubic-bezier(0.23,1,0.32,1), background 180ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "12.5px",
          overflow: "hidden",
          background: focused ? "#FFFFFF" : "#FAFAFA",
          transition: "background 180ms ease",
        }}
      >
        {leftIcon && (
          <span
            style={{
              position: "absolute",
              left: "13px",
              top: "50%",
              transform: "translateY(-50%)",
              color: focused ? "#FF6A00" : "#9CA3AF",
              transition: "color 180ms ease",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {leftIcon}
          </span>
        )}
        <input
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          style={{
            width: "100%",
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: "#141414",
            paddingLeft: leftIcon ? "40px" : "14px",
            paddingRight: rightElement ? "44px" : "14px",
            paddingTop: "11px",
            paddingBottom: "11px",
            ...style,
          }}
        />
        {rightElement && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT BUTTON
// Lexis interaction language: translateY(-1px) on hover, scale(0.985) on press,
// spinner preserving button dimensions, 46px height, 14px radius, 160ms ease.
// Main project colors preserved: #FF6A00 → #FF8A3D gradient.
// ─────────────────────────────────────────────────────────────────────────────

const SUBMIT_BTN_BASE: React.CSSProperties = {
  width: "100%",
  height: "46px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  borderRadius: "14px",
  padding: "0 20px",
  fontSize: "14px",
  fontWeight: 600,
  letterSpacing: "0.01em",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
  // Lexis motion: 160ms ease for all interactive properties
  transition: "transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease",
}

export function SubmitButton({ label, loading, flex }: { label: string; loading: boolean; flex?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        ...SUBMIT_BTN_BASE,
        flex: flex ? 1 : undefined,
        width: flex ? undefined : "100%",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.72 : 1,
        // Main project orange gradient — unchanged
        background: "linear-gradient(135deg, #FF6A00 0%, #FF8A3D 100%)",
        // Lexis: inset highlight + shadow system
        boxShadow: loading
          ? "none"
          : "0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 16px rgba(255,106,0,0.35)",
      }}
      onMouseEnter={(e) => {
        if (loading) return
        const el = e.currentTarget
        el.style.transform = "translateY(-1px)"
        el.style.boxShadow = "0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 24px rgba(255,106,0,0.45)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = "translateY(0)"
        el.style.boxShadow = "0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 16px rgba(255,106,0,0.35)"
      }}
      onMouseDown={(e) => {
        if (loading) return
        e.currentTarget.style.transform = "translateY(0) scale(0.985)"
        e.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.18) inset, 0 2px 8px rgba(255,106,0,0.28)"
      }}
      onMouseUp={(e) => {
        if (loading) return
        e.currentTarget.style.transform = "translateY(-1px)"
        e.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 24px rgba(255,106,0,0.45)"
      }}
      // Keyboard focus: visible ring in brand color
      onFocus={(e) => {
        e.currentTarget.style.outline = "none"
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,106,0,0.35), 0 4px 16px rgba(255,106,0,0.25)"
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = loading
          ? "none"
          : "0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 16px rgba(255,106,0,0.35)"
      }}
    >
      {/* Inset shine overlay — matches Lexis lx-btn-sh pseudo */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "14px",
          background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {loading ? (
        <>
          <svg
            aria-hidden
            style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="white" strokeLinecap="round" />
          </svg>
          Yuklanmoqda…
        </>
      ) : (
        <>
          {label}
          <span
            aria-hidden
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </>
      )}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTLINE BUTTON (Google / secondary social buttons)
// Same shape language as SubmitButton but outline variant.
// ─────────────────────────────────────────────────────────────────────────────

interface OutlineButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: ReactNode
  type?: "button" | "submit" | "reset"
}

export function OutlineButton({ onClick, disabled, loading, children, type = "button" }: OutlineButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...SUBMIT_BTN_BASE,
        width: "100%",
        background: "#FFFFFF",
        color: "#141414",
        border: "1.5px solid #E5E7EB",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled && !loading ? 0.55 : 1,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        if (disabled || loading) return
        const el = e.currentTarget
        el.style.transform = "translateY(-1px)"
        el.style.borderColor = "rgba(255,106,0,0.40)"
        el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.10)"
        el.style.background = "rgba(255,106,0,0.03)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = "translateY(0)"
        el.style.borderColor = "#E5E7EB"
        el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"
        el.style.background = "#FFFFFF"
      }}
      onMouseDown={(e) => {
        if (disabled || loading) return
        e.currentTarget.style.transform = "translateY(0) scale(0.985)"
      }}
      onMouseUp={(e) => {
        if (disabled || loading) return
        e.currentTarget.style.transform = "translateY(-1px)"
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = "none"
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,106,0,0.20), 0 1px 3px rgba(0,0,0,0.06)"
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"
      }}
    >
      {loading ? (
        <>
          <svg
            aria-hidden
            style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(0,0,0,0.35)"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="#FF6A00" strokeLinecap="round" />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GHOST / TEXT BUTTON (resend, wrong email, inline text actions)
// ─────────────────────────────────────────────────────────────────────────────

interface GhostButtonProps {
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  style?: React.CSSProperties
}

export function GhostButton({ onClick, disabled, children, style }: GhostButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 13,
        fontWeight: 500,
        color: disabled ? "#9CA3AF" : "var(--color-inkly-orange)",
        transition: "color 160ms ease, opacity 160ms ease",
        padding: 0,
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.75" }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DIVIDER
// ─────────────────────────────────────────────────────────────────────────────

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
      <span className="text-xs font-medium px-1 shrink-0" style={{ color: "#9CA3AF" }}>yoki</span>
      <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
    </div>
  )
}

// NOTE: AuthBrandPanel and AuthCardShell live in auth-shared.tsx — use from there.


