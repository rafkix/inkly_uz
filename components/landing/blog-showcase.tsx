import type { ReactNode } from "react"
import { Lock } from "lucide-react"
import { Container } from "@/components/layout/containers"

/**
 * Static shell — renders instantly, no data dependency. The post grid
 * itself is passed in as children from an async component wrapped in
 * <Suspense> (see BlogShowcasePosts + app/(marketing)/page.tsx), so a
 * slow/unreachable backend only ever stalls this one section, never
 * the whole homepage behind the route-level loading.tsx.
 */
export function BlogShowcase({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="blog-showcase-heading" className="border-t border-border-default bg-bg-muted/40 px-4 py-20 sm:px-6 sm:py-28">
      <Container variant="marketing">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Blog</p>
          <h2
            id="blog-showcase-heading"
            className="font-display mt-2 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-balance text-text-primary sm:text-[34px] lg:text-[38px]"
          >
            Mana, Inkly&apos;da yozilayotgan haqiqiy maqolalar
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary sm:text-base">
            Platformadagi eng so&apos;nggi maqolalar — muallif ismi, sarlavha va o&apos;qish vaqti.
          </p>
        </div>

        {/* Browser-chrome frame around real published posts */}
        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-border-default bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04),0_20px_48px_rgba(20,20,20,0.08)]">
          <div className="flex h-11 items-center gap-2 border-b border-border-default bg-bg-muted/60 px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-inkly-coral" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <div className="ml-3 flex flex-1 items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11.5px] text-text-muted">
              <Lock size={10} />
              <span>inkly.uz/posts</span>
            </div>
          </div>

          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </Container>
    </section>
  )
}