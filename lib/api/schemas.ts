import { z } from "zod/v4"

// ─── Base response schemas ────────────────────────────────────────────────────

const baseSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.unknown(),
})

const baseErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})

// Union of success and error
const apiResponseSchema = z.union([baseSuccessSchema, baseErrorSchema])

// ─── Type-safe response validation ────────────────────────────────────────────

/**
 * Validates API response and returns typed result
 * On success: { success: true, data, message, code: undefined, details: undefined }
 * On error: { success: false, code, message, details, data: undefined }
 *
 * Accepts:
 * - the standard envelope { success: true, message: string, data: T }
 * - the standard error envelope { success: false, error: { code, message, details } }
 * - FastAPI validation errors { detail: "..." | [{ msg, loc, type }] }
 * - a direct data response where the response IS the data (backwards compat)
 */
export function validateApiResponse<T>(response: unknown): {
  success: boolean
  data?: T
  message?: string
  code?: string
  details?: Record<string, unknown>
} {
  // First try the wrapped format
  const wrappedResult = apiResponseSchema.safeParse(response)

  if (wrappedResult.success) {
    const payload = wrappedResult.data

    if (payload.success) {
      return {
        success: true,
        data: payload.data as T,
        message: payload.message,
      }
    }

    return {
      success: false,
      code: payload.error.code,
      message: payload.error.message,
      details: payload.error.details,
    }
  }

  // If wrapped format fails, check if it's a direct (flat) error object
  const isErrorResponse =
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as Record<string, unknown>).success === false &&
    'code' in response &&
    'message' in response

  if (isErrorResponse) {
    // It's an error response but didn't match the schema exactly
    const err = response as Record<string, unknown>
    return {
      success: false,
      code: String(err.code ?? "UNKNOWN_ERROR"),
      message: String(err.message ?? "Noma'lum xatolik yuz berdi"),
      details: err.details as Record<string, unknown> | undefined,
    }
  }

  // FastAPI default error body: 422 { detail: [...] } / 4xx { detail: "..." }
  if (
    typeof response === "object" &&
    response !== null &&
    "detail" in response
  ) {
    const detail = (response as Record<string, unknown>).detail
    let message = "So'rov ma'lumotlari noto'g'ri"
    if (typeof detail === "string") {
      message = detail
    } else if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as Record<string, unknown> | undefined
      message = typeof first?.msg === "string" ? first.msg : message
    }
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message,
      details: { detail },
    }
  }

  // Assume it's direct data response (success case without wrapper)
  return {
    success: true,
    data: response as T,
    message: "OK",
  }
}

// ─── Specific endpoint schemas for stricter validation ────────────────────────

// Auth schemas
export const tokenPairSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal("bearer"),
  expires_in: z.number().int().positive(),
})

export const authTokensResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    tokens: tokenPairSchema,
  }),
})

export const userMeResponseSchema = z.object({
  // id intentionally removed — backend no longer returns internal DB PK
  uuid: z.uuid(),
  email: z.email().nullable(),
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "blocked"]),
  full_name: z.string(),
  username: z.string(),
  slug: z.string(),
  bio: z.string().nullable(),
  avatar: z.string().nullable(),
  cover: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  socials: z.object({
    telegram: z.string().nullable(),
    instagram: z.string().nullable(),
    youtube: z.string().nullable(),
    github: z.string().nullable(),
    twitter: z.string().nullable(),
  }),
  is_verified: z.boolean(),
  posts_count: z.number().int().nonnegative(),
  followers_count: z.number().int().nonnegative().default(0),
  following_count: z.number().int().nonnegative().default(0),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  linked_providers: z.array(z.object({
    provider: z.enum(["google", "telegram"]),
    provider_email: z.string().nullable(),
    connected_at: z.iso.datetime(),
  })),
})

