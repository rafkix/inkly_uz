import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { listCategoriesSafe } from "@/lib/api/categories"
import type { CategoryPublicResponse } from "@/types/api"

export const metadata: Metadata = {
  title: "Kategoriyalar",
  description: "Inkly maqolalarini mavzular bo‘yicha kashf qiling.",
}

export default async function CategoriesPage() {
  const { items } = await listCategoriesSafe()

  const totalPosts = items.reduce(
    (total, category) => total + category.posts_count,
    0,
  )

  return (
    <main className="min-h-[calc(100vh-74px)] bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-7 lg:px-8">
        <CategoriesHeader
          count={items.length}
          postsCount={totalPosts}
        />

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <CategoriesGrid categories={items} />
        )}
      </div>
    </main>
  )
}

function CategoriesHeader({
  count,
  postsCount,
}: {
  count: number
  postsCount: number
}) {
  return (
    <header className="border-b border-border-default pb-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A867F]">
            Mavzular
          </p>

          <h1 className="font-display mt-2 text-[32px] font-bold tracking-[-0.04em] text-text-primary sm:text-[38px]">
            Kategoriyalar
          </h1>

          <p className="mt-2 max-w-xl text-[14px] leading-6 text-text-muted">
            O‘zingizga qiziq mavzuni tanlang va shu yo‘nalishdagi
            maqolalarni kashf qiling.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-[13px] text-text-muted">
          <span className="font-semibold text-[#222]">
            {count}
          </span>
          <span>kategoriya</span>

          <span className="text-[#C8C3BC]">·</span>

          <span className="font-semibold text-[#222]">
            {postsCount}
          </span>
          <span>maqola</span>
        </div>
      </div>
    </header>
  )
}

function CategoriesGrid({
  categories,
}: {
  categories: CategoryPublicResponse[]
}) {
  return (
    <section className="mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <CategoryItem
            key={category.uuid}
            category={category}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}

function CategoryItem({
  category,
  index,
}: {
  category: CategoryPublicResponse
  index: number
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group border-b border-border-default py-7 pr-6 transition-colors sm:nth-[2n]:pl-6 sm:nth-[2n]:pr-0 lg:nth-[2n]:pl-0 lg:nth-[3n+2]:px-6 lg:nth-[3n]:pl-6 lg:nth-[3n]:pr-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="pt-1 text-[11px] font-medium tabular-nums text-[#AAA59D]">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-[#222] transition-colors group-hover:text-primary">
              {category.name}
            </h2>

            {category.description && (
              <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-text-muted">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <ArrowUpRight
          size={17}
          className="mt-1 shrink-0 text-[#AAA59D] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>

      <div className="mt-6 flex items-center justify-between pl-6">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9A958D]">
          {category.posts_count} maqola
        </span>

        <span className="text-[11px] text-[#AAA59D] transition-colors group-hover:text-primary">
          Ko‘rish
        </span>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <section className="border-b border-border-default py-24 text-center">
      <p className="text-[15px] font-medium text-[#333]">
        Hozircha kategoriyalar mavjud emas.
      </p>

      <p className="mt-2 text-[13px] text-[#88837C]">
        Keyinroq qayta urinib ko‘ring.
      </p>
    </section>
  )
}