import { Bell, Heart, LayoutTemplate, Send, UserRound } from "lucide-react"
import { Container } from "@/components/layout/containers"

const features = [
  {
    icon: LayoutTemplate,
    title: "Shaxsiy blog sahifasi",
    text: "inkly.uz/@username — o'zingizning blog manzilingiz. Avatar, bio, cover, maqolalar, followerlar. Ko'rinishini to'liq sozlash — 20+ tayyor mavzu.",
    palette: {
      iconBg: "bg-violet-500/15",
      iconFg: "text-violet-400",
      glow: "rgba(139,92,246,0.10)",
      glowPos: "85% 15%",
      hoverShadow: "hover:shadow-[0_4px_24px_rgba(139,92,246,0.12)]",
      hoverBorder: "hover:border-violet-500/25",
    },
    large: true,
  },
  {
    icon: Send,
    title: "Telegram bilan integratsiya",
    text: "Telegram orqali kirish. Maqolalarni bir tugma bilan Telegram kanalingizga nashr qilish.",
    palette: {
      iconBg: "bg-sky-500/15",
      iconFg: "text-sky-400",
      glow: "rgba(14,165,233,0.10)",
      glowPos: "20% 80%",
      hoverShadow: "hover:shadow-[0_4px_24px_rgba(14,165,233,0.12)]",
      hoverBorder: "hover:border-sky-500/25",
    },
  },
  {
    icon: Heart,
    title: "Jamiyat",
    text: "Mualliflarni follow qiling, maqolalarga like va izoh qoldiring. Yangi maqola va mualliflarni kashf qiling.",
    palette: {
      iconBg: "bg-rose-500/15",
      iconFg: "text-rose-400",
      glow: "rgba(244,63,94,0.10)",
      glowPos: "15% 85%",
      hoverShadow: "hover:shadow-[0_4px_24px_rgba(244,63,94,0.12)]",
      hoverBorder: "hover:border-rose-500/25",
    },
  },
  {
    icon: Bell,
    title: "Bildirishnomalar",
    text: "Yangi like, izoh va followerlar haqida xabar oling. Hech narsani o'tkazib yubormaysiz.",
    palette: {
      iconBg: "bg-emerald-500/15",
      iconFg: "text-emerald-400",
      glow: "rgba(16,185,129,0.10)",
      glowPos: "80% 80%",
      hoverShadow: "hover:shadow-[0_4px_24px_rgba(16,185,129,0.12)]",
      hoverBorder: "hover:border-emerald-500/25",
    },
  },
]

function WritingMockup() {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_rgba(255,106,0,0.10)]">
      <div className="flex h-9 items-center gap-1.5 border-b border-white/10 bg-white/5 px-4">
        <span className="h-2 w-2 rounded-full bg-inkly-coral" />
        <span className="h-2 w-2 rounded-full bg-warning" />
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className="ml-2 h-[18px] flex-1 rounded bg-white/10 px-2 text-[10px] leading-[18px] text-white/40">
          inkly.uz/editor
        </span>
      </div>
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 rounded-full bg-white/15" />
        <div className="h-2.5 w-full rounded-full bg-white/8" />
        <div className="h-2.5 w-5/6 rounded-full bg-white/8" />
        <div className="mt-3 h-2.5 w-full rounded-full bg-white/8" />
        <div className="h-2.5 w-4/5 rounded-full bg-white/8" />
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-inkly-orange/20 px-3 py-1 text-[10px] font-semibold text-inkly-coral">
            Saqlandi ✓
          </span>
          <span className="text-[10px] text-white/40">hozir</span>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  palette,
}: {
  icon: React.ElementType
  title: string
  text: string
  palette: (typeof features)[number]["palette"]
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 ${palette.hoverShadow} ${palette.hoverBorder}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${palette.glowPos}, ${palette.glow} 0%, transparent 65%)`,
        }}
      />
      <div className="relative">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${palette.iconBg}`}>
          <Icon className={`h-5 w-5 ${palette.iconFg}`} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <h3 className="font-display mt-4 text-[17px] font-medium tracking-[-0.01em] text-white">
          {title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-white/60">{text}</p>
      </div>
    </div>
  )
}

export function FeaturesSection() {
  const largeFirst = features[0]
  const small = features.slice(1)

  return (
    <section
      aria-labelledby="features-heading"
      className="relative overflow-hidden bg-[#141414] px-4 py-20 sm:px-6 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 -z-10 h-[480px] w-[480px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,106,0,0.15) 0%, rgba(255,138,61,0.06) 50%, transparent 75%)",
        }}
      />

      <Container variant="marketing">
        <div className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Imkoniyatlar
            </p>
            <h2
              id="features-heading"
              className="font-display mt-3 text-balance text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-white sm:text-[34px] lg:text-[38px]"
            >
              Yozishdan auditoriyagacha —{" "}
              <span className="bg-gradient-to-r from-inkly-orange to-inkly-coral bg-clip-text text-transparent">
                kerak bo&apos;lgan narsalar
              </span>
            </h2>
          </div>
          <div className="relative max-w-xs shrink-0 pt-6 lg:pt-0">
            <span className="absolute left-0 top-0 h-[3px] w-10 rounded-full bg-gradient-to-r from-inkly-orange to-inkly-coral lg:hidden" />
            <p className="text-[14px] leading-relaxed text-white/60 lg:text-[15px]">
              Inkly yozuvchi sifatida kerakli barcha vositani yagona, qulay muhitda taqdim etadi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Katta karta: Shaxsiy blog sahifasi */}
          <div
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 sm:col-span-2 lg:col-span-2 transition-all duration-300 ${largeFirst.palette.hoverShadow} ${largeFirst.palette.hoverBorder}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: `radial-gradient(circle at ${largeFirst.palette.glowPos}, ${largeFirst.palette.glow} 0%, transparent 60%)`,
              }}
            />
            <div className="relative">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${largeFirst.palette.iconBg}`}>
                <largeFirst.icon className={`h-5 w-5 ${largeFirst.palette.iconFg}`} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="font-display mt-4 text-[17px] font-medium tracking-[-0.01em] text-white">
                {largeFirst.title}
              </h3>
              <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-white/60">
                {largeFirst.text}
              </p>
              <WritingMockup />
            </div>
          </div>

          {/* Kichik kartalar */}
          {small.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              text={feature.text}
              palette={feature.palette}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}