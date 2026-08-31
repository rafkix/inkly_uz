import { cache } from "react"
import { apiRequest } from "./client"
import { createSafePageWrapper, createSafeItemWrapper } from "./safe-wrapper"
import type { CategoryPublicResponse, Page, PostListItem } from "@/types/api"

export interface CategoryCreateData {
  name: string
  slug?: string | null
  description?: string | null
  icon?: string | null
}

export interface CategoryUpdateData {
  name?: string | null
  slug?: string | null
  description?: string | null
  icon?: string | null
  is_active?: boolean | null
}

function buildQuery(params: { page?: number; page_size?: number; search?: string }) {
  const q = new URLSearchParams()
  if (params.search !== undefined) q.set("search", params.search)
  if (params.page !== undefined) q.set("page", String(params.page))
  if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
  const query = q.toString()
  return query ? `?${query}` : ""
}

export const categoriesApi = {
  list: (params: { page?: number; page_size?: number; search?: string } = {}) =>
    apiRequest<Page<CategoryPublicResponse>>(`/categories${buildQuery(params)}`),

  adminList: (token: string) =>
    apiRequest<CategoryPublicResponse[]>("/categories/admin", { token }),

  create: (token: string, data: CategoryCreateData) =>
    apiRequest<CategoryPublicResponse>("/categories", { method: "POST", body: data, token }),

  get: (slug: string) =>
    apiRequest<CategoryPublicResponse>(`/categories/${encodeURIComponent(slug)}`),

  update: (token: string, uuid: string, data: CategoryUpdateData) =>
    apiRequest<CategoryPublicResponse>(`/categories/${encodeURIComponent(uuid)}`, {
      method: "PATCH",
      body: data,
      token,
    }),

  delete: (token: string, uuid: string) =>
    apiRequest<void>(`/categories/${encodeURIComponent(uuid)}`, { method: "DELETE", token }),

  getPosts: (slug: string, params: { page?: number; page_size?: number } = {}) => {
    const q = new URLSearchParams()
    if (params.page !== undefined) q.set("page", String(params.page))
    if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
    const query = q.toString()
    return apiRequest<Page<PostListItem>>(
      `/categories/${encodeURIComponent(slug)}/posts${query ? `?${query}` : ""}`
    )
  },
}

// ─── Per-request memoization ──────────────────────────────────────────────────
// generateMetadata va Page component bir xil slug uchun bitta request yuboradi.

const _getCategoryCached = cache(
  (slug: string) => categoriesApi.get(slug)
)

const _listCategoriesCached = cache(
  (key: string) => {
    const params = JSON.parse(key) as { page?: number; page_size?: number; search?: string }
    return categoriesApi.list(params)
  }
)

// ─── Safe wrappers ────────────────────────────────────────────────────────────

export const listCategoriesSafe = createSafePageWrapper(
  (params: { page?: number; page_size?: number; search?: string } = {}) =>
    _listCategoriesCached(JSON.stringify(params)),
  20,
  { errorPrefix: "CATEGORIES_LIST" },
)

export const getCategorySafe = createSafeItemWrapper(
  (slug: string) => _getCategoryCached(slug),
  { errorPrefix: "CATEGORY_GET" },
)

export const getCategoryPostsSafe = createSafePageWrapper(
  (slug: string, params: { page?: number; page_size?: number } = {}) =>
    categoriesApi.getPosts(slug, params),
  20,
  { errorPrefix: "CATEGORY_POSTS" },
)