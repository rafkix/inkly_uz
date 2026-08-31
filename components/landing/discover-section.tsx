import { Compass, Flame, Users, LayoutGrid } from "lucide-react"
import { Container } from "@/components/layout/containers"

const items = [
  {
    icon: Flame,
    title: "Yangi maqolalar",
    text: "Eng so'nggi nashr qilingan maqolalarni ko'ring.",
    palette: { iconBg: "bg-inkly-orange-light", iconFg: "text-primary" },
  },
  {
    icon: Compass,
    title: "Mashhur postlar",
    text: "Ko'p reaksiya olgan va o'qilgan maqolalar.",
    palette: { iconBg: "bg-rose-50", iconFg: "text-rose-500" },
  },
  {
    icon: Users,
    title: "Mualliflar",
    text: "Platformadagi faol mualliflarni ko'ring va ularni follow qiling.",
    palette: { iconBg: "bg-violet-50", iconFg: "text-violet-600" },
  },
  {
    icon: LayoutGrid,
    title: "Kategoriyalar",
    text: "Texnologiya, Dasturlash, Hayot, Ta'lim, San'at va boshqa mavzular bo'yicha maqolalar.",
    palette: { iconBg: "bg-emerald-50", iconFg: "text-emerald-600" },
  },
]

export function DiscoverSection() {
  return (
    <section
      aria-labelledby="discover-heading"
      className="border-t border-border-default bg-bg-muted/40 px-4 py-20 sm:px-6 sm:py-28"
    >
      <Container variant="marketing">
        <div className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Discover
            </p>
            <h2
              id="discover-heading"
              className="font-display mt-3 text-balance text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary sm:text-[34px] lg:text-[38px]"
            >
              Yangi g&apos;oyalar va mualliflarni{" "}
              <span className="bg-gradient-to-r from-inkly-orange to-inkly-coral bg-clip-text text-transparent">
                kashf qiling
              </span>
            </h2>
          </div>
          <div className="relative max-w-xs shrink-0 pt-6 lg:pt-0">
            <span className="absolute left-0 top-0 h-[3px] w-10 rounded-full bg-gradient-to-r from-inkly-orange to-inkly-coral lg:hidden" />
            <p className="text-[14px] leading-relaxed text-text-secondary lg:text-[15px]">
              Inkly&apos;da minglab maqolalar va mualliflar bor. Sizga qiziq bo&apos;lgan
              kontentni osongina toping.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-border-default bg-white p-6 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(20,20,20,0.06)] hover:border-primary/20"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.palette.iconBg}`}>
                <item.icon className={`h-5 w-5 ${item.palette.iconFg}`} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="font-display mt-4 text-[17px] font-medium tracking-[-0.01em] text-text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
