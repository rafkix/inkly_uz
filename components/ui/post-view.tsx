"use client"

import { useEffect, useState } from "react"
import { Grid2X2, List } from "lucide-react"
import { PostCard } from "@/components/ui/post-card"
import type { PostListItem } from "@/types/api"

interface PostViewProps {
  posts: PostListItem[]
  /** Cookie/localStorage kalit — view preference saqlanadi (default: "post-view") */
  storageKey?: string
}

export function PostView({ posts, storageKey = "post-view" }: PostViewProps) {
  // BUG FIX: view preference sahifalar orasida saqlanmagan edi —
  // localStorage dan o'qib, o'zgarishda yozib ketadi.
  const [view, setView] = useState<"list" | "grid">("list")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved === "grid" || saved === "list") setView(saved)
    } catch { }
  }, [storageKey])

  const switchView = (next: "list" | "grid") => {
    setView(next)
    try { localStorage.setItem(storageKey, next) } catch { }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-default px-6 py-16 text-center">
        <p className="text-sm text-text-muted">Hozircha maqola yo&apos;q</p>
      </div>
    )
  }

  return (
    <div>
      {/* View switch */}
      <div className="mb-3 flex justify-end">
        <div className="flex h-10 overflow-hidden rounded-lg border border-border-default bg-white">
          <button
            type="button"
            onClick={() => switchView("list")}
            aria-label="Ro'yxat ko'rinishi"
            aria-pressed={view === "list"}
            className={`flex h-full w-10 items-center justify-center transition-colors ${view === "list" ? "bg-inkly-orange-light text-primary" : "text-text-muted hover:bg-bg-muted"
              }`}
          >
            <List size={18} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => switchView("grid")}
            aria-label="Grid ko'rinishi"
            aria-pressed={view === "grid"}
            className={`flex h-full w-10 items-center justify-center transition-colors ${view === "grid" ? "bg-inkly-orange-light text-primary" : "text-text-muted hover:bg-bg-muted"
              }`}
          >
            <Grid2X2 size={17} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Hydration shimmer — mounted bo'lgunga qadar list ko'rsatiladi */}
      {!mounted ? (
        <div className="space-y-2.5">
          {posts.map((post) => (
            <PostCard key={post.uuid} post={post} variant="list" />
          ))}
        </div>
      ) : view === "list" ? (
        <div className="space-y-2.5">
          {posts.map((post) => (
            <PostCard key={post.uuid} post={post} variant="list" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.uuid} post={post} variant="grid" />
          ))}
        </div>
      )}
    </div>
  )
}