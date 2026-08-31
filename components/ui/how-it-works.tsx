import { BookOpen, PenLine, Send, UserRound } from "lucide-react"
import { Container } from "@/components/layout/containers"

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Ro'yxatdan o'ting",
    text: "Email, Google yoki Telegram orqali.",
    palette: {
      iconBg: "bg-violet-50",
      iconFg: "text-violet-600",
      numberColor: "text-violet-200",
      glow: "rgba(139,92,246,0.07)",
      glowPos: "20% 30%",
      hoverShadow: "hover:shadow-[0_4px_24px_rgba(139,92,246,0.09)]",
      hoverBorder: "hover:border-violet-200",
    },
  },
  {
    number: "02",
    icon: PenLine,
    title: "Profilingizni yarating",
    text: "Avatar, bio va blog sahifangiz ko'rinishini sozlang.",
    palette: {
      iconBg: "bg-inkly-orange-light",
      iconFg: "text-primary",
      numberColor: "text-primary/20",
      glow: "rgba(255,106,0,0.08)",
      glowPos: "80% 20%",
      hoverShadow: "hover:shadow-[0_4px_24px_rgba(255,106,0,0.10)]",
      hoverBorder: "hover:border-primary/20",
    },
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Maqola yozing",
    text: "Editorni oching, yozing, rasmlar qo'shing.",
    palette: {
      iconBg: "bg-emerald-50",
      iconFg: "text-emerald-600",
      numberColor: "text-emerald-200",
      glow: "rgba(16,185,129,0.07)",
      glowPos: "20% 80%",
      hoverShadow: "hover:shadow-[0_4px_24px_rgba(16,185,129,0.09)]",
      hoverBorder: "hover:border-emerald-200",
    },
  },
  {
    number: "04",
    icon: Send,
    title: "Nashr qiling",
    text: "Maqolangizni dunyoga yetkazing.",
    palette: {
      iconBg: "bg-sky-50",
      iconFg: "text-sky-600",
      numberColor: "text-sky-200",
      glow: "rgba(14,165,233,0.07)",
      glowPos: "80% 80%",
      hoverShadow: "hover:shadow-[0_4px_24px_rgba(14,165,233,0.09)]",
      hoverBorder: "hover:border-sky-200",
    },
  },
]

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="border-t border-border-default bg-white px-4 py-20 sm:px-6 sm:py-28"
    >
      <Container variant="marketing">
        <div className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Qanday ishlaydi
            </p>
            <h2
              id="how-heading"
              className="font-display mt-3 text-balance text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary sm:text-[34px] lg:text-[38px]"
            >
              Boshlash juda{" "}
              <span className="bg-gradient-to-r from-inkly-orange to-inkly-coral bg-clip-text text-transparent">
                oddiy.
              </span>
            </h2>
          </div>
          <div className="relative max-w-xs shrink-0 pt-6 lg:pt-0">
            <span className="absolute left-0 top-0 h-[3px] w-10 rounded-full bg-gradient-to-r from-inkly-orange to-inkly-coral lg:hidden" />
            <p className="text-[14px] leading-relaxed text-text-secondary lg:text-[15px]">
              Texnik bilim shart emas — faqat yozing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className={`group relative overflow-hidden rounded-2xl border border-border-default bg-bg-subtle p-6 transition-all duration-300 ${step.palette.hoverShadow} ${step.palette.hoverBorder}`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at ${step.palette.glowPos}, ${step.palette.glow} 0%, transparent 65%)`,
                }}
              />

              <span
                aria-hidden="true"
                className={`font-display pointer-events-none absolute right-5 top-4 select-none text-[64px] font-bold leading-none tracking-tight ${step.palette.numberColor}`}
              >
                {step.number}
              </span>

              <div className="relative">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${step.palette.iconBg}`}>
                  <step.icon
                    className={`h-5 w-5 ${step.palette.iconFg}`}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-display mt-5 text-[17px] font-medium tracking-[-0.01em] text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}