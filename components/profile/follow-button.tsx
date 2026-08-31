"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { followsApi } from "@/lib/api/follows"

interface FollowButtonProps {
  targetSlug: string
  initialIsFollowing: boolean
  initialFollowersCount: number
}

export function FollowButton({
  targetSlug,
  initialIsFollowing,
  initialFollowersCount,
}: FollowButtonProps) {
  const { state } = useAuth()
  const { token, user } = state
  const router = useRouter()

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  // Foydalanuvchi o'z profilida tugmani ko'rmasin
  if (user?.slug === targetSlug || user?.username === targetSlug) return null

  const handleClick = async () => {
    if (!token) {
      router.push("/login")
      return
    }
    if (loading) return
    setLoading(true)

    const wasFollowing = isFollowing
    const prevCount = followersCount

    // Optimistic update
    setIsFollowing(!wasFollowing)
    setFollowersCount(wasFollowing ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      if (wasFollowing) {
        await followsApi.unfollow(token, targetSlug)
      } else {
        await followsApi.follow(token, targetSlug)
      }
      startTransition(() => router.refresh())
    } catch {
      // Rollback on error
      setIsFollowing(wasFollowing)
      setFollowersCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
        isFollowing
          ? "border border-white/30 bg-white/10 text-white hover:bg-destructive/20 hover:border-destructive/40 hover:text-red-200"
          : "bg-white text-foreground hover:bg-white/90"
      }`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isFollowing ? (
        <UserCheck size={14} />
      ) : (
        <UserPlus size={14} />
      )}
      {isFollowing ? "Kuzatilmoqda" : "Kuzatish"}
    </button>
  )
}
