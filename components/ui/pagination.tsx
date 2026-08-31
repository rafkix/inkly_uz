import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  totalPages: number
  /** Masalan: "/posts" yoki "/categories/texnologiya" */
  basePath: string
  /** Qo'shimcha query parametrlar (search kabi) */
  query?: Record<string, string | undefined>
}

function hrefFor(basePath: string, page: number, query?: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

const arrow =
  "inline-flex size-9 items-center justify-center rounded-control border border-border text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring/30"

export function Pagination({ page, totalPages, basePath, query }: PaginationProps) {
  if (totalPages <= 1) return null

  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Sahifalar">
      {prevDisabled ? (
        <span className={cn(arrow, "opacity-40")} aria-hidden="true">
          <ChevronLeft size={16} />
        </span>
      ) : (
        <Link
          href={hrefFor(basePath, page - 1, query)}
          className={cn(arrow, "hover:bg-accent hover:border-primary hover:text-primary")}
          aria-label="Oldingi sahifa"
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      <span className="text-sm text-text-secondary">
        {page} / {totalPages}
      </span>

      {nextDisabled ? (
        <span className={cn(arrow, "opacity-40")} aria-hidden="true">
          <ChevronRight size={16} />
        </span>
      ) : (
        <Link
          href={hrefFor(basePath, page + 1, query)}
          className={cn(arrow, "hover:bg-accent hover:border-primary hover:text-primary")}
          aria-label="Keyingi sahifa"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  )
}
