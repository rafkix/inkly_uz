/**
 * public.ts — /api/v1/public/* endpointlari (autentifikatsiya shart emas)
 *
 * Endpoint xaritasi (Swagger docs):
 *   GET /public/posts                          → Page<PostListItem>
 *   GET /public/posts/:author_slug/:post_slug  → PostResponse
 *   GET /public/posts/:slug                    → PostResponse
 *   GET /public/authors/:slug/posts            → Page<PostListItem>
 *   GET /public/authors/:slug                  → UserPublicResponse
 *
 * token ixtiyoriy — berilsa reacted/is_following kabi shaxsiy maydonlar to'ldiriladi.
 */

import { cache } from "react"
import { apiRequest } from "./client"
import { createSafeItemWrapper, createSafePageWrapper } from "./safe-wrapper"
import type { Page, PostListItem, PostResponse, UserPublicResponse } from "@/types/api"

// ─── Query builder ────────────────────────────────────────────────────────────

export interface PublicPostsParams {
  author?: string
  category?: string
  search?: string
  page?: number
  page_size?: number
}

function buildPublicPostsQuery(params: PublicPostsParams): string {
  const q = new URLSearchParams()
  if (params.author)                  q.set("author",    params.author)
  if (params.category)                q.set("category",  params.category)
  if (params.search)                  q.set("search",    params.search)
  if (params.page !== undefined)      q.set("page",      String(params.page))
  if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
  const qs = q.toString()
  return qs ? `?${qs}` : ""
}

function buildPageQuery(params: { page?: number; page_size?: number }): string {
  const q = new URLSearchParams()
  if (params.page !== undefined)      q.set("page",      String(params.page))
  if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
  const qs = q.toString()
  return qs ? `?${qs}` : ""
}

// ─── API object ───────────────────────────────────────────────────────────────

export const publicPostsApi = {

  /**
   * GET /public/posts
   * Nashr qilingan ommaviy postlar ro'yxati.
   * Filtrlash: author, category, search.
   */
  list: (params: PublicPostsParams = {}, token?: string) =>
    apiRequest<Page<PostListItem>>(
      `/public/posts${buildPublicPostsQuery(params)}`,
      { token },
    ),

  /**
   * GET /public/posts/:author_slug/:post_slug
   * Muallif va post slug kombinatsiyasi bilan aniq post.
   * Bu eng ishonchli variant — slug global unikal bo'lmasa ham ishlaydi.
   */
  getByAuthorAndSlug: (authorSlug: string, postSlug: string, token?: string) =>
    apiRequest<PostResponse>(
      `/public/posts/${encodeURIComponent(authorSlug)}/${encodeURIComponent(postSlug)}`,
      { token },
    ),

  /**
   * GET /public/posts/:slug
   * Global slug bo'yicha post (slug unikal bo'lishi kerak).
   */
  getBySlug: (slug: string, token?: string) =>
    apiRequest<PostResponse>(
      `/public/posts/${encodeURIComponent(slug)}`,
      { token },
    ),

  /**
   * GET /public/authors/:slug/posts
   * Muallifning barcha nashr qilingan postlari.
   */
  getAuthorPosts: (
    slug: string,
    params: { page?: number; page_size?: number } = {},
    token?: string,
  ) =>
    apiRequest<Page<PostListItem>>(
      `/public/authors/${encodeURIComponent(slug)}/posts${buildPageQuery(params)}`,
      { token },
    ),

  /**
   * GET /public/authors/:slug
   * Muallif profili (public).
   * token berilsa is_following maydoni to'ldiriladi.
   */
  getAuthor: (slug: string, token?: string) =>
    apiRequest<UserPublicResponse>(
      `/public/authors/${encodeURIComponent(slug)}`,
      { token },
    ),
}

// ─── Per-request memoization (React.cache) ────────────────────────────────────
// generateMetadata va ProfilePage bir xil slug uchun bitta request yuboradi.
// React.cache bir render pass ichida (server request) natijani share qiladi.

const _getAuthorCached = cache(
  (slug: string, token?: string) => publicPostsApi.getAuthor(slug, token)
)

const _getAuthorPostsCached = cache(
  (slug: string, pageSize: number, page: number, token?: string) =>
    publicPostsApi.getAuthorPosts(slug, { page, page_size: pageSize }, token)
)

const _getPostByAuthorAndSlugCached = cache(
  (authorSlug: string, postSlug: string, token?: string) =>
    publicPostsApi.getByAuthorAndSlug(authorSlug, postSlug, token)
)

const _getPostBySlugCached = cache(
  (slug: string, token?: string) => publicPostsApi.getBySlug(slug, token)
)

const _listPostsCached = cache(
  (key: string, token?: string) => {
    const params: PublicPostsParams = JSON.parse(key)
    return publicPostsApi.list(params, token)
  }
)

// ─── Safe wrappers (server components uchun — xato chiqsa null/bo'sh page qaytaradi) ──────

/** GET /public/posts — xato bo'lsa bo'sh sahifa qaytaradi */
export const listPublicPostsSafe = createSafePageWrapper(
  (params: PublicPostsParams = {}, token?: string) =>
    _listPostsCached(JSON.stringify(params), token),
  20,
  { errorPrefix: "PUBLIC_POSTS" },
)

/** GET /public/posts/:author_slug/:post_slug — xato bo'lsa null qaytaradi */
export const getPublicPostByAuthorSafe = createSafeItemWrapper(
  (authorSlug: string, postSlug: string, token?: string) =>
    _getPostByAuthorAndSlugCached(authorSlug, postSlug, token),
  { errorPrefix: "PUBLIC_POST_AUTHOR" },
)

/** GET /public/posts/:slug — xato bo'lsa null qaytaradi */
export const getPublicPostSafe = createSafeItemWrapper(
  (slug: string, token?: string) => _getPostBySlugCached(slug, token),
  { errorPrefix: "PUBLIC_POST" },
)

/**
 * GET /public/authors/:slug/posts — xato bo'lsa bo'sh sahifa qaytaradi.
 * USER_NOT_FOUND ignore qilinadi: muallif mavjud bo'lmasa ProfilePage
 * getPublicAuthorSafe orqali allaqachon notFound() chaqiradi — bu yerdagi
 * xato shunchaki shu sababning davomi, alohida log kerak emas.
 */
export const getPublicAuthorPostsSafe = createSafePageWrapper(
  (
    slug: string,
    params: { page?: number; page_size?: number } = {},
    token?: string,
  ) => _getAuthorPostsCached(slug, params.page_size ?? 20, params.page ?? 1, token),
  20,
  { errorPrefix: "PUBLIC_AUTHOR_POSTS", ignoreCodes: ["USER_NOT_FOUND"] },
)

/**
 * GET /public/authors/:slug — xato bo'lsa null qaytaradi.
 * USER_NOT_FOUND ignore qilinadi: bu kutilgan holat (masalan, user@handle
 * mavjud emas) — ProfilePage buni notFound() bilan to'g'ri ishlaydi,
 * shuning uchun konsolga stack trace chiqarish shart emas.
 */
export const getPublicAuthorSafe = createSafeItemWrapper(
  (slug: string, token?: string) => _getAuthorCached(slug, token),
  { errorPrefix: "PUBLIC_AUTHOR", ignoreCodes: ["USER_NOT_FOUND"] },
)