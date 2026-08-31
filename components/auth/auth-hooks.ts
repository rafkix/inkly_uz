"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { OTP_LENGTH, RESEND_COUNTDOWN } from "./auth-constants"

// ─────────────────────────────────────────────────────────────────────────────
// useCountdown — generic countdown timer
// ─────────────────────────────────────────────────────────────────────────────

export function useCountdown(initial = 0) {
  const [seconds, setSeconds] = useState(initial)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  const start = useCallback((from = RESEND_COUNTDOWN) => setSeconds(from), [])
  const reset = useCallback(() => setSeconds(0), [])

  return { seconds, start, reset, active: seconds > 0 }
}

// ─────────────────────────────────────────────────────────────────────────────
// useOtp — OTP state + refs + handlers
// ─────────────────────────────────────────────────────────────────────────────

export function useOtp() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  // Fixed-length array of refs — never changes length, so hook rules are safe
  const refs = useRef<Array<React.RefObject<HTMLInputElement | null>>>(
    Array.from({ length: OTP_LENGTH }, () => ({ current: null }))
  )

  const focusCell = useCallback((index: number) => {
    refs.current[index]?.current?.focus()
  }, [])

  const handleChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.current?.focus()
    }
  }, [])

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (digits[index]) {
          // Clear current cell
          setDigits((prev) => { const n = [...prev]; n[index] = ""; return n })
        } else if (index > 0) {
          // Move back and clear previous
          setDigits((prev) => { const n = [...prev]; n[index - 1] = ""; return n })
          refs.current[index - 1]?.current?.focus()
        }
        return
      }
      if (e.key === "ArrowLeft" && index > 0) focusCell(index - 1)
      if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) focusCell(index + 1)
    },
    [digits, focusCell]
  )

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (!pasted) return
    e.preventDefault()
    setDigits((prev) => {
      const next = [...prev]
      pasted.split("").forEach((ch, i) => { next[i] = ch })
      return next
    })
    focusCell(Math.min(pasted.length, OTP_LENGTH - 1))
  }, [focusCell])

  const reset = useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(""))
    setTimeout(() => focusCell(0), 0)
  }, [focusCell])

  const value = digits.join("")
  const isComplete = value.length === OTP_LENGTH

  return { digits, refs: refs.current, value, isComplete, handleChange, handleKeyDown, handlePaste, reset }
}

// ─────────────────────────────────────────────────────────────────────────────
// useQuoteRotator
// ─────────────────────────────────────────────────────────────────────────────

export function useQuoteRotator(total: number, intervalMs = 5000) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % total)
        setVisible(true)
      }, 400)
    }, intervalMs)
    return () => clearInterval(id)
  }, [total, intervalMs])

  const goTo = useCallback((i: number) => {
    setVisible(false)
    setTimeout(() => { setIndex(i); setVisible(true) }, 400)
  }, [])

  return { index, visible, goTo }
}

// ─────────────────────────────────────────────────────────────────────────────
// useStepTransition — CSS keyframe-based, no unmount flash
// ─────────────────────────────────────────────────────────────────────────────
//
// Strategy: steps are never unmounted — they sit in the DOM with
// visibility controlled by CSS. Only the active step gets the
// slide-in keyframe; inactive steps are display:none so they
// don't affect layout or tab order.
//
// Keyframes are injected once into <head> so they work across
// any component that calls this hook.

export type SlideDir = "forward" | "back"

const KEYFRAMES_ID = "__inkly_step_keyframes__"

function injectKeyframes() {
  if (typeof document === "undefined") return
  if (document.getElementById(KEYFRAMES_ID)) return
  const style = document.createElement("style")
  style.id = KEYFRAMES_ID
  style.textContent = `
    @keyframes step-in-forward  { from { opacity:0; transform:translateX(22px) } to { opacity:1; transform:translateX(0) } }
    @keyframes step-in-back     { from { opacity:0; transform:translateX(-22px) } to { opacity:1; transform:translateX(0) } }
  `
  document.head.appendChild(style)
}

export function useStepTransition(initial = 1) {
  const [step, setStep] = useState(initial)
  const [dir, setDir] = useState<SlideDir>("forward")
  // animKey changes on every navigation → triggers CSS animation restart
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => { injectKeyframes() }, [])

  const goTo = useCallback((next: number, direction: SlideDir = "forward") => {
    setDir(direction)
    setStep(next)
    setAnimKey((k) => k + 1)
  }, [])

  // Returns the style for the currently active step panel
  const activeStyle: React.CSSProperties = {
    animation: `${dir === "forward" ? "step-in-forward" : "step-in-back"} 220ms cubic-bezier(0.23,1,0.32,1) both`,
  }

  return { step, dir, animKey, goTo, activeStyle }
}

// ─────────────────────────────────────────────────────────────────────────────
// usePasswordStrength
// ─────────────────────────────────────────────────────────────────────────────

export interface StrengthResult {
  score: number  // 0–5
  label: string
  color: string
}

export function getPasswordStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: "", color: "var(--color-border-default)" }
  let score = 0
  if (password.length >= 8)            score++
  if (password.length >= 12)           score++
  if (/[A-Z]/.test(password))          score++
  if (/[0-9]/.test(password))          score++
  if (/[^a-zA-Z0-9]/.test(password))  score++

  if (score <= 1) return { score: 1, label: "Juda zaif",   color: "#EF4444" }
  if (score === 2) return { score: 2, label: "Zaif",        color: "#F97316" }
  if (score === 3) return { score: 3, label: "O'rtacha",    color: "#EAB308" }
  if (score === 4) return { score: 4, label: "Kuchli",      color: "#22C55E" }
  return              { score: 5, label: "Juda kuchli", color: "#16A34A" }
}