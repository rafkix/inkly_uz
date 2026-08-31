"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { postsApi } from "@/lib/api/posts"
import { useAuth } from "@/lib/auth/context"
import { timeAgo } from "@/lib/utils/format"
import type { CommentResponse } from "@/types/api"
import { LoadingDots } from "@/components/ui/loading-dots"

interface CommentSectionProps {
  postSlug: string
}

const PAGE_SIZE = 20

export function CommentSection({ postSlug }: CommentSectionProps) {
  const { state } = useAuth()
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* BUG 9 FIX: Pagination holati — avval hardcoded page_size: 20, "Ko'proq" yo'q edi */
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  /* Birinchi yuklanish */
  useEffect(() => {
    let active = true
    setLoading(true)
    postsApi.getComments(postSlug, { page: 1, page_size: PAGE_SIZE })
      .then((res) => {
        if (!active) return
        setComments(res.items)
        setTotalCount(res.total)
        setHasMore(res.page < res.total_pages)
        setPage(1)
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [postSlug])

  /* Ko'proq yuklash */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const res = await postsApi.getComments(postSlug, { page: nextPage, page_size: PAGE_SIZE })
      setComments((prev) => [...prev, ...res.items])
      setTotalCount(res.total)
      setHasMore(res.page < res.total_pages)
      setPage(nextPage)
    } catch {
      // silent
    } finally {
      setLoadingMore(false)
    }
  }, [postSlug, page, hasMore, loadingMore])

  const submit = async () => {
    const content = value.trim()
    if (!content) return
    if (!state.token) {
      setError("Izoh yozish uchun hisobingizga kiring")
      return
    }
    setSending(true)
    setError(null)
    try {
      const comment = await postsApi.addComment(postSlug, content, state.token)
      setComments((prev) => [comment, ...prev])
      setTotalCount((n) => n + 1)
      setValue("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Izohni yuborib bo'lmadi")
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (commentUuid: string) => {
    if (!state.token) return
    try {
      await postsApi.deleteComment(postSlug, commentUuid, state.token)
      setComments((prev) => prev.filter((c) => c.uuid !== commentUuid))
      setTotalCount((n) => Math.max(0, n - 1))
    } catch (err: unknown) {
      console.error("Comment delete error:", err)
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-6">
      <h2
        id="comments-heading"
        className="text-sm font-semibold uppercase tracking-widest text-text-muted"
      >
        Izohlar · {totalCount}
      </h2>

      {state.token ? (
        <div className="flex flex-col items-end gap-3">
          {error && <p className="w-full text-sm text-red-500">{error}</p>}
          <Textarea
            name="comment"
            rows={3}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Fikringizni yozing…"
            aria-label="Izoh matni"
          />
          <Button loading={sending} onClick={submit} disabled={!value.trim()}>
            Izoh qoldirish
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border-default bg-bg-muted px-5 py-4 text-sm text-text-secondary">
          Izoh yozish uchun{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline underline-offset-4 hover:text-inkly-hover"
          >
            hisobingizga kiring
          </Link>
          .
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingDots size="lg" className="text-primary" />
        </div>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border-default">
            {comments.length === 0 && (
              <li className="py-8 text-center text-sm text-text-muted">
                Hali izoh yo&apos;q
              </li>
            )}
            {comments.map((comment) => (
              <li key={comment.uuid} className="flex gap-3 py-5">
                <Avatar
                  src={comment.author.avatar}
                  name={comment.author.full_name}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/@${comment.author.username}`}
                      className="text-sm font-medium text-text-primary hover:text-primary"
                    >
                      {comment.author.full_name}
                    </Link>
                    <span className="text-xs text-text-muted">
                      {timeAgo(comment.created_at)}
                    </span>

                    {state.user?.username === comment.author.username && (
                      <button
                        onClick={() => handleDelete(comment.uuid)}
                        className="ml-auto text-xs text-text-muted hover:text-red-500 transition-colors"
                      >
                        O'chirish
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                    {comment.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* BUG 9 FIX: "Ko'proq yuklash" tugmasi — avval umuman yo'q edi */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-xl border border-border-default bg-white px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
              >
                {loadingMore ? (
                  <LoadingDots size="sm" />
                ) : (
                  <ChevronDown size={14} />
                )}
                Ko'proq izohlar
                {totalCount - comments.length > 0 && (
                  <span className="rounded-full bg-bg-muted px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                    {totalCount - comments.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}