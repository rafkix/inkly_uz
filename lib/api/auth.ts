import { apiRequest } from "./client"
import { createSafeItemWrapper } from "./safe-wrapper"
import type { SessionOut, TokenPair, UserMeResponse } from "@/types/api"

export interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string | null
  username?: string | null
  photo_url?: string | null
  auth_date: number
  hash: string
}

export interface TelegramBotStartResponse {
  verification_id: string
  token: string
  deep_link: string | null
  expires_at: string
}

/* Ba'zi endpointlar (Google redirect URL) swagger bo'yicha "string"
   qaytarishi kerak, lekin runtime'da backend { url: string } shaklidagi
   JSON qaytarishi kuzatilgan. Bu shu ikkalasini ham qo'llab-quvvatlaydi,
   shunda chaqiruvchi tomon (masalan AuthMethods) doim toza string oladi
   va "/[object Object]"ga redirect bo'lish muammosi qaytmaydi. */
function extractUrlString(response: unknown, context: string): string {
  const obj = response as { url?: string; authorization_url?: string } | null
  const url = typeof response === "string" ? response : obj?.url ?? obj?.authorization_url

  if (!url || typeof url !== "string") {
    throw new Error(`${context}: havola olinmadi`)
  }
  return url
}

export const authApi = {
  register: (data: { email: string; password: string; full_name: string; username?: string | null }) =>
    apiRequest<{ message: string; email: string }>(
      `/auth/register${data.username ? `?username=${encodeURIComponent(data.username)}` : ""}`,
      { method: "POST", body: data },
    ),

  confirmRegistration: (data: { email: string; code: string }) =>
    apiRequest<{ tokens: TokenPair }>("/auth/register/confirm", { method: "POST", body: data }),

  resendVerification: (email: string) =>
    apiRequest<void>("/auth/register/resend", { method: "POST", body: { email } }),

  login: (data: { login: string; password: string }) =>
    apiRequest<{ tokens: TokenPair }>("/auth/login", { method: "POST", body: data }),

  refresh: (refreshToken = "") =>
    apiRequest<{ tokens: TokenPair }>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
      _skipRefresh: true,
    }),

  logout: (token: string, refreshToken = "") =>
    apiRequest<void>("/auth/logout", {
      method: "POST",
      body: { refresh_token: refreshToken },
      token,
      _skipRefresh: true,
    }),

  me: (token: string) => apiRequest<UserMeResponse>("/users/me", { token }),

  forgotPassword: (email: string) =>
    apiRequest<void>("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (data: { email: string; code: string; new_password: string }) =>
    apiRequest<void>("/auth/reset-password", { method: "POST", body: data }),

  // Swagger: GET /auth/google → "string" (redirect URL to'g'ridan)
  // Runtime'da backend ba'zan { url: string } shaklida JSON qaytarishi
  // kuzatildi (shu sabab frontendda "/[object Object]"ga redirect bo'lgan).
  // apiRequest<unknown> bilan olib, ikkala shaklni ham qo'llab-quvvatlaymiz.
  getGoogleUrl: async () => {
    const response = await apiRequest<unknown>("/auth/google")
    console.log("[getGoogleUrl] raw response:", response) // DEBUG — tekshirgach o'chiring
    return extractUrlString(response, "Google orqali kirish")
  },

  googleCallback: (code: string, state: string) =>
    apiRequest<{ tokens: TokenPair }>(
      `/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
    ),

  telegramLogin: (data: TelegramAuthData) =>
    apiRequest<{ tokens: TokenPair }>("/auth/telegram/widget", { method: "POST", body: data }),

  telegramBotStart: () =>
    apiRequest<TelegramBotStartResponse>("/auth/telegram/bot/start", { method: "POST" }),

  telegramBotConfirm: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/auth/telegram/bot/confirm", { method: "POST", body: data }),

  telegramBotCallback: (token: string) =>
    apiRequest<{ tokens: TokenPair }>(
      `/auth/telegram/bot/callback?token=${encodeURIComponent(token)}`,
    ),

  // Swagger: GET /auth/link/google → "string" (redirect URL) — xuddi
  // getGoogleUrl kabi, backend ba'zan { url } shaklida qaytarishi mumkin.
  linkGoogleStart: async (token: string) => {
    const response = await apiRequest<unknown>("/auth/link/google", { token })
    return extractUrlString(response, "Google hisobni bog'lash")
  },

  linkGoogleCallback: (token: string, code: string, state: string) =>
    apiRequest<unknown>(
      `/auth/link/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
      { token },
    ),

  linkTelegram: (token: string, data: TelegramAuthData) =>
    apiRequest<unknown>("/auth/link/telegram", { method: "POST", body: data, token }),

  unlinkProvider: (token: string, provider: "google" | "telegram") =>
    apiRequest<void>(`/auth/link/${provider}`, { method: "DELETE", token }),

  getSessions: (token: string) => apiRequest<SessionOut[]>("/auth/sessions", { token }),

  deleteOtherSessions: (token: string) =>
    apiRequest<void>("/auth/sessions/others", { method: "DELETE", token }),

  deleteSession: (token: string, sessionId: string) =>
    apiRequest<void>(`/auth/sessions/${sessionId}`, { method: "DELETE", token }),
}

export const getSessionsSafe = createSafeItemWrapper(
  (token: string) => authApi.getSessions(token),
  { errorPrefix: "AUTH_SESSIONS" },
)

export const meSafe = createSafeItemWrapper(
  (token: string) => authApi.me(token),
  { errorPrefix: "AUTH_ME" },
)