export const sessionOutSchema = z.object({
  id: z.string().uuid(),
  device_name: z.string().nullable(),
  ip_address: z.string().nullable(),
  auth_method: z.string().nullable(),
  created_at: z.string().datetime(),
  last_seen_at: z.string().datetime().nullable(),
  expires_at: z.string().datetime(),
  is_active: z.boolean(),
  is_current: z.boolean(),
})

// Post schemas
export const postAuthorSchema = z.object({
  username: z.string(),
  slug: z.string(),
  full_name: z.string(),
  avatar: z.string().nullable(),
  is_verified: z.boolean(),
})

export const postCategorySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable(),
})

export const postListItemSchema = z.object({
  reading_time: z.number().int().nonnegative().optional(),
  uuid: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  cover: z.string().nullable(),
  status: z.enum(["draft", "published", "archived"]),
  visibility: z.enum(["public", "hidden", "private"]),
  published_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  author: postAuthorSchema,
  likes_count: z.number().int().nonnegative(),
  dislikes_count: z.number().int().nonnegative(),
  comments_count: z.number().int().nonnegative(),
  views_count: z.number().int().nonnegative(),
  categories: z.array(postCategorySchema),
  is_pinned: z.boolean(),
  allow_comments: z.boolean(),
  allow_reactions: z.boolean(),
  scheduled_at: z.string().datetime().nullable(),
})

export const pageSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    total_pages: z.number().int().nonnegative(),
  })

// Category schemas
export const categoryPublicResponseSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  posts_count: z.number().int().nonnegative(),
})

// User schemas
export const userPublicResponseSchema = z.object({
  full_name: z.string(),
  username: z.string(),
  slug: z.string(),
  bio: z.string().nullable(),
  avatar: z.string().nullable(),
  cover: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  socials: z.object({
    telegram: z.string().nullable(),
    instagram: z.string().nullable(),
    youtube: z.string().nullable(),
    github: z.string().nullable(),
    twitter: z.string().nullable(),
  }),
  is_verified: z.boolean(),
  posts_count: z.number().int().nonnegative().optional(),
  created_at: z.string().datetime().optional(),
})

// Upload schemas
// API backend faqat path string qaytaradi (Swagger: "string").
// uploads.ts ichida bu string UploadResult ga wrap qilinadi.
// Bu schema import qilinmaydi — faqat reference uchun qoldirildi.
export const uploadRawSchema = z.string().min(1) // backend response
export const uploadResultSchema = z.object({
  path: z.string().min(1),
  url: z.string().min(1),
})
/** @deprecated uploadResultSchema ishlatilsin */
export const uploadResponseSchema = uploadResultSchema

// ─── Validation helpers for specific endpoints ────────────────────────────────

export function validateAuthTokensResponse(response: unknown) {
  return authTokensResponseSchema.safeParse(response)
}

export function validateUserMeResponse(response: unknown) {
  return userMeResponseSchema.safeParse(response)
}

export function validateSessionsResponse(response: unknown) {
  return z.array(sessionOutSchema).safeParse(response)
}

export function validatePostListResponse(response: unknown) {
  return pageSchema(postListItemSchema).safeParse(response)
}

export function validatePostResponse(response: unknown) {
  return postListItemSchema.extend({
    content: z.string(),
    reacted: z.enum(["like", "dislike"]).nullable(),
    allow_reposts: z.boolean(),
    seo_indexable: z.boolean(),
    sharing_image: z.object({
      id: z.string(),
      format: z.string(),
      size: z.number().int().positive(),
      type: z.string(),
      url: z.string().url(),
    }).nullable(),
  }).safeParse(response)
}

export function validateCategoriesResponse(response: unknown) {
  return pageSchema(categoryPublicResponseSchema).safeParse(response)
}

export function validateCategoryResponse(response: unknown) {
  return categoryPublicResponseSchema.safeParse(response)
}

export function validateUserPublicResponse(response: unknown) {
  return userPublicResponseSchema.safeParse(response)
}

export function validateUploadResponse(response: unknown) {
  return uploadResponseSchema.safeParse(response)
}