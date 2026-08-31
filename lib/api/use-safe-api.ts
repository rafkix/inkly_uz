"use client"

/**
 * use-safe-api.ts — Client Component'larda ishlatish uchun React hook.
 *
 * MUHIM: Bu fayl "use client" directive BILAN — faqat Client Component'larda
 * import qilinsin. Server Component'lardan import qilma.
 *
 * @example
 * ```tsx
 * "use client"
 * import { useSafeApi } from "@/lib/api/use-safe-api"
 *
 * function UserProfile({ username }: { username: string }) {
 *   const { data, error, loading, refetch } = useSafeApi(
 *     () => usersApi.getPublic(username),
 *     [username]
 *   )
 *   if (loading) return <Skeleton />
 *   if (!data) return <NotFound />
 *   return <Profile user={data} />
 * }
 * ```
 */

import { useState, useEffect, useCallback } from "react"
import type { DependencyList } from "react"
import { ApiRequestError } from "./client"
import { getErrorMessage } from "./safe-wrapper"

export function useSafeApi<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList
): { data: T | null; error: ApiRequestError | null; loading: boolean; refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiRequestError | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err
          : new ApiRequestError("UNKNOWN", getErrorMessage(err))
      )
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, error, loading, refetch }
}
