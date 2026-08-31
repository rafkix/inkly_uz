import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Bookmark,
  Clock,
  Eye,
  Heart,
  PenLine,
  Sparkles,
  UserRound,
} from "lucide-react"
import type { Metadata } from "next"

import { getMediaUrl } from "@/lib/api/client"
import type { PostListItem } from "@/types/api"
import { getPublicAuthorSafe, getPublicAuthorPostsSafe } from "@/lib/api/public"
import { formatDate, formatMetric, readingTimeFromPost } from "@/lib/utils/format"

import { ShareButton } from "@/components/profile/share-button"
import {  } from "@/components/profile/follow-button"
import { SortButton } from "@/components/profile/sort-button"
import { MobileHero } from "@/components/profile/mobile-hero"
import { ProfileBanner } from "@/components/profile/profile-banner"

/* ================================================================
   TYPES
================================================================ */

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

function isInvalidUsername(username: string): boolean {
  return /\.[a-zA-Z0-9]{1,5}$/.test(username) || username.startsWith("_")
}

/* ================================================================
   METADATA
================================================================ */

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username: rawUsername } = await params
  const username = decodeURIComponent(rawUsername).replace(/^@/, "")

  if (isInvalidUsername(username)) {
    return { title: "Foydalanuvchi topilmadi" }
  }

  const user = await getPublicAuthorSafe(username)
  if (!user) return { title: "Foydalanuvchi topilmadi" }
  return {
    title: `@${user.username} — Inkly`,
    description: user.bio ?? `${user.full_name} ning Inkly profili`,
  }
}

/* ================================================================
   PAGE
================================================================ */

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username: rawUsername } = await params
  const username = decodeURIComponent(rawUsername).replace(/^@/, "")

  if (isInvalidUsername(username)) notFound()

  const user = await getPublicAuthorSafe(username)
  if (!user) notFound()

  const postsData = await getPublicAuthorPostsSafe(user.slug ?? user.username, {
    page_size: 12,
  })

  const articleCount = postsData.total
  const avatarUrl = user.avatar ? (getMediaUrl(user.avatar) ?? "") : ""

  return (
    <main className="min-h-screen pt-0 sm:pt-[76px]">

      {/* ── Mobile: Hero + Content ── */}
      <MobileHero user={user} />

      <div className="px-4 pb-10 sm:hidden">
        <section className="mt-3 rounded-2xl border border-bg-muted bg-white">
          <TabBar shareDesktop={false} username={user.username} />
          <ContentGrid postsData={postsData} articleCount={articleCount} user={user} />
        </section>
      </div>

      {/* ── Desktop: Banner + Content ── */}
      <div className="mx-auto hidden w-full max-w-[1240px] px-5 pb-10 sm:block sm:px-7 lg:px-8">
        <ProfileBanner user={user} avatarUrl={avatarUrl} />

        <section className="mt-[14px] rounded-2xl border border-bg-muted bg-white">
          <TabBar shareDesktop username={user.username} />
          <ContentGrid postsData={postsData} articleCount={articleCount} user={user} />
        </section>
      </div>
    </main>
  )
}

/* ================================================================
   TAB BAR
================================================================ */

function TabBar({
  shareDesktop,
  username: _username,
}: {
  shareDesktop: boolean
  username: string
}) {
  return (
    <div className="flex min-h-[54px] items-center justify-between border-b border-border-default px-4 sm:px-5">
      <nav
        className="flex h-full items-center gap-6 overflow-x-auto"
        aria-label="Profil bo'limlari"
      >
        <ProfileTab href="#articles" active icon={<Bookmark size={17} strokeWidth={1.8} />}>
          Maqolalar
        </ProfileTab>
        <ProfileTab href="#about" icon={<UserRound size={17} strokeWidth={1.8} />}>
          Haqida
        </ProfileTab>
      </nav>
      {shareDesktop && (
        <div className="ml-4 hidden items-center gap-2 sm:flex">
          <ShareButton />
        </div>
      )}
    </div>
  )
}

