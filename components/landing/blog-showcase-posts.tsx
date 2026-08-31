import { Globe } from "lucide-react"
import { PostCard } from "@/components/ui/post-card"
import { listPublicPostsSafe } from "@/lib/api/public"

export async function BlogShowcasePosts() {
  const { items: posts } = await listPublicPostsSafe({ page: 1, page_size: 3 })
  const preview = posts.slice(0, 3)

  if (preview.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-inkly-orange-light text-primary">
          <Globe size={18} />
        </span>
        <p className="max-w-xs text-sm leading-relaxed text-text-muted">
          Nashr qilingan birinchi maqola shu yerda, aynan shunday ko&apos;rinishda joylashadi.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
      {preview.map((post) => (
        <PostCard key={post.uuid} post={post} variant="grid" />
      ))}
    </div>
  )
}

export function BlogShowcaseFallback() {
  return (
    <div className="grid animate-pulse gap-4 sm:grid-cols-3 sm:gap-5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-card border border-border-default bg-white">
          <div className="aspect-[16/9] bg-bg-muted" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-2.5 w-1/3 rounded-full bg-bg-muted" />
            <div className="h-3.5 w-full rounded-full bg-bg-muted" />
            <div className="h-3.5 w-2/3 rounded-full bg-bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
