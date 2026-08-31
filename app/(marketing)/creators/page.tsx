import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, FileText, Search, Users, Check,  } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { listPublicPostsSafe } from "@/lib/api/public"

export const metadata: Metadata = {
  title: "Yozuvchilar",
  description:
    "Inkly'da fikr ulashayotgan yozuvchilar bilan tanishing.",
}

interface CreatorsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    sort?: string
  }>
}

type Creator = {
  uuid: string
  username: string
  slug?: string | null
  full_name: string
  avatar_url?: string | null
  bio?: string | null
  description?: string | null
  is_verified?: boolean
  post_count: number
  views: number
  likes: number
}

const categories = [
  "Barchasi",
  "Texnologiya",
  "Dasturlash",
  "Maqsad va motivatsiya",
  "Minimalizm",
  "Hayot tarzi",
  "Biznes",
]

export default async function CreatorsPage({
  searchParams,
}: CreatorsPageProps) {
  const params = await searchParams

  const page = Math.max(1, Number(params.page) || 1)
  const search = params.search?.trim() || ""
  const category = params.category || ""
  const sort = params.sort || "popular"

  /*
   * Hozircha backend'da /creators endpoint yo'q.
   * Shu sababli postlar ichidan unique authorlarni yig'amiz.
   */
  const postsPage = await listPublicPostsSafe({
    page,
    page_size: 50,
    search: search || undefined,
    category: category || undefined,
  })

  const creatorMap = new Map<string, Creator>()

  for (const post of postsPage.items) {
    const author = post.author

    if (!author?.username) continue

    const existing = creatorMap.get(author.username)

    if (existing) {
      existing.post_count += 1
      continue
    }

    creatorMap.set(author.username, {
      uuid: author.username,
      username: author.username,
      slug: author.slug,
      full_name: author.full_name,
      avatar_url: author.avatar,
      bio: null,
      description: null,
      is_verified: author.is_verified,
      post_count: 1,
      views: 0,
      likes: 0,
    })
  }

  let creators = Array.from(creatorMap.values())

  /*
   * Author bo'yicha frontend search.
   */
  if (search) {
    const query = search.toLowerCase()

    creators = creators.filter((creator) => {
      return (
        creator.full_name.toLowerCase().includes(query) ||
        creator.username.toLowerCase().includes(query)
      )
    })
  }

  /*
   * Saralash.
   */
  creators.sort((a, b) => {
    if (sort === "newest") {
      return a.full_name.localeCompare(b.full_name)
    }

    return b.post_count - a.post_count
  })

  /*
   * Real stats from posts data.
   */
  // NOTE: views va likes faqat birinchi 50 postdan hisoblanadi —
  // backend /public/stats endpoint tayyor bo'lganda to'g'ri hisoblanadi
  const stats = {
    creators: String(creatorMap.size),
    posts: String(postsPage.total),
    views: null as null | string,  // tezda noto'g'ri qiymat ko'rsatmaslik uchun null
    likes: null as null | string,
  }

  const recommendedCreator = creators[0] ?? null

  return (
    <main className="min-h-screen bg-white pt-[76px]">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-7 lg:px-8 lg:py-9">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_290px]">
          {/* =========================================================
              MAIN
          ========================================================= */}

          <section className="min-w-0">
            {/* Page title */}
            <header>
              <h1 className="font-display text-[30px] font-bold tracking-[-0.035em] text-text-primary sm:text-[32px]">
                Yozuvchilar
              </h1>

              <p className="mt-2 text-[14px] leading-6 text-text-muted">
                Inkly&apos;da fikr ulashayotgan yozuvchilar bilan tanishing.
              </p>
            </header>

            {/* Search + sort */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <form
                action="/creators"
                method="GET"
                className="relative w-full sm:max-w-[360px]"
              >
                {category && (
                  <input
                    type="hidden"
                    name="category"
                    value={category}
                  />
                )}

                {sort && (
                  <input
                    type="hidden"
                    name="sort"
                    value={sort}
                  />
                )}

                <Search
                  size={17}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Yozuvchi qidirish..."
                  className="
                    h-[39px]
                    w-full
                    rounded-lg
                    border
                    border-border-default
                    bg-white
                    pl-10
                    pr-10
                    text-[13px]
                    text-[#222]
                    outline-none
                    transition
                    placeholder:text-[#8B929B]
                    focus:border-primary/50
                    focus:ring-2
                    focus:ring-inkly-orange/10
                  "
                />

                <button
                  type="submit"
                  aria-label="Qidirish"
                  className="
                    absolute
                    right-2
                    top-1/2
                    flex
                    h-7
                    w-7
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-md
                    text-[#56616D]
                    transition
                    hover:bg-inkly-orange-light
                    hover:text-primary
                  "
                >
                  <Search size={16} strokeWidth={1.8} />
                </button>
              </form>

              <CreatorSort
                sort={sort}
                search={search}
                category={category}
              />
            </div>

            {/* Categories */}
            <CategoryNavigation
              active={category}
              search={search}
              sort={sort}
            />

            {/* Stats */}
            <CreatorStats stats={stats} />

            {/* Creator cards */}
            {creators.length === 0 ? (
              <EmptyCreators search={search} />
            ) : (
              <section
                aria-label="Yozuvchilar ro'yxati"
                className="mt-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {creators.slice(0, 12).map((creator) => (
                    <CreatorCard
                      key={creator.uuid}
                      creator={creator}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Pagination */}
            {postsPage.total_pages > 1 && (
              <div className="mt-6 flex justify-center">
                <CreatorsPagination
                  page={postsPage.page}
                  totalPages={postsPage.total_pages}
                  search={search}
                  category={category}
                  sort={sort}
                />
              </div>
            )}
          </section>

          {/* =========================================================
              RIGHT SIDEBAR
          ========================================================= */}

          <aside className="hidden xl:block">
            <div className="sticky top-[100px] space-y-4">
              <CreatorFilters
                category={category}
                search={search}
                sort={sort}
              />

              {recommendedCreator && (
                <RecommendedCreator
                  creator={recommendedCreator}
                />
              )}

              <JoinCreatorCard />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

/* ================================================================
   SORT
================================================================ */

function CreatorSort({
  sort,
  search,
  category,
}: {
  sort: string
  search: string
  category: string
}) {
  const params = new URLSearchParams()

  if (search) {
    params.set("search", search)
  }

  if (category) {
    params.set("category", category)
  }

  const popularParams = new URLSearchParams(params)
  popularParams.set("sort", "popular")

  const newestParams = new URLSearchParams(params)
  newestParams.set("sort", "newest")

  return (
    <details className="relative self-end sm:self-auto">
      <summary
        className="
          flex
          h-[39px]
          w-[142px]
          cursor-pointer
          list-none
          items-center
          justify-between
          rounded-lg
          border
          border-border-default
          bg-white
          px-3.5
          text-[13px]
          font-medium
          text-text-primary
        "
      >
        <span>
          {sort === "newest" ? "Eng yangi" : "Eng faol"}
        </span>

        <ChevronDown
          size={15}
          strokeWidth={1.8}
        />
      </summary>

      <div
        className="
          absolute
          right-0
          top-[44px]
          z-30
          w-[142px]
          rounded-xl
          border
          border-border-default
          bg-white
          p-1.5
          shadow-[0_10px_30px_rgba(0,0,0,0.08)]
        "
      >
        <Link
          href={`/creators?${popularParams.toString()}`}
          className="
            block
            rounded-lg
            px-3
            py-2
            text-[12px]
            text-[#333]
            hover:bg-inkly-orange-light
          "
        >
          Eng faol
        </Link>

        <Link
          href={`/creators?${newestParams.toString()}`}
          className="
            block
            rounded-lg
            px-3
            py-2
            text-[12px]
            text-[#333]
            hover:bg-inkly-orange-light
          "
        >
          Eng yangi
        </Link>
      </div>
    </details>
  )
}

/* ================================================================
   CATEGORY NAVIGATION
================================================================ */

function CategoryNavigation({
  active,
  search,
  sort,
}: {
  active: string
  search: string
  sort: string
}) {
  return (
    <nav
      aria-label="Kategoriyalar"
      className="
        scrollbar-none
        mt-4
        flex
        gap-2
        overflow-x-auto
        pb-1
      "
    >
      {categories.map((item) => {
        const isActive =
          item === "Barchasi"
            ? !active
            : active === item

        const params = new URLSearchParams()

        if (item !== "Barchasi") {
          params.set("category", item)
        }

        if (search) {
          params.set("search", search)
        }

        if (sort) {
          params.set("sort", sort)
        }

        const query = params.toString()

        const href = query
          ? `/creators?${query}`
          : "/creators"

        return (
          <Link
            key={item}
            href={href}
            className={[
              "flex h-[35px] shrink-0 items-center rounded-lg border px-4 text-[12px] font-medium transition",
              isActive
                ? "border-[#FF9A68] bg-inkly-orange-light text-primary"
                : "border-border-default bg-white text-[#292929] hover:border-[#FFB58D] hover:bg-inkly-orange-light",
            ].join(" ")}
          >
            {item}
          </Link>
        )
      })}

      <button
        type="button"
        aria-label="Ko'proq kategoriyalar"
        className="
          flex
          h-[35px]
          w-[35px]
          shrink-0
          items-center
          justify-center
          rounded-lg
          text-[#555]
          hover:bg-bg-muted
        "
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

/* ================================================================
   STATS
================================================================ */

function CreatorStats({
  stats,
}: {
  stats: {
    creators: string
    posts: string
    views: string | null
    likes: string | null
  }
}) {
  const items = [
    {
      icon: Users,
      value: stats.creators,
      label: "Yozuvchi",
    },
    {
      icon: FileText,
      value: stats.posts,
      label: "Maqolalar",
    },
    // NOTE: views va likes backend stats endpoint tayyor bo'lguncha ko'rsatilmaydi
  ].filter(Boolean)

  return (
    <div
      className="
        mt-5
        grid
        grid-cols-2
        overflow-hidden
        rounded-xl
        border
        border-border-default
        bg-white
        shadow-[0_3px_12px_rgba(0,0,0,0.025)]
        sm:grid-cols-4
      "
    >
      {items.map((item, index) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className={[
              "flex min-h-[76px] items-center justify-center gap-3 px-4 py-3",
              index > 0
                ? "border-l border-border-default"
                : "",
              index >= 2
                ? "border-t border-border-default sm:border-t-0"
                : "",
            ].join(" ")}
          >
            <Icon
              size={27}
              strokeWidth={1.8}
              className="shrink-0 text-primary"
            />

            <div>
              <div className="text-[17px] font-bold tracking-[-0.02em] text-text-primary">
                {item.value}
              </div>

              <div className="mt-0.5 text-[11px] text-text-muted">
                {item.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ================================================================
   CREATOR CARD
================================================================ */

function CreatorCard({
  creator,
}: {
  creator: Creator
}) {
  const profileUrl = `/@${creator.username}`

  return (
    <article
      className="
        group
        flex
        min-h-[236px]
        flex-col
        rounded-xl
        border
        border-border-default
        bg-white
        p-4
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#DDD6CF]
        hover:shadow-[0_8px_25px_rgba(0,0,0,0.055)]
      "
    >
      {/* Profile */}
      <div className="flex items-center gap-3">
        <Link
          href={profileUrl}
          className="relative shrink-0"
        >
          <Avatar
            src={creator.avatar_url}
            name={creator.full_name}
            size={50}
          />

          <span
            className="
              absolute
              bottom-0
              right-0
              h-[10px]
              w-[10px]
              rounded-full
              border-2
              border-white
              bg-[#22B653]
            "
          />
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <Link
              href={profileUrl}
              className="
                truncate
                text-[14px]
                font-bold
                text-text-primary
                hover:text-primary
              "
            >
              {creator.full_name}
            </Link>

            {creator.is_verified && (
              <span
                className="
                  flex
                  h-3.5
                  w-3.5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-primary
                "
              >
                <Check
                  size={9}
                  strokeWidth={3}
                  className="text-white"
                />
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-[11px] text-text-muted">
            @{creator.username}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 min-h-[40px] text-[12px] leading-5 text-text-primary">
        {creator.description ||
          creator.bio ||
          "Texnologiya, dasturlash va foydali fikrlar haqida yozaman."}
      </p>

      {/* Metrics */}
      <div className="mt-auto pt-4">
        <div className="grid grid-cols-3 gap-2">
          <Metric
            icon={FileText}
            value={String(creator.post_count || 0)}
            label="Maqola"
          />

          {/* NOTE: views va likes backend /public/authors/:slug endpoint tayyor bo'lguncha ko'rsatilmaydi */}
        </div>

        <Link
          href={profileUrl}
          className="
            mt-3
            flex
            h-[31px]
            items-center
            justify-center
            rounded-md
            border
            border-[#FFBFA1]
            text-[11px]
            font-semibold
            text-primary
            transition
            hover:bg-inkly-orange-light
          "
        >
          Profilni ko&apos;rish
        </Link>
      </div>
    </article>
  )
}

/* ================================================================
   METRIC
================================================================ */

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof FileText
  value: string
  label: string
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <Icon
          size={13}
          strokeWidth={1.8}
          className="shrink-0 text-[#252B31]"
        />

        <span className="truncate text-[11px] font-medium text-text-primary">
          {value}
        </span>
      </div>

      <p className="mt-1 text-[10px] text-text-muted">
        {label}
      </p>
    </div>
  )
}

/* ================================================================
   FILTERS
================================================================ */

function CreatorFilters({
  category,
  search,
  sort,
}: {
  category: string
  search: string
  sort: string
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-border-default
        bg-white
        p-4
      "
    >
      <h2 className="text-[15px] font-bold text-text-primary">
        Filtrlar
      </h2>

      <FilterSelect
        label="Kategoriyalar"
        value={category || "Barchasi"}
        options={categories}
        search={search}
        sort={sort}
      />

      <FilterSelect
        label="Joylashuv"
        value="Barchasi"
        options={["Barchasi"]}
        search={search}
        sort={sort}
      />

      <FilterSelect
        label="Til"
        value="Barchasi"
        options={["Barchasi"]}
        search={search}
        sort={sort}
      />

      <div className="mt-4">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            className="mt-0.5 h-3.5 w-3.5 accent-inkly-orange"
          />

          <span>
            <span className="block text-[12px] font-medium text-[#303030]">
              Faol yozuvchilar
            </span>

            <span className="mt-1 block text-[10px] leading-4 text-text-muted">
              So&apos;nggi 30 kunda maqola yozganlar
            </span>
          </span>
        </label>
      </div>
    </div>
  )
}

/* ================================================================
   FILTER SELECT
================================================================ */

function FilterSelect({
  label,
  value,
  options,
  search,
  sort,
}: {
  label: string
  value: string
  options: string[]
  search: string
  sort: string
}) {
  return (
    <details className="group mt-4">
      <summary className="list-none cursor-pointer">
        <div className="mb-2 text-[11px] font-semibold text-[#292929]">
          {label}
        </div>

        <div
          className="
            flex
            h-[34px]
            items-center
            justify-between
            rounded-md
            border
            border-border-default
            px-3
            text-[11px]
            text-[#292929]
          "
        >
          <span className="truncate">
            {value}
          </span>

          <ChevronDown
            size={14}
            className="
              shrink-0
              transition-transform
              group-open:rotate-180
            "
          />
        </div>
      </summary>

      {options.length > 1 && (
        <div
          className="
            mt-1
            rounded-lg
            border
            border-border-default
            bg-white
            p-1
            shadow-lg
          "
        >
          {options.map((option) => {
            const params = new URLSearchParams()

            if (option !== "Barchasi") {
              params.set("category", option)
            }

            if (search) {
              params.set("search", search)
            }

            if (sort) {
              params.set("sort", sort)
            }

            const query = params.toString()

            return (
              <Link
                key={option}
                href={
                  query
                    ? `/creators?${query}`
                    : "/creators"
                }
                className="
                  block
                  rounded-md
                  px-2.5
                  py-2
                  text-[11px]
                  hover:bg-inkly-orange-light
                "
              >
                {option}
              </Link>
            )
          })}
        </div>
      )}
    </details>
  )
}

/* ================================================================
   RECOMMENDED CREATOR
================================================================ */

function RecommendedCreator({
  creator,
}: {
  creator: Creator
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[#F1D7C8]
        bg-inkly-orange-light
        p-5
      "
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-text-primary">
          Tavsiya etilgan yozuvchi
        </h2>

        <span
          aria-hidden="true"
          className="text-[20px] font-bold text-primary"
        >
          ✳
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center text-center">
        <div className="relative">
          <div className="rounded-full border-[2px] border-white p-1 shadow-sm">
            <Avatar
              src={creator.avatar_url}
              name={creator.full_name}
              size={76}
            />
          </div>

          <span
            className="
              absolute
              bottom-1
              right-1
              h-[13px]
              w-[13px]
              rounded-full
              border-2
              border-white
              bg-[#22B653]
            "
          />
        </div>

        <h3 className="mt-3 text-[14px] font-bold text-text-primary">
          {creator.full_name}
        </h3>

        <p className="mt-1 text-[11px] text-text-muted">
          @{creator.username}
        </p>

        <p className="mt-4 max-w-[210px] text-[11px] leading-5 text-[#4D545B]">
          {creator.description ||
            "Texnologiya, dasturlash va mahsuldorlik haqida yozaman."}
        </p>

        <Link
          href={`/@${creator.username}`}
          className="
            mt-4
            flex
            h-[34px]
            w-full
            items-center
            justify-center
            rounded-md
            bg-primary
            text-[11px]
            font-semibold
            text-white
            transition
            hover:bg-inkly-hover
          "
        >
          Profilni ko&apos;rish
        </Link>
      </div>
    </div>
  )
}

/* ================================================================
   JOIN CREATOR
================================================================ */

function JoinCreatorCard() {
  return (
    <div
      className="
        rounded-xl
        border
        border-border-default
        bg-white
        p-5
      "
    >
      <h2 className="text-[15px] font-bold text-text-primary">
        Yozuvchi bo&apos;ling
      </h2>

      <p className="mt-3 text-[11px] leading-5 text-[#5F6770]">
        Fikringizni minglab insonlar bilan ulashing.
        O&apos;z blogingizni yarating va o&apos;quvchilaringizni
        toping.
      </p>

      <Link
        href="/register"
        className="
          mt-4
          inline-flex
          h-[34px]
          items-center
          gap-2
          rounded-md
          border
          border-inkly-coral
          px-4
          text-[11px]
          font-semibold
          text-primary
          transition
          hover:bg-inkly-orange-light
        "
      >
        Boshlash

        <ArrowRight size={13} />
      </Link>
    </div>
  )
}

/* ================================================================
   EMPTY
================================================================ */

function EmptyCreators({
  search,
}: {
  search: string
}) {
  return (
    <div
      className="
        mt-5
        rounded-xl
        border
        border-dashed
        border-border-default
        bg-white
        px-6
        py-16
        text-center
      "
    >
      <Users
        size={34}
        strokeWidth={1.4}
        className="mx-auto text-[#B4B0AA]"
      />

      <h2 className="mt-4 text-[16px] font-semibold text-[#242424]">
        Yozuvchi topilmadi
      </h2>

      <p className="mt-2 text-[12px] text-text-muted">
        {search
          ? `"${search}" bo'yicha yozuvchilar topilmadi.`
          : "Hozircha yozuvchilar mavjud emas."}
      </p>

      {search && (
        <Link
          href="/creators"
          className="
            mt-5
            inline-flex
            h-9
            items-center
            rounded-lg
            bg-primary
            px-4
            text-[12px]
            font-semibold
            text-white
          "
        >
          Barchasini ko&apos;rish
        </Link>
      )}
    </div>
  )
}

/* ================================================================
   PAGINATION
================================================================ */

function CreatorsPagination({
  page,
  totalPages,
  search,
  category,
  sort,
}: {
  page: number
  totalPages: number
  search: string
  category: string
  sort: string
}) {
  const createUrl = (targetPage: number) => {
    const params = new URLSearchParams()

    params.set("page", String(targetPage))

    if (search) {
      params.set("search", search)
    }

    if (category) {
      params.set("category", category)
    }

    if (sort) {
      params.set("sort", sort)
    }

    return `/creators?${params.toString()}`
  }

  const pages: (number | "...")[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (page > 3) {
      pages.push("...")
    }

    const start = Math.max(2, page - 1)
    const end = Math.min(
      totalPages - 1,
      page + 1,
    )

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (page < totalPages - 2) {
      pages.push("...")
    }

    pages.push(totalPages)
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center gap-1"
    >
      <Link
        href={createUrl(Math.max(1, page - 1))}
        aria-label="Oldingi sahifa"
        className={[
          "flex h-[32px] w-[32px] items-center justify-center rounded-md border border-border-default bg-white",
          page <= 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-inkly-orange-light",
        ].join(" ")}
      >
        <ChevronLeft size={15} />
      </Link>

      {pages.map((item, index) =>
        item === "..." ? (
          <span
            key={`dots-${index}`}
            className="
              flex
              h-[32px]
              w-[28px]
              items-center
              justify-center
              text-[11px]
              text-text-muted
            "
          >
            ...
          </span>
        ) : (
          <Link
            key={item}
            href={createUrl(item)}
            className={[
              "flex h-[32px] min-w-[32px] items-center justify-center rounded-md px-2 text-[11px] font-medium transition",
              item === page
                ? "bg-primary text-white"
                : "border border-transparent text-[#242424] hover:bg-inkly-orange-light",
            ].join(" ")}
          >
            {item}
          </Link>
        ),
      )}

      <Link
        href={createUrl(
          Math.min(totalPages, page + 1),
        )}
        aria-label="Keyingi sahifa"
        className={[
          "flex h-[32px] w-[32px] items-center justify-center rounded-md border border-border-default bg-white",
          page >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-inkly-orange-light",
        ].join(" ")}
      >
        <ChevronRight size={15} />
      </Link>
    </nav>
  )
}

/* ================================================================
   HELPERS
================================================================ */

function formatNumber(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }

  return String(value)
}