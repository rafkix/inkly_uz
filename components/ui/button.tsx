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

  const [hovering, setHovering] = useState(false)

  const isPrimary = variant === "primary"
  const isLink = variant === "link"

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    onMouseDown?.(e)
  }

  return (
    <>
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
