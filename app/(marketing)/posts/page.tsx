import type { Metadata } from "next"
import { ChevronDown } from "lucide-react"

import { PostView } from "@/components/ui/post-view"
import { PostsAside } from "@/components/ui/posts-aside"
import { Pagination } from "@/components/ui/pagination"
import { listCategoriesSafe } from "@/lib/api/categories"
import { listPublicPostsSafe } from "@/lib/api/public"
import type { CategoryPublicResponse } from "@/types/api"

export const metadata: Metadata = {
  title: "Maqolalar",
  description: "Inkly ijodkorlarining eng yangi maqolalari.",
}

interface PostsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
  }>
}

export default async function PostsPage({
  searchParams,
}: PostsPageProps) {
  const params = await searchParams

  const page = Math.max(1, Number(params.page) || 1)
  const search = params.search
  const category = params.category

  const [postsPage, categoriesPage] = await Promise.all([
    listPublicPostsSafe({
      page,
      page_size: 10,
      search,
      category,
    }),
    listCategoriesSafe(),
  ])

  const categories = categoriesPage.items

  return (
    <main className="min-h-screen bg-background pt-16 sm:pt-[76px]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-7 sm:py-7 lg:px-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_276px]">
          <section className="min-w-0">
            <PostsHeader />

            <CategoryNavigation
              categories={categories}
              active={category}
            />

            {search && (
              <div className="mt-5 text-[13px] text-muted-foreground">
                <strong className="text-foreground">
                  {postsPage.total}
                </strong>{" "}
                ta natija —{" "}
                <span className="italic">{search}</span>
              </div>
            )}

            <div className="mt-3">
              <PostView posts={postsPage.items} />
            </div>

            {postsPage.total_pages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={postsPage.page}
                  totalPages={postsPage.total_pages}
                  basePath="/posts"
                  query={{ search, category }}
                />
              </div>
            )}
          </section>

          <PostsAside
            categories={categories}
            totalPosts={postsPage.total}
          />
        </div>
      </div>
    </main>
  )
}

function PostsHeader() {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="font-display text-[30px] font-bold tracking-[-0.035em] text-foreground sm:text-[32px]">
        Maqolalar
      </h1>
    </div>
  )
}

function CategoryNavigation({
  categories,
  active,
}: {
  categories: CategoryPublicResponse[]
  active?: string
}) {
  return (
    <nav className="scrollbar-none mt-5 flex gap-1 overflow-x-auto border-b border-border pb-3">
      <CategoryLink
        name="Barchasi"
        href="/posts"
        active={!active}
      />

      {categories.slice(0, 6).map((category) => (
        <CategoryLink
          key={category.uuid}
          name={category.name}
          href={`/posts?category=${encodeURIComponent(category.slug)}`}
          active={active === category.slug}
        />
      ))}

      {categories.length > 6 && (
        <CategoryLink
          name="Ko‘proq"
          href="/categories"
          arrow
        />
      )}
    </nav>
  )
}

function CategoryLink({
  name,
  href,
  active = false,
  arrow = false,
}: {
  name: string
  href: string
  active?: boolean
  arrow?: boolean
}) {
  return (
    <a
      href={href}
      className={`flex shrink-0 items-center gap-1 rounded-lg px-4 py-2 text-[12px] font-medium transition ${active
          ? "border border-primary/30 bg-primary/10 text-primary"
          : "border border-transparent text-foreground hover:bg-muted"
        }`}
    >
      {name}
      {arrow && <ChevronDown size={13} />}
    </a>
  )
}
