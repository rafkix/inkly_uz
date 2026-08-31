"use client"

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, type ReactNode } from "react"
import { authApi } from "@/lib/api/auth"
import { getStoredAccessToken } from "@/lib/api/client"
import type { TokenPair, UserMeResponse } from "@/types/api"

// XAVFSIZLIK: access token faqat sessionStorage'da turadi.
// Refresh token httpOnly cookie orqali backend tomonidan boshqariladi.
// TODO (backend o'zgarishi kerak): access token butunlay httpOnly cookie'ga o'tkazilishi kerak.
const TOKEN_KEY = "inkly_token"
const EXPIRES_KEY = "inkly_token_expires_at"
const LOGOUT_EVENT_KEY = "inkly_logout_at"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(TOKEN_KEY)
}

function setToken(token: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(TOKEN_KEY, token)
}

function clearToken(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EXPIRES_KEY)
}

// Token qachon eskirishini eslab qolamiz — sahifa qayta yuklanganda ham
// proaktiv yangilash zanjiri uzilmasligi uchun (faqat xotirada emas).
function setTokenExpiry(expiresIn: number): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(EXPIRES_KEY, String(Date.now() + expiresIn * 1000))
}

function getRemainingTokenLifetime(): number | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(EXPIRES_KEY)
  if (!raw) return null
  const expiresAt = Number(raw)
  if (!Number.isFinite(expiresAt)) return null
  return (expiresAt - Date.now()) / 1000
}

interface AuthState {
  user: UserMeResponse | null
  token: string | null
  loading: boolean
  error: string | null
}

type AuthAction =
  | { type: "SET_USER"; user: UserMeResponse; token: string }
  | { type: "LOGOUT" }
  | { type: "LOADING"; loading: boolean }

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { user: action.user, token: action.token, loading: false, error: null }
    case "LOGOUT":
      return { user: null, token: null, loading: false, error: null }
    case "LOADING":
      return { ...state, loading: action.loading }
    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  isAuthenticated: boolean
  login: (pair: TokenPair) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
} | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    token: null,
    loading: true,
    error: null,
  })
  // Race condition oldini olish: parallel refresh chaqiruvlarida faqat bitta ishlaydi
  const refreshingRef = useRef<Promise<void> | null>(null)
  // Rejalashtirilgan proaktiv yangilash timeri — har safar qayta rejalashtirishdan
  // oldin eskisini bekor qilish kerak, aks holda bir nechta timer bir vaqtda ishlab
  // ortiqcha /auth/refresh so'rovlarini yuboradi.
  const refreshTimerRef = useRef<(() => void) | null>(null)

  // Proaktiv token yangilash: muddat 80% o'tganda yangi token so'raladi
  // (default: 30min token → 24min da yangilanadi). Har bir muvaffaqiyatli
  // yangilashdan keyin o'zini qayta rejalashtiradi — shu bilan token doimiy
  // "tirik" turadi, foydalanuvchi faol bo'lguncha uzilmaydi.
  const scheduleProactiveRefresh = useCallback((expiresIn: number) => {
    refreshTimerRef.current?.()
    const delay = Math.max(10_000, (expiresIn * 0.8) * 1000)
    const id = setTimeout(() => { refresh() }, delay)
    const cancel = () => clearTimeout(id)
    refreshTimerRef.current = cancel
    return cancel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return refreshingRef.current

    const operation = (async () => {
      const stored = getToken()

      if (stored) {
        try {
          const user = await authApi.me(stored)
          dispatch({ type: "SET_USER", user, token: getStoredAccessToken() ?? stored })
          // Sahifa qayta yuklangan bo'lsa ham proaktiv yangilash zanjirini
          // qoldiq muddat asosida tiklaymiz.
          const remaining = getRemainingTokenLifetime()
          if (remaining !== null && remaining > 0) {
            scheduleProactiveRefresh(remaining)
          }
          return
        } catch {
          // Expired access token: fall through to the refresh-token flow.
        }
      }

      try {
        const { tokens } = await authApi.refresh()
        const user = await authApi.me(tokens.access_token)
        setToken(tokens.access_token)
        setTokenExpiry(tokens.expires_in)
        dispatch({ type: "SET_USER", user, token: tokens.access_token })
        scheduleProactiveRefresh(tokens.expires_in)
      } catch {
        clearToken()
        refreshTimerRef.current?.()
        refreshTimerRef.current = null
        dispatch({ type: "LOGOUT" })
      }
    })()

    refreshingRef.current = operation
    try {
      await operation
    } finally {
      if (refreshingRef.current === operation) refreshingRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleProactiveRefresh])

  useEffect(() => {
    refresh()
    return () => { refreshTimerRef.current?.() }
  }, [refresh])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_EVENT_KEY) {
        clearToken()
        refreshTimerRef.current?.()
        refreshTimerRef.current = null
        dispatch({ type: "LOGOUT" })
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const login = useCallback(async (pair: TokenPair) => {
    setToken(pair.access_token)
    if (pair.expires_in) setTokenExpiry(pair.expires_in)
    try {
      const user = await authApi.me(pair.access_token)
      dispatch({ type: "SET_USER", user, token: pair.access_token })
      // Token yashash muddatiga qarab proaktiv yangilash zanjirini boshlaymiz
      if (pair.expires_in) scheduleProactiveRefresh(pair.expires_in)
    } catch {
      clearToken()
      dispatch({ type: "LOGOUT" })
      throw new Error("Sessiya tiklanmadi")
    }
  }, [scheduleProactiveRefresh])

  const logout = useCallback(async () => {
    const token = getToken() ?? undefined
    if (token) await authApi.logout(token).catch(() => {})
    clearToken()
    refreshTimerRef.current?.()
    refreshTimerRef.current = null
    localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()))
    dispatch({ type: "LOGOUT" })
  }, [])

  return (
    <AuthContext.Provider value={{ state, isAuthenticated: Boolean(state.user), login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
