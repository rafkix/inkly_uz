import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { Pagination } from "@/components/ui/pagination"
import { PostView } from "@/components/ui/post-view"
import { PostsAside } from "@/components/ui/posts-aside"

import {
  getCategorySafe,
  listCategoriesSafe,
} from "@/lib/api/categories"
import { listPublicPostsSafe } from "@/lib/api/public"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategorySafe(slug)

  if (!category) {
    return {
      title: "Kategoriya topilmadi",
    }
  }

  return {
    title: category.name,
    description:
      category.description ??
      `${category.name} bo‘yicha maqolalar.`,
  }
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, { page: pageParam }] =
    await Promise.all([
      params,
      searchParams,
    ])

  const page = Math.max(
    1,
    Number(pageParam) || 1,
  )

  const [category, categoriesPage] =
    await Promise.all([
      getCategorySafe(slug),
      listCategoriesSafe(),
    ])

  if (!category) {
    notFound()
  }

  const postsPage = await listPublicPostsSafe({
    page,
    page_size: 10,
    category: slug,
  })

  const categories = categoriesPage.items

  return (
    <main className="min-h-[calc(100vh-74px)] bg-white">
      <div
        className="
          mx-auto
          w-full
          max-w-[1280px]
          px-5
          py-7
          sm:px-7
          lg:px-8
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-6
            xl:grid-cols-[minmax(0,1fr)_276px]
          "
        >
          <section className="min-w-0">
            <CategoryHeader
              name={category.name}
              description={category.description}
              count={category.posts_count}
            />

            <CategoryNavigation
              categories={categories}
              active={slug}
            />

            <div className="mt-3">
              <PostView
                posts={postsPage.items}
              />
            </div>

            {postsPage.total_pages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={postsPage.page}
                  totalPages={postsPage.total_pages}
                  basePath={`/categories/${slug}`}
                />
              </div>
            )}
          </section>

          <PostsAside categories={categories} totalPosts={postsPage.total} />
        </div>
      </div>
    </main>
  )
}

/* ================================================================
   CATEGORY HEADER
================================================================ */

function CategoryHeader({
  name,
  description,
  count,
}: {
  name: string
  description: string | null
  count: number
}) {
  return (
    <header
      className="
        border-b
        border-border-default
        pb-6
      "
    >
      <p
        className="
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-[#8A867F]
        "
      >
        Kategoriya
      </p>

      <div
        className="
          mt-2
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <h1
            className="
              text-[30px]
              font-bold
              tracking-[-0.035em]
              text-text-primary
              sm:text-[34px]
            "
          >
            {name}
          </h1>

          {description && (
            <p
              className="
                mt-2
                max-w-2xl
                text-[14px]
                leading-6
                text-text-muted
              "
            >
              {description}
            </p>
          )}
        </div>

        <div
          className="
            shrink-0
            text-[13px]
            text-text-muted
          "
        >
          <span
            className="
              font-semibold
              text-[#222]
            "
          >
            {count}
          </span>{" "}
          maqola
        </div>
      </div>
    </header>
  )
}

/* ================================================================
   CATEGORY NAVIGATION
================================================================ */

function CategoryNavigation({
  categories,
  active,
}: {
  categories: {
    uuid: string
    name: string
    slug: string
  }[]
  active: string
}) {
  return (
    <nav
      className="
        scrollbar-none
        mt-5
        flex
        gap-1
        overflow-x-auto
        border-b
        border-border-default
        pb-3
      "
    >
      <CategoryLink
        name="Barchasi"
        href="/posts"
      />

      {categories.slice(0, 6).map(
        (category) => (
          <CategoryLink
            key={category.uuid}
            name={category.name}
            href={
              `/posts?category=` +
              encodeURIComponent(
                category.slug,
              )
            }
            active={
              active === category.slug
            }
          />
        ),
      )}

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

/* ================================================================
   CATEGORY LINK
================================================================ */

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
      className={`
        flex
        shrink-0
        items-center
        gap-1
        rounded-lg
        px-4
        py-2
        text-[12px]
        font-medium
        transition

        ${active
          ? `
              border
              border-[#FFB58D]
              bg-inkly-orange-light
              text-primary
            `
          : `
              border
              border-transparent
              text-[#343434]
              hover:bg-bg-muted
            `
        }
      `}
    >
      {name}

      {arrow && (
        <ChevronDown size={13} />
      )}
    </a>
  )
}