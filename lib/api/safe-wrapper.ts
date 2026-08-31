/**
 * safe-wrapper.ts — Server Component va Client Component ikkalasida
 * import qilinishi mumkin bo'lgan utility funksiyalar.
 *
 * MUHIM: Bu fayl "use client" directive OLMAYDI.
 * React hooks (useState, useEffect) bu yerda bo'lmasligi kerak.
 * useSafeApi hook → lib/api/use-safe-api.ts (client-only)
 */

import { ApiRequestError } from "./client"
import type { DependencyList } from "react"

// DependencyList faqat type sifatida import qilingan — runtime'da yo'q,
// shuning uchun Server Component da muammo keltirmaydi.
export type { DependencyList }

interface SafeOptions {
  /** Log errors in development (default: true) */
  logErrors?: boolean
  /** Custom fallback value (default: null or empty page) */
  fallback?: unknown
  /** Custom error message prefix */
  errorPrefix?: string
  /** Bu error code'lar bilan kelgan xatolarni log qilmaslik */
  ignoreCodes?: string[]
}

/**
 * Creates a safe version of an async function that catches errors
 * and returns a fallback value instead of throwing.
 */
export function createSafeWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  fallback: TResult | (() => TResult),
  options: SafeOptions = {}
) {
  const { logErrors = true, errorPrefix = "API", ignoreCodes = [] } = options

  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args)
    } catch (error) {
      const isIgnored =
        error instanceof ApiRequestError && ignoreCodes.includes(error.code)

      if (logErrors && !isIgnored && process.env.NODE_ENV !== "production") {
        const prefix = errorPrefix ? `[${errorPrefix}]` : ""
        console.error(`${prefix} ${fn.name || "anonymous"} error:`, error)
      }

      return typeof fallback === "function" ? (fallback as () => TResult)() : fallback
    }
  }
}

/**
 * Creates a safe wrapper for list endpoints that return paginated results.
 * Returns an empty page structure on error.
 */
export function createSafePageWrapper<TItem, TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<{ items: TItem[]; total: number; page: number; page_size: number; total_pages: number }>,
  defaultPageSize = 20,
  options: SafeOptions = {}
) {
  return createSafeWrapper(
    fn,
    () => ({
      items: [] as TItem[],
      total: 0,
      page: 1,
      page_size: defaultPageSize,
      total_pages: 0,
    }),
    options
  )
}

/**
 * Creates a safe wrapper for single item endpoints.
 * Returns null on error.
 */
export function createSafeItemWrapper<TItem, TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<TItem>,
  options: SafeOptions = {}
) {
  return createSafeWrapper(fn, null as TItem | null, options)
}

/**
 * Creates a safe wrapper for void-returning functions (mutations).
 */
export function createSafeVoidWrapper<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<void>,
  options: SafeOptions = {}
) {
  return createSafeWrapper(fn, undefined, options)
}

// ─── Convenience aliases ──────────────────────────────────────────────────────

export function safeList<TItem>(
  fn: () => Promise<{ items: TItem[]; total: number; page: number; page_size: number; total_pages: number }>,
  pageSize = 20
) {
  return createSafePageWrapper(fn, pageSize, { errorPrefix: "LIST" })
}

export function safeGet<TItem>(fn: () => Promise<TItem>) {
  return createSafeItemWrapper(fn, { errorPrefix: "GET" })
}

export function safeVoid(fn: () => Promise<void>) {
  return createSafeWrapper(fn, undefined, { errorPrefix: "MUTATION" })
}

// ─── Error utilities (server + client safe) ───────────────────────────────────

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.code === "SESSION_EXPIRED"
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.code === "NETWORK_ERROR"
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message
  if (error instanceof Error) return error.message
  return "Noma'lum xatolik yuz berdi"
}
