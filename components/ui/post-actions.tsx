"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, ThumbsDown, Share2, Check, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { formatCount } from "@/lib/utils/format"
import type { PostReactionType, PostResponse } from "@/types/api"

export function PostActions({ post }: { post: PostResponse }) {
  const { state } = useAuth()
  const { user, token } = state
  const router = useRouter()

  const [reacted, setReacted] = useState<PostReactionType | null>(post.reacted)
  const [likes, setLikes] = useState(post.likes_count)
  const [dislikes, setDislikes] = useState(post.dislikes_count)
  const [actionLoading, setActionLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleReact = async (type: "like" | "dislike") => {
    /* BUG 13 FIX: login yo'q foydalanuvchi login sahifasiga redirect qilinadi,
       avval faqat disabled edi — nima qilish kerakligi noaniq edi */
    if (!token) {
      router.push("/login")
      return
    }
    if (actionLoading) return
    setActionLoading(true)

    const prevReacted = reacted
    const prevLikes = likes
    const prevDislikes = dislikes

    if (reacted === type) {
      setReacted(null)
      if (type === "like") setLikes((n) => Math.max(0, n - 1))
      else setDislikes((n) => Math.max(0, n - 1))
    } else {
      if (reacted === "like") setLikes((n) => Math.max(0, n - 1))
      if (reacted === "dislike") setDislikes((n) => Math.max(0, n - 1))
      setReacted(type)
      if (type === "like") setLikes((n) => n + 1)
      else setDislikes((n) => n + 1)
    }

    try {
      let res
      if (reacted === type) {
        res = await postsApi.removeReaction(post.slug, token)
      } else if (type === "like") {
        res = await postsApi.like(post.slug, token)
      } else {
        res = await postsApi.dislike(post.slug, token)
      }
      setReacted(res.reacted)
      setLikes(res.likes_count)
      setDislikes(res.dislikes_count)
    } catch {
      setReacted(prevReacted)
      setLikes(prevLikes)
      setDislikes(prevDislikes)
    } finally {
      setActionLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: post.title, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Like */}
      <button
        onClick={() => handleReact("like")}
        disabled={actionLoading}
        aria-label={`Like — ${likes}`}
        /* BUG 13 FIX: title tooltip — login kerakligini bildiradi */
        title={!user ? "Like bosish uchun hisobingizga kiring" : undefined}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
          reacted === "like"
            ? "border-red-200 bg-red-50 text-red-500"
            : "border-border-default text-text-secondary hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        }`}
      >
        <Heart size={15} className={reacted === "like" ? "fill-current" : ""} />
        {formatCount(likes)}
      </button>

      {/* Dislike */}
      <button
        onClick={() => handleReact("dislike")}
        disabled={actionLoading}
        aria-label={`Dislike — ${dislikes}`}
        title={!user ? "Dislike bosish uchun hisobingizga kiring" : undefined}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
          reacted === "dislike"
            ? "border-text-muted/40 bg-bg-muted text-text-primary"
            : "border-border-default text-text-muted hover:border-text-muted/40 hover:bg-bg-muted"
        }`}
      >
        <ThumbsDown size={15} className={reacted === "dislike" ? "fill-current" : ""} />
        {formatCount(dislikes)}
      </button>

      {/* BUG 13 FIX: Login yo'q foydalanuvchiga tushuntirish linki */}
      {!user && (
        <a
          href="/login"
          className="flex items-center gap-1.5 rounded-full border border-border-default px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
        >
          <LogIn size={12} />
          Kiring
        </a>
      )}

      {/* Share */}
      <button
        onClick={handleShare}
        aria-label="Ulashish"
        className="ml-auto flex items-center gap-2 rounded-full border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
      >
        {copied ? (
          <><Check size={15} className="text-green-500" /> Nusxalandi</>
        ) : (
          <><Share2 size={15} /> Ulashish</>
        )}
      </button>
    </div>
  )
}