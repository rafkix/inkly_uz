"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { VerifiedDot } from "@/components/ui/badge"
import { formatCount, formatDate, readingTimeFromPost } from "@/lib/utils/format"
import type { PostListItem } from "@/types/api"

interface PostCardProps {
  post: PostListItem
  variant?: "list" | "grid"
}

/* ── Signature: har bir kategoriya o'z rangdagi "spine" (nur chizig'i)
   bilan belgilanadi — muqova o'rnini bosuvchi yagona vizual ajratkich.
   Rang slug bo'yicha barqaror hisoblanadi, shu kategoriya doim bir xil
   rangda ko'rinadi. ───────────────────────────────────────────────── */
const SPINE_PALETTE = [
  "#D97757", // terracotta (brand)
  "#4C6E5D", // pine
  "#8B5CF6", // violet
  "#C4682B", // ochre
  "#2E6F8E", // teal-blue
  "#A6425A", // wine
]

function spineColor(slug?: string) {
  if (!slug) return SPINE_PALETTE[0]
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  return SPINE_PALETTE[hash % SPINE_PALETTE.length]
}

export function PostCard({ post, variant = "list" }: PostCardProps) {
  const url = `/@${post.author.username}/${post.slug}`
  const category = post.categories?.[0]
  const readTime = readingTimeFromPost(post.reading_time)
  const accent = useMemo(() => spineColor(category?.slug), [category?.slug])

  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkPending, setBookmarkPending] = useState(false)

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (bookmarkPending) return
    setBookmarkPending(true)
    try {
      // TODO: await bookmarksApi.toggle(post.slug, token)
      setBookmarked((v) => !v)
    } finally {
      setBookmarkPending(false)
    }
  }

  /* ====================================================================
     GRID variant
  ==================================================================== */
  if (variant === "grid") {
    return (
      <article
        className="group relative flex flex-col overflow-hidden rounded-card border border-border-default bg-white transition-all duration-200 hover:-translate-y-[2px] hover:border-[#DCD5CC] hover:shadow-[0_10px_28px_rgba(20,20,20,0.06)]"
        style={{ borderTopWidth: 3, borderTopColor: accent }}
      >
        <div className="flex flex-col p-4">
          <div className="flex items-center gap-2">
            {category && (
              <Link
                href={`/posts?category=${encodeURIComponent(category.slug)}`}
                className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors"
                style={{ color: accent }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                {category.name}
              </Link>
            )}
            {!post.published_at && (
              <span className="rounded-full bg-bg-muted px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-text-muted">
                Qoralama
              </span>
            )}
          </div>

          <h3 className="font-display mt-2 line-clamp-2 text-[19px] font-semibold leading-[1.25] tracking-[-0.015em] text-text-primary">
            <Link href={url} className="transition-colors group-hover:text-primary">
              {post.title}
            </Link>
          </h3>

          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-[12.5px] leading-[1.6] text-[#6C6A67]">
              {post.excerpt}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-default pt-3">
            <Link href={`/@${post.author.username}`} className="flex min-w-0 items-center gap-2">
              <Avatar src={post.author.avatar} name={post.author.full_name} size={24} />
              <span className="truncate text-[11px] font-medium text-[#444]">@{post.author.username}</span>
              {post.author.is_verified && <VerifiedDot />}
            </Link>

            <div className="flex shrink-0 items-center gap-2.5 text-[10px] text-text-muted">
              {readTime && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {readTime}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Heart size={13} />
                {formatCount(post.likes_count)}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={13} />
                {formatCount(post.views_count)}
              </span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  /* ====================================================================
     LIST variant
  ==================================================================== */
  return (
    <article className="group relative flex overflow-hidden rounded-card border border-border-default bg-white transition-all duration-200 hover:border-[#DCD5CC] hover:shadow-[0_6px_20px_rgba(20,20,20,0.05)]">
      {/* Spine — muqova o'rnini bosuvchi rangli chiziq */}
      <span className="w-[3px] shrink-0" style={{ backgroundColor: accent }} aria-hidden="true" />

      <div className="flex min-w-0 flex-1 flex-col px-5 py-4">
        <div className="flex items-center gap-2">
          {category && (
            <Link
              href={`/posts?category=${encodeURIComponent(category.slug)}`}
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: accent }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
              {category.name}
            </Link>
          )}
          {!post.published_at && (
            <span className="rounded-full bg-bg-muted px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-text-muted">
              Qoralama
            </span>
          )}
        </div>

        <h3 className="font-display mt-2 line-clamp-2 text-[19px] font-semibold leading-[1.28] tracking-[-0.015em] text-text-primary sm:text-[20px]">
          <Link href={url} className="transition-colors group-hover:text-primary">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-1.5 line-clamp-2 max-w-[650px] text-[13px] leading-[1.65] text-[#6C6A67]">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border-default pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <Link href={`/@${post.author.username}`} className="flex min-w-0 items-center gap-2">
              <Avatar src={post.author.avatar} name={post.author.full_name} size={24} />
              <span className="max-w-[120px] truncate text-[11px] font-medium text-[#333] transition-colors hover:text-primary">
                @{post.author.username}
              </span>
              {post.author.is_verified && <VerifiedDot />}
            </Link>

            <span className="h-3 w-px shrink-0 bg-border-default" />

            <span className="whitespace-nowrap text-[10px] text-[#88847E]">
              {post.published_at ? formatDate(post.published_at) : "Nashr etilmagan"}
            </span>

            {readTime && (
              <>
                <span className="h-3 w-px shrink-0 bg-border-default" />
                <span className="flex items-center gap-1 whitespace-nowrap text-[10px] text-[#88847E]">
                  <Clock size={10} />
                  {readTime}
                </span>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3 text-[#68645F]">
            <span className="flex items-center gap-1 text-[10px]">
              <Heart size={14} />
              {formatCount(post.likes_count)}
            </span>
            <span className="hidden items-center gap-1 text-[10px] sm:flex">
              <MessageCircle size={13} />
              {formatCount(post.comments_count)}
            </span>
            <span className="hidden items-center gap-1 text-[10px] md:flex">
              <Eye size={13} />
              {formatCount(post.views_count)}
            </span>

            <button
              type="button"
              onClick={handleBookmark}
              disabled={bookmarkPending}
              aria-label={bookmarked ? "Saqlangan" : "Saqlash"}
              title={bookmarked ? "Saqlanganlardan olib tashlash" : "Keyinroq o'qish uchun saqlash"}
              className={`ml-1 flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-150 disabled:opacity-50 ${bookmarked
                  ? "text-primary hover:bg-inkly-orange-light"
                  : "hover:bg-bg-muted hover:text-primary"
                }`}
            >
              {bookmarked ? (
                <BookmarkCheck size={14} strokeWidth={1.7} />
              ) : (
                <Bookmark size={14} strokeWidth={1.7} />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}