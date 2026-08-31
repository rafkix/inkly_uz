import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "outline" | "ghost"
  className?: string
}

const variants = {
  // default: soft orange background — category / label chip
  default: "bg-accent text-primary",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success-soft text-success border border-success-soft-border",
  warning: "bg-primary-soft text-warning",
  error: "bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground-muted",
  ghost: "bg-transparent text-foreground-muted",
} as const

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium leading-5",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function VerifiedDot({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)} title="Tasdiqlangan">
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
      <span className="sr-only">Tasdiqlangan muallif</span>
    </span>
  )
}
