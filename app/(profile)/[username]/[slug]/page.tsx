import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Avatar } from "@/components/ui/avatar"
import { Badge, VerifiedDot } from "@/components/ui/badge"
import { PostActions } from "@/components/ui/post-actions"
import { CommentSection } from "@/components/ui/comment-section"
import { getPublicAuthorSafe, getPublicAuthorPostsSafe, getPublicPostByAuthorSafe } from "@/lib/api/public"
import { formatDate, readingTime } from "@/lib/utils/format"
import { parseTeletypeToHtml } from "@/lib/utils/teletype-parser"
import { getMediaUrl } from "@/lib/api/client"
import type { PostListItem } from "@/types/api"

interface PostPageProps {
  params: Promise<{ username: string; slug: string }>
}

/* ================================================================
   METADATA
================================================================ */

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { username: rawUsername, slug: rawSlug } = await params
  const username = decodeURIComponent(rawUsername).replace(/^@/, "")
  const slug = decodeURIComponent(rawSlug)

  // Fayl kengaytmali yo'llar — skip
  if (/\.[a-zA-Z0-9]{1,5}$/.test(username) || /\.[a-zA-Z0-9]{1,5}$/.test(slug)) {
    return { title: "Inkly" }
  }

  const post = await getPublicPostByAuthorSafe(username, slug)
  if (!post) return { title: "Maqola topilmadi" }

  return {
    title: `${post.title} — Inkly`,
    description: post.excerpt ?? `${post.author.full_name} tomonidan yozilgan maqola`,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover ? [getMediaUrl(post.cover) ?? ""] : [],
    },
  }
}

/* ================================================================
   PAGE
================================================================ */

export default async function PostPage({ params }: PostPageProps) {
  const { username: rawUsername, slug: rawSlug } = await params
  const username = decodeURIComponent(rawUsername).replace(/^@/, "")
  const slug = decodeURIComponent(rawSlug)

  // React.cache tufayli getPublicPostByAuthorSafe generateMetadata da
  // allaqachon chaqirilgan bo'lsa — yangi network request yuborilmaydi
  const post = await getPublicPostByAuthorSafe(username, slug)
  if (!post) notFound()

  if (post.author.username !== username) notFound()

  const [author, relatedData] = await Promise.all([
    getPublicAuthorSafe(username),
    getPublicAuthorPostsSafe(username, { page_size: 4 }),
  ])

  const relatedPosts: PostListItem[] = relatedData.items
    .filter((p) => p.slug !== slug)
    .slice(0, 3)

  const htmlContent = parseTeletypeToHtml(post.content)
  const readTime = readingTime(post.content)

  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

      {/* Kategoriyalar */}
      {post.categories.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {post.categories.map((cat) => (
            <Link key={cat.uuid} href={`/categories/${cat.slug}`}>
              <Badge>{cat.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Sarlavha */}
      <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
        {post.title}
      </h1>

      {/* Meta */}
      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-text-muted">
        <Link href={`/@${post.author.username}`} className="flex items-center gap-2">
          <Avatar src={post.author.avatar} name={post.author.full_name} size={36} />
          <div>
            <p className="font-medium text-text-primary flex items-center gap-1">
              {post.author.full_name}
              {post.author.is_verified && <VerifiedDot />}
            </p>
            <p className="text-xs">@{post.author.username}</p>
          </div>
        </Link>
        <span aria-hidden>·</span>
        {post.published_at && <span>{formatDate(post.published_at)}</span>}
        <span aria-hidden>·</span>
        <span>{readTime}</span>
      </div>

      {/* Cover */}
      {post.cover && (
        <div className="mb-10 overflow-hidden rounded-2xl bg-bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getMediaUrl(post.cover) || "/placeholder.svg"}
            alt=""
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Kontent */}
      <div
        className="prose-inkly max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Reaksiyalar */}
      {post.allow_reactions && (
        <div className="mt-12">
          <PostActions post={post} />
        </div>
      )}

      {/* Muallif bio */}
      {author?.bio && (
        <div className="mt-12 rounded-2xl border border-border-default bg-inkly-orange-light p-6">
          <Link href={`/@${author.username}`} className="flex items-center gap-3 mb-3">
            <Avatar src={author.avatar} name={author.full_name} size={48} />
            <div>
              <p className="font-semibold text-text-primary flex items-center gap-1.5">
                {author.full_name}
                {author.is_verified && <VerifiedDot />}
              </p>
              <p className="text-sm text-text-muted">@{author.username}</p>
            </div>
          </Link>
          <p className="text-sm leading-relaxed text-text-secondary">{author.bio}</p>
        </div>
      )}

      {/* Izohlar */}
      {post.allow_comments && (
        <div className="mt-12">
          <CommentSection postSlug={slug} />
        </div>
      )}

      {/* Bog'liq maqolalar */}
      {relatedPosts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-5 text-lg font-semibold text-text-primary">
            {post.author.full_name}ning boshqa maqolalari
          </h2>
          <div className="space-y-3">
            {relatedPosts.map((p) => (
              <Link
                key={p.uuid}
                href={`/@${p.author.username}/${p.slug}`}
                className="flex items-start gap-4 rounded-xl border border-border-default bg-white p-4 transition-colors hover:border-primary/30"
              >
                {p.cover && (
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getMediaUrl(p.cover) ?? "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary line-clamp-2 hover:text-primary transition-colors">
                    {p.title}
                  </p>
                  {p.excerpt && (
                    <p className="mt-1 text-sm text-text-muted line-clamp-1">{p.excerpt}</p>
                  )}
                  {p.published_at && (
                    <p className="mt-1.5 text-xs text-text-muted">{formatDate(p.published_at)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}