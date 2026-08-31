"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { WaveBackground } from "@/components/ui/wave-background"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const bounceDown: Variants = {
  initial: { y: 0, opacity: 0.4 },
  animate: {
    y: 6,
    opacity: 1,
    transition: { duration: 0.7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
  },
}


function TextReadabilityScrim() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[5] hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse 46% 62% at 24% 46%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.68) 45%, rgba(255,255,255,0.15) 72%, transparent 88%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[5] lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.72) 55%, rgba(255,255,255,0.30) 100%)",
        }}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO VISUAL — uchta haqiqiy foto + bitta statistik chip, umumiy konteyner ichida
// ─────────────────────────────────────────────────────────────────────────────
const HERO_IMAGE_MAIN =
  "https://images.unsplash.com/photo-1499914485622-a88fac536970?q=80&w=900&auto=format&fit=crop&crop=faces"
const HERO_IMAGE_ACCENT =
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=700&auto=format&fit=crop"
const HERO_IMAGE_BOTTOM =
  "https://images.unsplash.com/photo-1579017308347-e53e0d2fc5e9?q=80&w=700&auto=format&fit=crop"

function HeroVisual() {
  const reducedMotion = useReducedMotion()

  const floatMain = reducedMotion
    ? {}
    : { y: [0, -12, 0], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const } }
  const floatAccent = reducedMotion
    ? {}
    : { y: [0, 10, 0], transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 } }
  const floatBottom = reducedMotion
    ? {}
    : { y: [0, -8, 0], transition: { duration: 5.2, repeat: Infinity, ease: "easeInOut" as const, delay: 0.8 } }
  const floatChip = reducedMotion
    ? {}
    : { y: [0, 8, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.9 } }

  return (
    <div className="pointer-events-none relative flex h-full w-full items-center justify-center" aria-hidden="true">
      {/* UMUMIY KONTEYNER — barcha rasm va chiplarni birlashtiruvchi div */}
      <div className="relative h-[660px] w-[500px]">
        {/* Orqa fon dog'i — chuqurlik uchun */}
        <div
          className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-[42%_58%_53%_47%/48%_44%_56%_52%] opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,106,0,0.22) 0%, rgba(255,138,61,0.08) 55%, transparent 75%)",
          }}
        />

        {/* ACCENT FOTO — asosiysi ortida, biroz qiyshaygan, yuqori-o'ngda */}
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: 6 }}
          animate={{ opacity: 1, y: 0, rotate: 6, ...floatAccent }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          className="absolute right-0 top-4 h-[260px] w-[210px] overflow-hidden rounded-[1.5rem] border border-white/70 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.28)]"
        >
          <img
            src={HERO_IMAGE_ACCENT}
            alt="Ijodkor noutbukda ishlamoqda"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* ASOSIY FOTO KARTA */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3, ...floatMain }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="absolute left-0 top-16 h-[430px] w-[320px] overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_40px_90px_-25px_rgba(0,0,0,0.30)]"
        >
          <img
            src={HERO_IMAGE_MAIN}
            alt="Blog yozayotgan foydalanuvchi"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </motion.div>

        {/* PASTKI FOTO — yangi, asosiy karta ostida biroz o'ngga siljigan */}
        <motion.div
          initial={{ opacity: 0, y: 26, rotate: -8 }}
          animate={{ opacity: 1, y: 0, rotate: -8, ...floatBottom }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className="absolute bottom-6 right-2 h-[190px] w-[220px] overflow-hidden rounded-[1.5rem] border border-white/70 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.28)]"
        >
          <img
            src={HERO_IMAGE_BOTTOM}
            alt="Daftarga yozuv yozish"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
export function Hero() {
  const reducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const initial = !mounted || reducedMotion ? "visible" : "hidden"

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative isolate border-b border-border-default"
    >
      <WaveBackground className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" />
      <TextReadabilityScrim />

      <div
        className="
          relative z-10 mx-auto flex max-w-[1280px]
          flex-col items-start justify-center
          min-h-[100svh]
          px-5 pt-24 pb-16
          sm:px-7 sm:pt-28 sm:pb-20
          lg:min-h-screen lg:flex-row lg:items-center lg:justify-between
          lg:gap-8 lg:px-8 lg:pb-24 lg:pt-0
        "
      >
        <motion.div
          className="relative w-full max-w-[580px] lg:max-w-[620px]"
          variants={container}
          initial={initial}
          animate="visible"
        >
          {/* BADGE */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-inkly-orange-light px-3.5 py-1.5 text-[12px] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Yangi platforma
            </span>
          </motion.div>

          {/* TITLE */}
          <motion.h1
            id="hero-title"
            variants={fadeUp}
            className="
              font-display font-extrabold leading-[1.02] tracking-[-0.03em] text-text-primary
              text-[48px]
              sm:text-[64px] sm:leading-[1.0]
              lg:text-[82px] xl:text-[92px]
            "
          >
            Yozing.
            <br />
            Nashr&nbsp;qiling.
            <br />
            <span className="text-primary">Ifoda&nbsp;eting.</span>
          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p
            variants={fadeUp}
            className="
              mt-5 max-w-[420px]
              text-[16px] leading-[1.7] text-text-primary/65
              sm:mt-6 sm:text-[17px]
              lg:mt-7 lg:text-[18px] lg:text-text-secondary
            "
          >
            Maqola, blog va g&apos;oyalaringizni bitta zamonaviy
            platformada yarating, nashr qiling va auditoriyangiz
            bilan ulashing.
          </motion.p>
        </motion.div>

        {/* O'NG TOMON — faqat lg+ */}
        <div className="hidden h-[600px] w-[480px] shrink-0 lg:block">
          <HeroVisual />
        </div>
      </div>

      {/* SCROLL INDICATOR — faqat lg+ */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center lg:flex"
      >
        <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-text-muted">Pastga</span>
        <motion.div
          variants={bounceDown}
          initial="initial"
          animate={reducedMotion ? "initial" : "animate"}
          className="mt-2 flex flex-col items-center"
        >
          <ChevronDown size={25} className="text-primary" strokeWidth={2} />
          <ChevronDown size={25} className="-mt-2.5 text-primary/40" strokeWidth={2} />
        </motion.div>
      </motion.div>
    </section>
  )
}