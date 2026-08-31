import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/layout/containers"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/ui/logo"

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate overflow-hidden px-4 py-20 sm:px-6 sm:py-28"
      style={{ background: "linear-gradient(150deg, var(--color-text-primary) 0%, var(--color-text-primary) 100%)" }}
    >
      {/* Ambient glows — same treatment as the login/register brand panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,106,0,0.20) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,138,61,0.12) 0%, transparent 70%)" }}
      />

      <Container variant="marketing" className="relative z-10">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <LogoMark size={30} className="text-white" />
          <h2
            id="cta-heading"
            className="font-display mt-6 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-balance text-white sm:text-[34px] lg:text-[38px]"
          >
            Endi sizning{" "}
            <span
              style={{
                background: "linear-gradient(90deg, var(--color-inkly-orange), var(--color-inkly-coral))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              navbatingiz.
            </span>
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/60 sm:text-base">
            Inkly&apos;da o&apos;z maqolangizni yozing, shaxsiy blogingizni yarating va auditoriyangizni shakllantiring. Bepul.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button variant="primary" size="lg" className="gap-2">
                Yozishni boshlash
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="onDark" size="lg">
                Tizimga kirish
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
