import { apiRequest } from "./client"
import { createSafeItemWrapper, createSafePageWrapper } from "./safe-wrapper"
import type { Page, PostListItem, UserMeResponse, UserPublicResponse } from "@/types/api"

function buildPageQuery(params: { page?: number; page_size?: number }) {
  const q = new URLSearchParams()
  if (params.page !== undefined) q.set("page", String(params.page))
  if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
  const query = q.toString()
  return query ? `?${query}` : ""
}

export type UserUpdateData = Partial<{
  full_name: string | null
  username: string | null
  slug: string | null
  bio: string | null
  avatar: string | null
  cover: string | null
  website: string | null
  location: string | null
  telegram_username: string | null
  instagram_username: string | null
  youtube_username: string | null
  github_username: string | null
  twitter_username: string | null
}>

export const usersApi = {
  getPublic: (slug: string) =>
    apiRequest<UserPublicResponse>(`/users/${encodeURIComponent(slug.replace(/^@/, ""))}`, { revalidate: 0 }),

  getMe: (token: string) => apiRequest<UserMeResponse>("/users/me", { token }),

  updateMe: (token: string, data: UserUpdateData) =>
    apiRequest<UserMeResponse>("/users/me", { method: "PATCH", body: data, token }),

  deleteMe: (token: string, data: { password?: string | null; confirmation?: string } = {}) =>
    apiRequest<void>("/users/me", { method: "DELETE", body: data, token }),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    apiRequest<void>("/users/me/password", {
      method: "POST",
      body: { current_password: currentPassword, new_password: newPassword },
      token,
    }),

  requestEmailChange: (token: string, newEmail: string) =>
    apiRequest<void>("/users/me/email", { method: "POST", body: { new_email: newEmail }, token }),

  verifyEmailChange: (token: string, code: string) =>
    apiRequest<void>("/users/me/email/verify", { method: "POST", body: { code }, token }),

  // Swagger: /users/check (primary), /users/check-username (alias) — ikkalasi ishlaydi
  checkUsername: (username: string) =>
    apiRequest<unknown>(`/users/check?username=${encodeURIComponent(username.replace(/^@/, ""))}`),

  getUserPosts: (slug: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<PostListItem>>(`/users/${encodeURIComponent(slug.replace(/^@/, ""))}/posts${buildPageQuery(params)}`),
}

export const getUserSafe = createSafeItemWrapper(
  (slug: string) => usersApi.getPublic(slug),
  { errorPrefix: "USER_GET" },
)

export const getMeSafe = createSafeItemWrapper(
  (token: string) => usersApi.getMe(token),
  { errorPrefix: "USER_ME" },
)

export const getUserPostsSafe = createSafePageWrapper(
  (slug: string, params: { page?: number; page_size?: number } = {}) => usersApi.getUserPosts(slug, params),
  20,
  { errorPrefix: "USER_POSTS" },
)

export const checkUsernameSafe = createSafeItemWrapper(
  (username: string) => usersApi.checkUsername(username),
  { errorPrefix: "USERNAME_CHECK" },
)