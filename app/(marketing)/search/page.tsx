"use client"

/**
 * /search — navbardagi qidiruv (Search) tugmasi shu sahifaga olib boradi
 * (avval bu link 404 edi — bunday route umuman mavjud emas edi).
 *
 * Backendda haqiqiy qidiruv: GET /public/posts?search=... (title/excerpt/content
 * bo'yicha full-text). Shu mavjud endpointdan foydalanamiz — yangi/fake API
 * o'ylab topilmagan.
 *
 * Controlled input + debounce (300ms) + URL sync (?q=) + loading/empty/error.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search as SearchIcon, X } from "lucide-react"

import { PostCard } from "@/components/ui/post-card"
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/route-states"
import { publicPostsApi } from "@/lib/api/public"
import type { PostListItem } from "@/types/api"

const DEBOUNCE_MS = 300

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") ?? ""

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<PostListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(Boolean(initialQuery))

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  const runSearch = useCallback(async (term: string) => {
    const trimmed = term.trim()

    // URL bilan sinxron — qayta yuklanganda ham qidiruv saqlanib qoladi.
    const nextUrl = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search"
    router.replace(nextUrl, { scroll: false })

    if (!trimmed) {
      setResults([])
      setTotal(0)
      setSearched(false)
      setError(null)
      setLoading(false)
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const page = await publicPostsApi.list({ search: trimmed, page: 1, page_size: 20 })
      if (requestId !== requestIdRef.current) return // eskirgan javob — e'tiborsiz qoldiramiz
      setResults(page.items)
      setTotal(page.total)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(err instanceof Error ? err.message : "Qidiruvda xatolik yuz berdi")
      setResults([])
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [router])

  // Debounce: har bir tugma bosilganda emas, foydalanuvchi yozishni to'xtatgach so'raladi.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void runSearch(query)
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Sahifa birinchi ochilganda ?q= bo'lsa, debounce kutmasdan darhol qidiramiz.
  useEffect(() => {
    if (initialQuery) void runSearch(initialQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-screen bg-background pt-16 sm:pt-[76px]">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="font-display mb-5 text-xl font-bold text-foreground">Qidiruv</h1>

        <div className="relative mb-6">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Maqolalarni qidirish"
            aria-label="Maqolalarni qidirish"
            autoFocus
            className="w-full rounded-lg border border-border-default bg-bg-muted py-3 pl-10 pr-10 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Tozalash"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {!searched && !loading && (
          <p className="text-sm text-text-muted">Qidiruv uchun kalit so'z kiriting.</p>
        )}

        {loading && <LoadingState label="Qidirilmoqda..." />}

        {!loading && error && (
          <ErrorState description={error} onRetry={() => void runSearch(query)} />
        )}

        {!loading && !error && searched && results.length === 0 && (
          <EmptyState
            title="Hech narsa topilmadi"
            description={`"${query.trim()}" bo'yicha natija yo'q. Boshqa kalit so'z bilan urinib ko'ring.`}
          />
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <p className="mb-3 text-[13px] text-text-muted">
              <strong className="text-text-primary">{total}</strong> ta natija topildi
            </p>
            <div className="flex flex-col gap-4">
              {results.map((post) => (
                <PostCard key={post.uuid} post={post} variant="list" />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
