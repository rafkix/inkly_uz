/**
 * posts.ts — /api/v1/posts/* va /api/v1/posts/me/* endpointlari
 *
 * Endpoint xaritasi (Swagger docs ga mos):
 *
 * AUTHOR (authenticated):
 *   GET    /posts/me                        → Page<PostListItem>
 *   GET    /posts/me/:uuid                  → PostResponse
 *   PATCH  /posts/me/:uuid                  → PostResponse
 *   DELETE /posts/me/:uuid                  → void
 *   POST   /posts/me/:uuid/publish          → PostResponse
 *   POST   /posts/me/:uuid/unpublish        → PostResponse
 *   POST   /posts/me/:uuid/archive          → PostResponse
 *   POST   /posts/me/:uuid/unarchive        → PostResponse
 *   POST   /posts                           → PostResponse (create)
 *
 * PUBLIC:
 *   GET    /posts                           → Page<PostListItem>
 *   GET    /posts/:slug                     → PostResponse
 *   GET    /posts/:slug/stats               → PostStatsResponse
 *   POST   /posts/:slug/like                → PostReactionResponse
 *   POST   /posts/:slug/dislike             → PostReactionResponse
 *   DELETE /posts/:slug/reaction            → PostReactionResponse
 *   POST   /posts/:slug/comments            → CommentResponse
 *   GET    /posts/:slug/comments            → Page<CommentResponse>
 *   DELETE /posts/:slug/comments/:uuid      → void
 */

import { apiRequest } from "./client"
import { createSafePageWrapper, createSafeItemWrapper } from "./safe-wrapper"
import type {
  CommentResponse,
  Page,
  PostListItem,
  PostReactionResponse,
  PostResponse,
  PostStatsResponse,
  PostVisibility,
} from "@/types/api"

// ─── Query builders ───────────────────────────────────────────────────────────

export interface ListPostsParams {
  page?: number
  page_size?: number
  author?: string
  category?: string
  search?: string
}

