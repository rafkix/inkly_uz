import { apiRequest } from "./client"
import { createSafeItemWrapper, createSafePageWrapper } from "./safe-wrapper"
import type { Page } from "@/types/api"

/**
 * Mos keladi: backend/inkly/app/modules/notifications/schemas.py
 * (NotificationResponse, NotificationActorResponse, NotificationPostResponse,
 * NotificationCommentResponse, UnreadCountResponse, MarkAllReadResponse).
 * shared/enums.py::NotificationType — FOLLOW/LIKE/COMMENT/COMMENT_REPLY.
 */
export type NotificationType = "follow" | "like" | "comment" | "comment_reply"

export interface NotificationActor {
  uuid: string
  username: string
  slug: string
  full_name: string
  avatar: string | null
}

export interface NotificationPost {
  uuid: string
  title: string
  slug: string
}

export interface NotificationComment {
  uuid: string
  content: string
}

export interface NotificationItem {
  uuid: string
  type: NotificationType
  is_read: boolean
  read_at: string | null
  created_at: string
  actor: NotificationActor | null
  post: NotificationPost | null
  comment: NotificationComment | null
}

export interface UnreadCountResponse {
  count: number
}

export interface MarkAllReadResponse {
  updated: number
}

export const notificationsApi = {
  list: (token: string, params: { page?: number; page_size?: number } = {}) => {
    const q = new URLSearchParams()
    if (params.page !== undefined) q.set("page", String(params.page))
    if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
    const query = q.toString()
    return apiRequest<Page<NotificationItem>>(`/notifications${query ? `?${query}` : ""}`, { token })
  },

  unreadCount: (token: string) =>
    apiRequest<UnreadCountResponse>("/notifications/unread-count", { token }),

  markAllRead: (token: string) =>
    apiRequest<MarkAllReadResponse>("/notifications/read-all", { method: "POST", token }),

  markRead: (token: string, notificationUuid: string) =>
    apiRequest<NotificationItem>(`/notifications/${encodeURIComponent(notificationUuid)}/read`, {
      method: "POST",
      token,
    }),
}

export const listNotificationsSafe = createSafePageWrapper(
  (token: string, params: { page?: number; page_size?: number } = {}) => notificationsApi.list(token, params),
  20,
  { errorPrefix: "NOTIFICATIONS_LIST" },
)

export const unreadNotificationsCountSafe = createSafeItemWrapper(
  (token: string) => notificationsApi.unreadCount(token),
  { errorPrefix: "NOTIFICATIONS_UNREAD" },
)

/**
 * Client-side notification preference toggles. The backend does not yet
 * expose a preferences endpoint, so these are persisted to localStorage
 * only (see app/(app)/dashboard/settings/notifications/page.tsx). This is
 * a local UI-state shape, not a fabricated backend response contract.
 */
export interface NotificationPreferences {
  new_comment: boolean
  new_like: boolean
  new_follower: boolean
  featured: boolean
  weekly_digest: boolean
  product_news: boolean
  browser_enabled: boolean
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  new_comment: true,
  new_like: true,
  new_follower: true,
  featured: true,
  weekly_digest: false,
  product_news: false,
  browser_enabled: false,
}
