export const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "")
const TOKEN_KEY = "inkly_token"

function getTokenStorage(): Storage | null {
  if (typeof window === "undefined") return null
  return sessionStorage
}

export function getStoredAccessToken(): string | null {
  return getTokenStorage()?.getItem(TOKEN_KEY) ?? null
}

export function setStoredAccessToken(token: string): void {
  getTokenStorage()?.setItem(TOKEN_KEY, token)
}

export function clearStoredAccessToken(): void {
  getTokenStorage()?.removeItem(TOKEN_KEY)
}

/**
 * Backend upload/user/post fields store relative media paths. Upload responses
 * also expose `url`, but that URL must not be persisted as the entity field.
 *
 * Backend already converts relative paths to full CDN URLs via build_media_url().
 * This function handles both cases:
 *   - relative path: "avatars/abc.webp" → MEDIA_CDN_URL + "/avatars/abc.webp"
 *   - full URL (from backend): returned as-is
 */
const MEDIA_CDN_URL = (
  process.env.NEXT_PUBLIC_MEDIA_CDN_URL ??
  // Fallback: derive from API URL — strip /api/v1, add /uploads
  (() => {
    try {
      const u = new URL(BASE_URL)
      return `${u.origin}/uploads`
    } catch {
      return "http://localhost:8000/uploads"
    }
  })()
).replace(/\/+$/, "")

export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  // Already a full URL (backend returns CDN URLs directly)
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path
  }
  // Relative path → prepend media CDN base
  const rel = path.replace(/^\/+/, "")
  return `${MEDIA_CDN_URL}/${rel}`
}

export class ApiRequestError extends Error {
  code: string
  details: Record<string, unknown> | null
  status: number | null

  constructor(
    code: string,
    message: string,
    details: Record<string, unknown> | null = null,
    status: number | null = null,
  ) {
    super(message)
    this.name = "ApiRequestError"
    this.code = code
    this.details = details
    this.status = status
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  token?: string
  headers?: Record<string, string>
  revalidate?: number
  _retry?: boolean
  _skipRefresh?: boolean
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      // refresh_token httpOnly cookie orqali backend tomonidan boshqariladi.
      // Body bo'sh ob'ekt — cookie avtomatik yuboriladi (credentials: "include").
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      })

      const json = await response.json().catch(() => null)
      if (!response.ok) return null

      const payload =
        json && typeof json === "object" && "data" in json
          ? (json as { data?: unknown }).data
          : json

      const tokens =
        payload && typeof payload === "object" && "tokens" in payload
          ? (payload as { tokens?: { access_token?: unknown } }).tokens
          : null

      const accessToken =
        tokens && typeof tokens.access_token === "string" ? tokens.access_token : null

      if (accessToken) setStoredAccessToken(accessToken)
      return accessToken
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function extractError(response: unknown, status: number): {
  code: string
  message: string
  details: Record<string, unknown> | null
} {
  if (response && typeof response === "object") {
    const value = response as Record<string, unknown>

    if (value.error && typeof value.error === "object") {
      const error = value.error as Record<string, unknown>
      return {
        code: typeof error.code === "string" ? error.code : `HTTP_${status}`,
        message: typeof error.message === "string" ? error.message : "So'rov bajarilmadi",
        details: (error.details as Record<string, unknown> | null | undefined) ?? null,
      }
    }

    if ("detail" in value) {
      const detail = value.detail
      if (typeof detail === "string") {
        return { code: status === 422 ? "VALIDATION_ERROR" : `HTTP_${status}`, message: detail, details: null }
      }
      if (Array.isArray(detail)) {
        const first = detail[0]
        const message =
          first && typeof first === "object" && typeof (first as Record<string, unknown>).msg === "string"
            ? String((first as Record<string, unknown>).msg)
            : "So'rov ma'lumotlari noto'g'ri"
        return {
          code: status === 422 ? "VALIDATION_ERROR" : `HTTP_${status}`,
          message,
          details: { detail },
        }
      }
    }
  }

  const messages: Record<number, string> = {
    400: "So'rov noto'g'ri.",
    401: "Sessiya muddati tugagan.",
    403: "Bu amalni bajarishga ruxsat yo'q.",
    404: "Ma'lumot topilmadi.",
    409: "Bu ma'lumot allaqachon mavjud.",
    422: "Kiritilgan ma'lumotlar noto'g'ri.",
    429: "Juda ko'p so'rov yuborildi. Birozdan keyin urinib ko'ring.",
    500: "Serverda xatolik yuz berdi.",
  }

  return {
    code: status === 401 ? "UNAUTHORIZED" : `HTTP_${status}`,
    message: messages[status] ?? "So'rov bajarilmadi.",
    details: null,
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers = {}, revalidate, _retry = false, _skipRefresh = false } = options
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData

  const reqHeaders: Record<string, string> = { ...headers }
  if (!isFormData && body !== undefined) reqHeaders["Content-Type"] = "application/json"
  if (token) reqHeaders.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: reqHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
      credentials: "include",
      ...(typeof revalidate === "number" ? { next: { revalidate } } : {}),
    })
  } catch {
    throw new ApiRequestError("NETWORK_ERROR", "Serverga ulanib bo'lmadi")
  }

  const json = await res.json().catch(() => null)

  if (res.status === 401 && !_retry && !_skipRefresh && !path.startsWith("/auth/refresh")) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return apiRequest<T>(path, {
        ...options,
        token: refreshed,
        _retry: true,
      })
    }

    clearStoredAccessToken()
  }

  if (!res.ok) {
    const error = extractError(json, res.status)
    throw new ApiRequestError(error.code, error.message, error.details, res.status)
  }

  const { validateApiResponse } = await import("./schemas")
  const validated = validateApiResponse<T>(json)

  if (!validated.success) {
    throw new ApiRequestError(
      validated.code ?? "UNKNOWN_ERROR",
      validated.message ?? "Noma'lum xatolik yuz berdi",
      validated.details ?? null,
      res.status,
    )
  }

  return normalizePageShape(validated.data) as T
}

