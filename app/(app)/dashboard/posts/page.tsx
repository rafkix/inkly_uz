"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BookOpen, Plus, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { formatCount, formatDate } from "@/lib/utils/format"
import type { Page, PostListItem } from "@/types/api"
import { LoadingDots } from "@/components/ui/loading-dots"

const PAGE_SIZE = 10
export default function DashboardPostsPage() {
  return <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><LoadingDots size="lg" className="text-primary" /></div>}><DashboardPostsContent /></Suspense>
}

function DashboardPostsContent() {
  const { state } = useAuth()
  const { token, user, loading: authLoading } = state
  const searchParams = useSearchParams()
  const router = useRouter()
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)

  const [data, setData] = useState<Page<PostListItem> | null>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/dashboard/posts")
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (!token) return
    let active = true
    setFetching(true)
    setError(null)
    postsApi.myList(token, {
      page,
      page_size: PAGE_SIZE,
    }).then((result) => {
      if (active) setData(result)
    }).catch((err) => {
      if (active) setError(err instanceof Error ? err.message : "Maqolalarni yuklab bo'lmadi")
    }).finally(() => {
      if (active) setFetching(false)
    })
    return () => { active = false }
  }, [authLoading, page, token])



  if (authLoading || !user) {
    return <div className="flex min-h-[60vh] items-center justify-center"><LoadingDots size="lg" className="text-primary" /></div>
  }

  return (
    <main className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-primary">Kontent boshqaruvi</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Maqolalarim</h1>
          <p className="text-sm text-muted-foreground">Barcha maqolalaringizni boshqaring.</p>
        </div>
        <Link href="/write" className="inline-flex items-center justify-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-inkly-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"> <Plus data-icon="inline-start" /> Yangi maqola</Link>
      </header>



      <section className="overflow-hidden rounded-panel border border-border bg-background shadow-card">
        {fetching ? <div className="flex justify-center py-20"><LoadingDots size="lg" className="text-primary" /></div> : error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={() => router.refresh()}>Qayta urinish</Button></div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center"><BookOpen className="text-muted-foreground" /><p className="text-sm text-muted-foreground">Bu filter uchun maqola topilmadi.</p><Link href="/write" className="inline-flex items-center justify-center rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-inkly-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Birinchi maqolangizni yozing</Link></div>
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((post) => <PostRow key={post.uuid} post={post} />)}
          </div>
        )}
      </section>

      {data && <Pagination page={data.page} totalPages={data.total_pages} basePath="/dashboard/posts" query={{}} />}
    </main>
  )
}

function PostRow({ post }: { post: PostListItem }) {
  const { state } = useAuth()
  const { token } = state
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!token) return
    const ok = window.confirm(`"${post.title || "Sarlavsiz"}" maqolasini o'chirishni tasdiqlaysizmi?`)
    if (!ok) return
    setDeleting(true)
    try {
      await postsApi.delete(token, post.uuid)
      toast.success("Maqola o'chirildi")
      // The list will refresh via router.refresh() in the parent or we could update local state
      // For now, let the parent handle refresh
    } catch (err) {
      console.error("Delete failed:", err)
      toast.error("O'chirishda xatolik")
    } finally {
      setDeleting(false)
    }
  }

  return <article className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <Link href={`/write?edit=${post.uuid}`} className="truncate font-semibold text-foreground hover:text-primary">{post.title || "Sarlavsiz"}</Link>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={post.status === "published" ? "default" : "outline"}>{post.status === "published" ? "Nashr qilingan" : post.status === "draft" ? "Qoralama" : "Arxiv"}</Badge>
        <span>{formatDate(post.updated_at)}</span>
        {post.status === "published" && <span>{formatCount(post.views_count)} ko'rish</span>}
      </div>
    </div>
    <div className="flex items-center gap-2 sm:ml-auto">
      {post.status === "published" && post.slug && (
        <a
          href={`/@${post.author?.username}/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-control border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-primary"
          title="Ko'rish"
        >
          <Eye size={14} /> Ko'rish
        </a>
      )}
      <Link href={`/write?edit=${post.uuid}`} className="inline-flex items-center justify-center rounded-control border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-primary">Tahrirlash</Link>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        title="O'chirish"
      >
        {deleting ? <LoadingDots size="md" /> : <Trash2 size={16} />}
      </Button>
    </div>
  </article>
}