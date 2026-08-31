import { cn } from "@/lib/utils"

/**
 * Inkly brand mark: orange dot + quarter arc ("y" / quote shape).
 */
export function LogoMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Inkly"
      className={cn("flex-shrink-0", className)}
    >
      <circle cx="10" cy="9" r="5" fill="var(--color-inkly-orange)" />
      <path d="M32 0v10a22 22 0 0 1-22 22H4V22h6a12 12 0 0 0 12-12V0h10Z" transform="translate(-2 -2)" fill="var(--color-inkly-orange)" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      <LogoMark />
      <span className="text-xl font-bold tracking-tighter">inkly</span>
    </span>
  )
}
