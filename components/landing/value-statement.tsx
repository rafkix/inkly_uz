import { Heart, MessageCircle, PenLine, User, Compass, Share2, Sparkles } from "lucide-react"
import { Container } from "@/components/layout/containers"

// ─────────────────────────────────────────────────────────────────────────────
// ValueStatement — Inkly landing page uchun "nega Inkly" bo'limi.
// Asymmetric editorial composition, Inkly orange oilasidan rang urg'usi
// bilan (badge, icon doiralar, orqa fon nurlanishi, accent chiziqlar).
// ─────────────────────────────────────────────────────────────────────────────

const VALUES = [
  {
    title: "Yozing",
    description: "Qulay editor orqali o'z uslubingizda maqola yarating.",
    icon: PenLine,
    bg: "bg-inkly-orange-light",
    fg: "text-primary",
  },
  {
    title: "Egalik qiling",
    description: "Yozuvlaringizni shaxsiy profilingizda jamlang.",
    icon: User,
    bg: "bg-inkly-peach",
    fg: "text-inkly-orange-dark",
  },
  {
    title: "Ulashing",
    description: "Telegram va boshqa kanallar orqali oson ulashing.",
    icon: Share2,
    bg: "bg-inkly-orange-light",
    fg: "text-primary",
  },
  {
    title: "Kashf eting",
    description: "Boshqa mualliflarni o'qing va kuzating.",
    icon: Compass,
    bg: "bg-inkly-peach",
    fg: "text-inkly-orange-dark",
  },
]

function ArticlePreviewMockup() {
  return (
    <div className="relative">
      {/* Orqa fon nurlanishi — karta ortida rang chuqurligi */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,106,0,0.16) 0%, rgba(255,138,61,0.08) 45%, transparent 72%)",
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-border-default bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04),0_24px_56px_rgba(255,106,0,0.12)]">
        <div className="flex h-11 items-center gap-2 border-b border-border-default bg-bg-muted/60 px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-inkly-coral" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning" />
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <div className="ml-3 flex flex-1 items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11.5px] text-text-muted">
            inkly.uz/@diyor
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-inkly-orange to-inkly-coral text-sm font-semibold text-white">
                D
              </div>
              <div className="text-sm leading-tight">
                <p className="font-medium text-text-primary">Diyor</p>
                <p className="text-text-muted">6 min read · Technology</p>
              </div>
            </div>
            <span className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-inkly-orange/30">
              + Follow
            </span>
          </div>

          <p className="font-display mt-6 text-[24px] font-medium leading-[1.3] tracking-[-0.02em] text-text-primary sm:text-[28px]">
            Men dasturlashni o&apos;rganishda tushungan 5 ta muhim narsa
          </p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Har bir xato — bu keyingi qadam uchun kerakli ma&apos;lumot. Shu haqda
            o&apos;ylab ko&apos;rganingizda...
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-border-default pt-4 text-sm text-text-muted">
            <span className="rounded-full bg-inkly-orange-light px-3 py-1 font-semibold text-inkly-orange-dark">
              #programming
            </span>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-medium text-red-500">
                <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
                24
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-text-secondary">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                8
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ValueStatement() {
  return (
    <section
      aria-labelledby="value-statement-heading"
      className="relative overflow-hidden bg-bg-muted/40 px-4 py-20 sm:px-6 sm:py-28"
    >
      {/* Orqa fon — yumshoq orange nurlanish, hero'dagi kabi brend ranggi */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 -z-10 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,106,0,0.10) 0%, rgba(255,138,61,0.05) 50%, transparent 75%)",
        }}
      />

      <Container variant="marketing">
        {/* ── Asymmetric composition: chap statement / o'ng article vizual ── */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">

            <h2
              id="value-statement-heading"
              className="font-display mt-5 text-balance text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary sm:text-[34px] lg:text-[38px]"
            >
              Har bir fikr{" "}
              <span className="bg-gradient-to-r from-inkly-orange to-inkly-coral bg-clip-text text-transparent">
                kim uchundir
              </span>{" "}
              qiziq bo&apos;lishi mumkin.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-text-secondary sm:text-base">
              Inkly — fikrlaringiz, bilimlaringiz va tajribangizni yozish, saqlash va
              boshqalar bilan ulashish uchun yaratilgan zamonaviy publishing platforma.
            </p>

            <div className="relative mt-8 pt-8">
              <span className="absolute left-0 top-0 h-[3px] w-12 rounded-full bg-gradient-to-r from-inkly-orange to-inkly-coral" />
              <p className="font-display text-[20px] font-medium leading-[1.3] tracking-[-0.02em] text-text-primary">
                Sizga professional yozuvchi bo&apos;lish shart emas.
              </p>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-text-secondary">
                Biror narsani bilsangiz, boshdan kechirgan bo&apos;lsangiz yoki biror
                narsa haqida o&apos;z fikringiz bo&apos;lsa — uni yozishga arziydi.
              </p>
            </div>
          </div>

          <div className="lg:pt-4">
            <ArticlePreviewMockup />
          </div>
        </div>

        {/* ── 4 ta qiymat — rangli icon doiralar bilan ─────────────────── */}
        <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-10 pt-14 sm:grid-cols-2 lg:mt-28 lg:grid-cols-4 lg:pt-16">
          {VALUES.map((value) => (
            <div key={value.title}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${value.bg}`}>
                <value.icon className={`h-5 w-5 ${value.fg}`} aria-hidden="true" strokeWidth={1.8} />
              </div>
              <h3 className="font-display mt-4 text-[17px] font-medium tracking-[-0.01em] text-text-primary">
                {value.title}
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-text-secondary">
                {value.description}
              </p>
            </div>
          ))}
        </div>


        {/* ── Yopuvchi statement — CTA'siz, 1 qator ────────────────────── */}
        <div className="relative mt-20 overflow-hidden rounded-3xl bg-inkly-orange-light px-8 py-7 text-center sm:px-10 sm:py-8 lg:mt-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-70 blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(255,106,0,0.20) 0%, transparent 70%)",
            }}
          />
          <p className="font-display relative text-nowrap text-[22px] font-medium leading-[1.3] tracking-[-0.02em] text-text-primary sm:text-[28px] lg:text-[32px]">
            Yaxshi fikr jim qolmasligi kerak. Uni yozing — odamlar o&apos;qisin.
          </p>
        </div>
      </Container>
    </section>
  )
}