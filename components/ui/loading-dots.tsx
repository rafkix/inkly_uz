import { cn } from "@/lib/utils"

interface LoadingDotsProps {
  className?: string
  dotClassName?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "size-1",
  md: "size-1.5",
  lg: "size-2",
}

/**
 * Shared three-dot loading indicator. Use this instead of a spinner
 * anywhere the app shows an in-progress action: buttons, inline fetches,
 * page/route loading states, list pagination, etc.
 */
export function LoadingDots({ className, dotClassName, size = "md" }: LoadingDotsProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      role="status"
      aria-live="polite"
      aria-label="Yuklanmoqda"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "rounded-full bg-current animate-loading-dot",
            sizeMap[size],
            dotClassName,
          )}
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  )
}
