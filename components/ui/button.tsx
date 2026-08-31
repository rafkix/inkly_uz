"use client"

import { forwardRef, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LoadingDots } from "@/components/ui/loading-dots"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link" | "onDark"
  size?: "sm" | "md" | "lg" | "icon"
  loading?: boolean
  children: ReactNode
  /** Endi barcha variantlarda ishlaydi — hover'da o'ngga siljiydigan strelka */
  withArrow?: boolean
}

const variants = {
  primary: "bg-primary text-primary-foreground font-semibold hover:bg-primary-hover",
  secondary: "bg-foreground text-background hover:bg-foreground/90",
  outline: "bg-transparent border border-border text-foreground hover:bg-accent hover:border-primary hover:text-primary",
  ghost: "bg-transparent border border-transparent text-foreground hover:bg-accent hover:text-primary",
  destructive: "bg-transparent border border-destructive text-destructive hover:bg-destructive/5",
  link: "bg-transparent p-0 h-auto text-primary underline-offset-4 hover:underline",
  onDark: "bg-transparent border border-white/20 text-white hover:bg-white/10",
}

const sizes = {
  sm: "px-3 py-1.5 text-sm min-h-9",
  md: "px-5 py-2.5 text-sm min-h-10",
  lg: "px-7 py-3 text-base min-h-12",
  icon: "p-2 h-10 w-10",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, children, className, disabled, type = "button", withArrow, onMouseDown, ...props },
  forwardedRef,
) {
  const innerRef = useRef<HTMLButtonElement>(null)
  const ref = (forwardedRef ?? innerRef) as React.RefObject<HTMLButtonElement>

  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [hovering, setHovering] = useState(false)

  const isPrimary = variant === "primary"
  const isLink = variant === "link"

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      const el = ref.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const id = Date.now()
        setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
        window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650)
      }
    }
    onMouseDown?.(e)
  }

  return (
    <>
      {isPrimary && (
        <style>{`
          @keyframes inkly-shimmer-sweep {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      )}

      <motion.button
        {...(props as any)}
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onMouseDown={handleMouseDown}
        onHoverStart={() => setHovering(true)}
        onHoverEnd={() => setHovering(false)}
        whileHover={!disabled && !loading && !isLink ? { y: -1, scale: 1.015 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.97, y: 0 } : undefined}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className={cn(
          "group inline-flex items-center justify-center gap-2 rounded-md font-medium",
          "transition-[background-color,border-color,color,box-shadow] duration-200 ease-out",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          isPrimary && "relative overflow-hidden shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_4px_14px_rgba(255,106,0,0.30)] hover:shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_8px_22px_rgba(255,106,0,0.38)]",
          !isPrimary && !isLink && "relative overflow-hidden",
          variant !== "link" && sizes[size],
          variants[variant],
          className,
        )}
      >
        {/* PRIMARY — shimmer, faqat hover paytida yugurtiriladi (performantroq) */}
        {isPrimary && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
              backgroundSize: "200% 100%",
              animation: `inkly-shimmer-sweep ${hovering ? "1.1s" : "2.6s"} linear infinite`,
            }}
          />
        )}

        {/* PRIMARY — ustki shine */}
        {isPrimary && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-b from-white/15 to-transparent"
          />
        )}

        {/* Barcha variantlar — bosilganda tarqaladigan ripple */}
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute rounded-full",
              isPrimary ? "bg-white/50" : "bg-primary/25",
            )}
            style={{ left: r.x, top: r.y, translateX: "-50%", translateY: "-50%" }}
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: 160, height: 160, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {loading && <LoadingDots size="sm" />}
        <span className={cn("relative z-10 inline-flex items-center gap-2 whitespace-nowrap", loading && "opacity-70")}>
          {children}
          {withArrow && (
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
              animate={
                isPrimary
                  ? { y: [0, -2.5, 0], transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }
                  : { x: hovering ? 3 : 0, transition: { type: "spring", stiffness: 400, damping: 22 } }
              }
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </motion.svg>
          )}
        </span>
      </motion.button>
    </>
  )
})