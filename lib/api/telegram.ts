import { apiRequest } from "./client"
import { createSafeItemWrapper, createSafePageWrapper } from "./safe-wrapper"
import type { Page } from "@/types/api"

export interface TelegramVerificationStartResponse {
  verification_id: string
  token: string
  expires_at: string
}

export interface TelegramAccountResponse {
  uuid: string
  telegram_user_id: string
  telegram_username: string | null
  first_name: string | null
  last_name: string | null
  photo_url: string | null
  is_verified: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface TelegramChannelResponse {
  uuid: string
  telegram_channel_id: string
  username: string | null
  title: string
  photo_url: string | null
  status: string
  is_active: boolean
  is_verified: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface TelegramPublicationResponse {
  uuid: string
  status: string
  created_at: string
  published_at: string | null
}

function pageQuery(params: { page?: number; page_size?: number }) {
  const q = new URLSearchParams()
  if (params.page !== undefined) q.set("page", String(params.page))
  if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
  const query = q.toString()
  return query ? `?${query}` : ""
}

export const telegramApi = {
  getAccount: (token: string) => apiRequest<TelegramAccountResponse>("/telegram/account", { token }),
  unlinkAccount: (token: string) => apiRequest<void>("/telegram/account", { method: "DELETE", token }),

  startVerification: (token: string) =>
    apiRequest<TelegramVerificationStartResponse>("/telegram/verification", { method: "POST", token }),

  botConfirmVerification: (token: string, data: Record<string, unknown>) =>
    apiRequest<unknown>("/telegram/verification/bot-confirm", { method: "POST", body: data, token }),

  verificationStatus: (token: string, verificationId?: string) =>
    apiRequest<{ status: "pending" | "verified" | "expired" | "failed" }>(
      `/telegram/verification/status${verificationId ? `?verification_id=${encodeURIComponent(verificationId)}` : ""}`,
      { token },
    ),

  completeVerification: (token: string, data: { verification_id: string; token: string }) =>
    apiRequest<TelegramAccountResponse>("/telegram/verification/complete", { method: "POST", body: data, token }),

  listChannels: (token: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<TelegramChannelResponse>>(`/telegram/channels${pageQuery(params)}`, { token }),

  addChannel: (token: string, channelUsername: string) =>
    apiRequest<TelegramChannelResponse>("/telegram/channels", {
      method: "POST",
      body: { channel_username: channelUsername },
      token,
    }),

  getChannel: (token: string, channelUuid: string) =>
    apiRequest<TelegramChannelResponse>(`/telegram/channels/${encodeURIComponent(channelUuid)}`, { token }),

  removeChannel: (token: string, channelUuid: string) =>
    apiRequest<void>(`/telegram/channels/${encodeURIComponent(channelUuid)}`, { method: "DELETE", token }),

  reverifyChannel: (token: string, channelUuid: string) =>
    apiRequest<unknown>(`/telegram/channels/${encodeURIComponent(channelUuid)}/reverify`, { method: "POST", token }),

  publishToChannel: (token: string, channelUuid: string, postUuid: string) =>
    apiRequest<unknown>(`/telegram/channels/${encodeURIComponent(channelUuid)}/posts/${encodeURIComponent(postUuid)}/publish`, {
      method: "POST",
      token,
    }),

  publications: (token: string, channelUuid: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<TelegramPublicationResponse>>(
      `/telegram/channels/${encodeURIComponent(channelUuid)}/publications${pageQuery(params)}`,
      { token },
    ),

  receiveWebhook: (body: unknown) => apiRequest<unknown>("/telegram/bot/webhook", { method: "POST", body }),
  removeWebhook: (token: string) => apiRequest<unknown>("/telegram/bot/webhook", { method: "DELETE", token }),
  setupWebhook: (token: string) => apiRequest<unknown>("/telegram/bot/webhook/setup", { method: "POST", token }),
  webhookStatus: (token: string) => apiRequest<unknown>("/telegram/bot/webhook/status", { token }),
}

export const getTelegramAccountSafe = createSafeItemWrapper(
  (token: string) => telegramApi.getAccount(token),
  { errorPrefix: "TELEGRAM_ACCOUNT" },
)

export const listTelegramChannelsSafe = createSafePageWrapper(
  (token: string, params: { page?: number; page_size?: number } = {}) => telegramApi.listChannels(token, params),
  20,
  { errorPrefix: "TELEGRAM_CHANNELS" },
)