/**
 * Backend'ning haqiqiy pagination javobi (API_TOLIQ_MALUMOTNOMA.md — Pydantic
 * schema'lardan avtomatik generatsiya qilingan, eng ishonchli manba) faqat
 * `items, total, page, page_size` maydonlarini qaytaradi — `total_pages` YO'Q.
 * (API_HUJJATLAR.md'dagi eski qo'lda yozilgan misolda esa `limit`/`pages`
 * ko'rsatilgan — bu ikkalasi ham frontend `Page<T>` turi bilan mos emas edi.)
 *
 * Frontend kodi (pagination komponentlar, "N ta sahifa" ko'rsatish va h.k.)
 * `page.total_pages`ga tayanadi, shuning uchun uni backend qaytarmasa ham
 * shu yerda, bitta markaziy joyda, `total`/`page_size` asosida hisoblab
 * to'ldiramiz — bu haqiqiy backend javobini "o'ylab topish" emas, faqat
 * arifmetik hosila (derived) qiymat.
 */
function normalizePageShape<T>(data: T): T {
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as Record<string, unknown>).items) &&
    typeof (data as Record<string, unknown>).total === "number" &&
    typeof (data as Record<string, unknown>).page_size === "number" &&
    (data as Record<string, unknown>).total_pages === undefined
  ) {
    const obj = data as Record<string, unknown>
    const total = obj.total as number
    const pageSize = obj.page_size as number
    return {
      ...obj,
      total_pages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
    } as T
  }
  return data
}

export async function uploadFile<T>(path: string, file: File, fieldName: string, token: string): Promise<T> {
  const form = new FormData()
  form.append(fieldName, file)
  return apiRequest<T>(path, { method: "POST", body: form, token })
}
