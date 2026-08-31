"use client"

import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { Container } from "@/components/layout/containers"
import { Button } from "@/components/ui/button"

export function WaitlistSection() {
  return (
    <section
      id="waitlist-section"
      className="relative overflow-hidden border-t border-border-default px-4 py-20 sm:px-6 sm:py-28"
    >
      <Container variant="marketing">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Badge — orange accent */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-inkly-orange-light px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-primary">
            <Sparkles size={14} className="text-primary" />
            Tez kunda ishga tushadi
          </div>

          <h2 className="font-display text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-balance text-text-primary sm:text-[34px] lg:text-[38px]">
            Username ni hoziroq{" "}
            <span className="text-primary">band qiling</span>
          </h2>

          <p className="mx-auto mt-5 max-w-sm text-[15px] leading-relaxed text-text-secondary sm:text-base">
            Inkly ishga tushganda birinchilar qatorida bo&apos;ling.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg" withArrow>
                Ro&apos;yxatdan o&apos;tish
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Tizimga kirish
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-text-muted">
            Spam yo&apos;q. Faqat ishga tushganda bir marta xabar beramiz.
          </p>
        </div>
      </Container>
    </section>
  )
}