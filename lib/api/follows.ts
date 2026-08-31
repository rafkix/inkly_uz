import { apiRequest } from "./client"
import { createSafeItemWrapper, createSafePageWrapper } from "./safe-wrapper"
import type { Page, UserPublicResponse } from "@/types/api"

function normalizeSlug(slug: string) {
  return slug.replace(/^@/, "")
}

function pageQuery(params: { page?: number; page_size?: number }) {
  const q = new URLSearchParams()
  if (params.page !== undefined) q.set("page", String(params.page))
  if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
  const query = q.toString()
  return query ? `?${query}` : ""
}

export interface FollowStatusResponse {
  is_following: boolean
  followers_count: number
}

export interface ProfileFollowStats {
  followers_count: number
  following_count: number
  is_following: boolean
}

export const followsApi = {
  follow: (token: string, slug: string) =>
    apiRequest<FollowStatusResponse>(`/users/${encodeURIComponent(normalizeSlug(slug))}/follow`, { method: "POST", token }),

  unfollow: (token: string, slug: string) =>
    apiRequest<FollowStatusResponse>(`/users/${encodeURIComponent(normalizeSlug(slug))}/follow`, { method: "DELETE", token }),

  followStats: (slug: string, token?: string) =>
    apiRequest<ProfileFollowStats>(`/users/${encodeURIComponent(normalizeSlug(slug))}/follow-stats`, { token }),

  followers: (slug: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<UserPublicResponse>>(`/users/${encodeURIComponent(normalizeSlug(slug))}/followers${pageQuery(params)}`),

  following: (slug: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<UserPublicResponse>>(`/users/${encodeURIComponent(normalizeSlug(slug))}/following${pageQuery(params)}`),
}

export const getFollowStatsSafe = createSafeItemWrapper(
  (slug: string) => followsApi.followStats(slug),
  { errorPrefix: "FOLLOW_STATS" },
)

export const getFollowersSafe = createSafePageWrapper(
  (slug: string, params: { page?: number; page_size?: number } = {}) => followsApi.followers(slug, params),
  20,
  { errorPrefix: "FOLLOWERS" },
)

export const getFollowingSafe = createSafePageWrapper(
  (slug: string, params: { page?: number; page_size?: number } = {}) => followsApi.following(slug, params),
  20,
  { errorPrefix: "FOLLOWING" },
)