/* ================================================================
   CONTENT GRID
   FIX: lg:items-start — sidebar stretching bo'sh joy yaratmasin
================================================================ */

function ContentGrid({
  postsData,
  articleCount,
  user,
}: {
  postsData: { items: PostListItem[]; total: number }
  articleCount: number
  user: NonNullable<Awaited<ReturnType<typeof getPublicAuthorSafe>>>
}) {
  return (
    <div
      id="articles"
      className="grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start"
    >
      {/* ── Main content ── */}
      <div className="min-h-0 min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] text-[#8D8580]">
            {articleCount > 0 ? `${articleCount} ta maqola` : ""}
          </p>
          <SortButton />
        </div>

        {postsData.items.length === 0 ? (
          <EmptyArticles />
        ) : (
          <div className="space-y-3">
            {postsData.items.map((post) => (
              <ProfilePostCard key={post.uuid} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* ── Sidebar ──
          lg:sticky + lg:top-[92px] — Navbar balandligi (76px) + 16px bo'shliq.
          Shu tufayli asosiy ustunda maqola kam bo'lsa ham sidebar "osilib"
          ko'rinmaydi va scroll paytida joyida turadi. */}
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-[92px] lg:self-start">
        <AboutCard user={user} />
        <StatsCard articleCount={articleCount} />
        <CategoriesSidebar />
        <PopularPosts posts={postsData.items.slice(0, 3)} />
      </aside>
    </div>
  )
}

/* ================================================================
   PROFILE TAB
   FIX: <a> → <Link> (hydration warning / "1 Issue" fix)
================================================================ */

function ProfileTab({
  href,
  children,
  icon,
  active = false,
}: {
  href: string
  children: React.ReactNode
  icon: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={[
        "relative flex h-[54px] shrink-0 items-center gap-2 text-[11px] font-medium transition",
        active
          ? "font-semibold text-primary"
          : "text-[#525960] hover:text-primary",
      ].join(" ")}
    >
      {icon}
      {children}
      {active && (
        <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-primary" />
      )}
    </Link>
  )
}

/* ================================================================
   POST CARD
================================================================ */

function ProfilePostCard({ post }: { post: PostListItem }) {
  return (
    <Link
      href={`/@${post.author.username}/${post.slug}`}
      prefetch={false}
      className="group flex gap-4 rounded-card border border-bg-muted bg-white p-4 transition hover:border-[#E0D0C4] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="relative h-[100px] w-[160px] shrink-0 overflow-hidden rounded-md bg-inkly-orange-light sm:w-[180px]">
        {post.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getMediaUrl(post.cover) ?? "/placeholder.svg"}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-inkly-orange-light">
            <PenLine size={22} className="text-[#C4BDB3]" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="line-clamp-2 text-[16px] font-bold leading-[1.4] tracking-[-0.02em] text-text-primary transition group-hover:text-primary">
            {post.title || "Nomsiz maqola"}
          </h3>
          {post.excerpt && (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.6] text-text-muted">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-[#9199A3]">
          {post.reading_time != null && post.reading_time > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {readingTimeFromPost(post.reading_time)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {formatMetric(post.views_count)}
          </span>
          <span className="flex items-center gap-1">
            <MessageIcon />
            {formatMetric(post.comments_count)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={11} />
            {formatMetric(post.likes_count)}
          </span>
          {(post.published_at ?? post.created_at) && (
            <span className="ml-auto whitespace-nowrap text-[#B0B6BE]">
              {formatShortDate(post.published_at ?? post.created_at)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function MessageIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.7-4A8.2 8.2 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
    </svg>
  )
}

/* ================================================================
   ABOUT CARD
================================================================ */

function AboutCard({
  user,
}: {
  user: Awaited<ReturnType<typeof getPublicAuthorSafe>>
}) {
  if (!user) return null
  return (
    <div id="about" className="rounded-xl border border-bg-muted bg-white p-4">
      <div className="flex items-center gap-2">
        <UserRound size={18} strokeWidth={1.8} className="text-[#343A40]" />
        <h3 className="text-[14px] font-bold text-text-primary">Muallif haqida</h3>
      </div>
      <dl className="mt-4 space-y-2.5 text-[11px] text-[#3E4247]">
        <div className="flex gap-1.5">
          <dt className="font-semibold">Ism:</dt>
          <dd>{user.full_name}</dd>
        </div>
        {user.location && (
          <div className="flex gap-1.5">
            <dt className="font-semibold">Lokatsiya:</dt>
            <dd>{user.location}</dd>
          </div>
        )}
        {user.created_at && (
          <div className="flex gap-1.5">
            <dt className="font-semibold">Qo'shilgan sana:</dt>
            <dd>{formatDate(user.created_at)}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

/* ================================================================
   STATS CARD
================================================================ */

function StatsCard({ articleCount }: { articleCount: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-bg-muted bg-white">
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <strong className="text-[18px] font-bold tracking-[-0.03em]">
          {formatMetric(articleCount)}
        </strong>
        <span className="mt-1 text-[9px] text-text-muted">Maqolalar</span>
      </div>
    </div>
  )
}

/* ================================================================
   CATEGORIES SIDEBAR
================================================================ */

function CategoriesSidebar() {
  const categories: [string, string][] = [
    ["Dasturlash", "12"],
    ["Texnologiya", "6"],
    ["Mahsuldorlik", "4"],
    ["Minimalizm", "3"],
    ["Hayot tajribasi", "2"],
  ]
  return (
    <div className="rounded-xl border border-bg-muted bg-white p-4">
      <h3 className="text-[15px] font-bold">Kategoriyalar</h3>
      <ul className="mt-3 space-y-3">
        {categories.map(([name, count]) => (
          <li key={name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-inkly-orange-light text-primary">
                <Sparkles size={11} />
              </span>
              <span className="text-[10px] text-[#30363B]">{name}</span>
            </div>
            <span className="rounded-full bg-inkly-orange-light px-2 py-0.5 text-[9px] text-[#77736C]">
              {count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ================================================================
   POPULAR POSTS
================================================================ */

function PopularPosts({ posts }: { posts: PostListItem[] }) {
  if (posts.length === 0) return null
  return (
    <div className="rounded-xl border border-bg-muted bg-white p-4">
      <h3 className="text-[15px] font-bold">Ko'p o'qilganlar</h3>
      <ul className="mt-3 space-y-3">
        {posts.map((post) => (
          <li key={post.uuid}>
            <Link
              href={`/@${post.author.username}/${post.slug}`}
              prefetch={false}
              className="group flex gap-2.5"
            >
              <div className="h-[42px] w-[54px] shrink-0 overflow-hidden rounded-sm bg-inkly-orange-light">
                {post.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getMediaUrl(post.cover) ?? "/placeholder.svg"}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PenLine size={14} className="text-[#BDB5AB]" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[9px] font-semibold leading-4 text-[#24282C] group-hover:text-primary">
                  {post.title || "Nomsiz maqola"}
                </p>
                <span className="mt-1 flex items-center gap-1 text-[8px] text-text-muted">
                  <Eye size={10} />
                  {formatMetric(post.views_count)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ================================================================
   EMPTY ARTICLES
================================================================ */

function EmptyArticles() {
  return (
    <div className="rounded-card border border-bg-muted bg-white p-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-inkly-orange-light text-primary">
        <PenLine size={21} />
      </div>
      <h3 className="mt-4 text-[14px] font-semibold">Hali maqola yo'q</h3>
      <p className="mt-1 text-[11px] text-[#77736C]">
        Bu muallif hali biror narsa yozmagan.
      </p>
    </div>
  )
}

/* ================================================================
   HELPERS
================================================================ */

function formatShortDate(value: string | null | undefined): string {
  if (!value) return ""
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value))
  } catch {
    return value
  }
}