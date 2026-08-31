"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Globe } from "lucide-react"

export function HandleClaim({ className }: { className?: string }) {
  return (
    <form action="/register" className={className}>
      <div className="flex w-full max-w-lg items-center gap-2 rounded-2xl border border-border-default bg-white p-1.5 shadow-lg shadow-text-primary/5 transition-colors focus-within:border-primary">
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-3">
          <Globe size={18} className="shrink-0 text-text-muted" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 items-baseline">
            <span className="shrink-0 text-sm font-medium text-text-primary leading-none" aria-hidden="true">
              inkly.uz/@
            </span>
            <input
              type="text"
              name="username"
              placeholder="username"
              autoComplete="off"
              spellCheck={false}
              pattern="[a-zA-Z0-9_]{3,30}"
              title="3-30 ta harf, raqam yoki pastki chiziq"
              aria-label="Foydalanuvchi nomi"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-primary placeholder:text-primary/40 outline-none"
            />
          </div>
        </div>

        <MagneticSubmitButton />
      </div>

      <style jsx global>{`
        @keyframes inkly-shimmer-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </form>
  )
}

function MagneticSubmitButton() {
  const ref = useRef<HTMLButtonElement>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  const handlePointerDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const id = Date.now()
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 650)
  }

  return (
    <motion.button
      ref={ref}
      type="submit"
      onMouseDown={handlePointerDown}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_4px_14px_rgba(255,106,0,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
    >
      {/* Doimiy shimmer */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
          backgroundSize: "200% 100%",
          animation: "inkly-shimmer-sweep 2.6s linear infinite",
        }}
      />

      {/* Ustki shine */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/15 to-transparent"
      />

      {/* Ripple */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-white/50"
          style={{ left: r.x, top: r.y, translateX: "-50%", translateY: "-50%" }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 160, height: 160, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}

      <span className="relative z-10">Boshlash</span>

      {/* O'q — doimiy float */}
      <motion.span
        className="relative z-10 grid h-[14px] w-[14px] place-items-center"
        animate={{ y: [0, -2.5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowRight size={14} aria-hidden="true" />
      </motion.span>
    </motion.button>
  )
}