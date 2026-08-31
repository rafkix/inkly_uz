import { apiRequest } from "./client"
import { createSafeItemWrapper, createSafePageWrapper } from "./safe-wrapper"
import type { Page, PostListItem, PostResponse, UserMeResponse, UserRole, UserStatus, PostStatus } from "@/types/api"
import type { UpdatePostData } from "./posts"

export interface AdminUserUpdateData {
  role?: UserRole | null
  status?: UserStatus | null
}

export interface AdminUserListParams {
  page?: number
  page_size?: number
  search?: string
  status?: UserStatus
  role?: UserRole
}

function query(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) q.set(key, String(value))
  }
  const result = q.toString()
  return result ? `?${result}` : ""
}

export const adminApi = {
  listUsers: (token: string, params: AdminUserListParams = {}) =>
    apiRequest<Page<UserMeResponse>>(`/admin/users${query(params as Record<string, string | number | undefined>)}`, { token }),

  getUser: (token: string, userUuid: string) =>
    apiRequest<UserMeResponse>(`/admin/users/${encodeURIComponent(userUuid)}`, { token }),

  updateUser: (token: string, userUuid: string, data: AdminUserUpdateData) =>
    apiRequest<UserMeResponse>(`/admin/users/${encodeURIComponent(userUuid)}`, {
      method: "PATCH",
      body: data,
      token,
    }),

  listPosts: (token: string, params: { page?: number; page_size?: number; search?: string; status?: PostStatus } = {}) =>
    apiRequest<Page<PostListItem>>(`/admin/posts${query(params)}`, { token }),

  getPost: (token: string, postUuid: string) =>
    apiRequest<PostResponse>(`/admin/posts/${encodeURIComponent(postUuid)}`, { token }),

  updatePost: (token: string, postUuid: string, data: UpdatePostData) =>
    apiRequest<PostResponse>(`/admin/posts/${encodeURIComponent(postUuid)}`, {
      method: "PATCH",
      body: data,
      token,
    }),

  deletePost: (token: string, postUuid: string) =>
    apiRequest<void>(`/admin/posts/${encodeURIComponent(postUuid)}`, { method: "DELETE", token }),

  auditLogs: (token: string, params: { page?: number; page_size?: number; event?: string; user_uuid?: string } = {}) =>
    apiRequest<Page<unknown>>(`/admin/audit-logs${query(params)}`, { token }),
}

export const listAdminUsersSafe = createSafePageWrapper(
  (token: string, params: AdminUserListParams = {}) => adminApi.listUsers(token, params),
  20,
  { errorPrefix: "ADMIN_USERS" },
)

export const getAdminUserSafe = createSafeItemWrapper(
  (token: string, userUuid: string) => adminApi.getUser(token, userUuid),
  { errorPrefix: "ADMIN_USER" },
)