function buildListQuery(params: ListPostsParams): string {
  const q = new URLSearchParams()
  if (params.page !== undefined)      q.set("page",      String(params.page))
  if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
  if (params.author)                  q.set("author",    params.author)
  if (params.category)                q.set("category",  params.category)
  if (params.search)                  q.set("search",    params.search)
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

// ─── Request body types ───────────────────────────────────────────────────────

/**
 * POST /posts  va  PATCH /posts/me/:uuid uchun body.
 * Swagger da barcha maydonlar optional (PATCH semantics).
 */
export type CreatePostData = {
  title: string
  content?: string
  excerpt?: string | null
  cover?: string | null
  slug?: string | null
  visibility?: PostVisibility
  categories?: string[] | null
  scheduled_at?: string | null
  seo_indexable?: boolean
  is_pinned?: boolean
  allow_comments?: boolean
  allow_reactions?: boolean
  allow_reposts?: boolean
}

export type UpdatePostData = Partial<CreatePostData>

/**
 * POST /posts/me/:uuid/publish uchun body.
 * Swagger: barcha maydonlar optional — omitilganlar joriy qiymatini saqlaydi.
 */
export type PublishSettings = {
  visibility?: PostVisibility | null
  scheduled_at?: string | null
  seo_indexable?: boolean | null
  is_pinned?: boolean | null
  allow_comments?: boolean | null
  allow_reactions?: boolean | null
  allow_reposts?: boolean | null
  excerpt?: string | null
  cover?: string | null
  categories?: string[] | null
}

// ─── API object ───────────────────────────────────────────────────────────────

export const postsApi = {

  // ── Public ──────────────────────────────────────────────────────────────────

  /** GET /posts — ommaviy post ro'yxati */
  list: (params: ListPostsParams = {}) =>
    apiRequest<Page<PostListItem>>(`/posts${buildListQuery(params)}`),

  /** GET /posts/:slug — bitta post (token bo'lsa reacted field to'ldiriladi) */
  get: (slug: string, token?: string) =>
    apiRequest<PostResponse>(`/posts/${encodeURIComponent(slug)}`, { token }),

  /** GET /posts/:slug/stats */
  getStats: (slug: string, token?: string) =>
    apiRequest<PostStatsResponse>(`/posts/${encodeURIComponent(slug)}/stats`, { token }),

  /** POST /posts/:slug/like */
  like: (slug: string, token: string) =>
    apiRequest<PostReactionResponse>(
      `/posts/${encodeURIComponent(slug)}/like`,
      { method: "POST", token },
    ),

  /** POST /posts/:slug/dislike */
  dislike: (slug: string, token: string) =>
    apiRequest<PostReactionResponse>(
      `/posts/${encodeURIComponent(slug)}/dislike`,
      { method: "POST", token },
    ),

  /** DELETE /posts/:slug/reaction */
  removeReaction: (slug: string, token: string) =>
    apiRequest<PostReactionResponse>(
      `/posts/${encodeURIComponent(slug)}/reaction`,
      { method: "DELETE", token },
    ),

  /** GET /posts/:slug/comments */
  getComments: (slug: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<CommentResponse>>(
      `/posts/${encodeURIComponent(slug)}/comments${buildPageQuery(params)}`,
    ),

  /** POST /posts/:slug/comments */
  addComment: (slug: string, content: string, token: string) =>
    apiRequest<CommentResponse>(
      `/posts/${encodeURIComponent(slug)}/comments`,
      { method: "POST", body: { content }, token },
    ),

  /** DELETE /posts/:slug/comments/:commentUuid */
  deleteComment: (slug: string, commentUuid: string, token: string) =>
    apiRequest<void>(
      `/posts/${encodeURIComponent(slug)}/comments/${encodeURIComponent(commentUuid)}`,
      { method: "DELETE", token },
    ),

  // ── Author (authenticated) ───────────────────────────────────────────────────

  /** GET /posts/me */
  myList: (token: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<PostListItem>>(
      `/posts/me${buildPageQuery(params)}`,
      { token },
    ),

  /** GET /posts/me/:uuid */
  myGet: (token: string, uuid: string) =>
    apiRequest<PostResponse>(
      `/posts/me/${encodeURIComponent(uuid)}`,
      { token },
    ),

  /** POST /posts — yangi post yaratish */
  create: (token: string, data: CreatePostData) =>
    apiRequest<PostResponse>("/posts", { method: "POST", body: data, token }),

  /** PATCH /posts/me/:uuid — mavjud postni yangilash */
  update: (token: string, uuid: string, data: UpdatePostData) =>
    apiRequest<PostResponse>(
      `/posts/me/${encodeURIComponent(uuid)}`,
      { method: "PATCH", body: data, token },
    ),

  /** DELETE /posts/me/:uuid */
  delete: (token: string, uuid: string) =>
    apiRequest<void>(
      `/posts/me/${encodeURIComponent(uuid)}`,
      { method: "DELETE", token },
    ),

  /**
   * POST /posts/me/:uuid/publish
   * settings — faqat PublishSettings fieldlari (title/content EMAS).
   * Omit qilingan maydonlar joriy qiymatini saqlaydi.
   */
  publish: (token: string, uuid: string, settings?: PublishSettings) =>
    apiRequest<PostResponse>(
      `/posts/me/${encodeURIComponent(uuid)}/publish`,
      { method: "POST", body: settings ?? {}, token },
    ),

  /**
   * POST /posts/me/:uuid/unpublish
   * Nashr bekor qilinadi, post draft holatiga qaytadi.
   */
  unpublish: (token: string, uuid: string) =>
    apiRequest<PostResponse>(
      `/posts/me/${encodeURIComponent(uuid)}/unpublish`,
      { method: "POST", token },
    ),

  /**
   * POST /posts/me/:uuid/archive
   * Post ommaviy lentadan yashiriladi, lekin o'chirilmaydi.
   */
  archive: (token: string, uuid: string) =>
    apiRequest<PostResponse>(
      `/posts/me/${encodeURIComponent(uuid)}/archive`,
      { method: "POST", token },
    ),

  /**
   * POST /posts/me/:uuid/unarchive
   * Arxivdan chiqariladi — draft holatiga qaytadi.
   */
  unarchive: (token: string, uuid: string) =>
    apiRequest<PostResponse>(
      `/posts/me/${encodeURIComponent(uuid)}/unarchive`,
      { method: "POST", token },
    ),
}

// ─── Safe wrappers (server components uchun) ─────────────────────────────────

export const listPostsSafe = createSafePageWrapper(
  (params: ListPostsParams = {}) => postsApi.list(params),
  20,
  { errorPrefix: "POSTS_LIST" },
)

export const getPostSafe = createSafeItemWrapper(
  (slug: string, token?: string) => postsApi.get(slug, token),
  { errorPrefix: "POST_GET" },
)

export const getCommentsSafe = createSafePageWrapper(
  (slug: string, params: { page?: number; page_size?: number } = {}) =>
    postsApi.getComments(slug, params),
  20,
  { errorPrefix: "COMMENTS_LIST" },
)

export const getPostStatsSafe = createSafeItemWrapper(
  (slug: string, token?: string) => postsApi.getStats(slug, token),
  { errorPrefix: "POST_STATS" },
)

export const myListPostsSafe = createSafePageWrapper(
  (token: string, params: { page?: number; page_size?: number } = {}) =>
    postsApi.myList(token, params),
  20,
  { errorPrefix: "MY_POSTS_LIST" },
)

export const myGetPostSafe = createSafeItemWrapper(
  (token: string, uuid: string) => postsApi.myGet(token, uuid),
  { errorPrefix: "MY_POST_GET" },
)