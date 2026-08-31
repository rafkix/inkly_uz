import Image from "next/image"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/utils/format"
import { getMediaUrl } from "@/lib/api/client"

// Standardized avatar scale (px). Pass a named size, or an explicit
// number for a one-off case the scale doesn't cover.
export const avatarSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
  "2xl": 96,
} as const

export type AvatarSize = keyof typeof avatarSizes

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: AvatarSize | number
  className?: string
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const px = typeof size === "number" ? size : avatarSizes[size]
  return (
    <div
      style={{ width: px, height: px }}
      className={cn("relative flex-shrink-0 overflow-hidden rounded-full border border-border bg-background-muted", className)}
    >
      {getMediaUrl(src) ? (
        <Image src={getMediaUrl(src) || "/placeholder.svg"} alt={name ?? "avatar"} fill sizes={`${px}px`} className="object-cover" />
      ) : (
        <span
          aria-hidden="true"
          style={{ fontSize: Math.max(10, px * 0.38) }}
          className="flex h-full w-full items-center justify-center font-semibold tracking-tight text-foreground-muted"
        >
          {initials(name)}
        </span>
      )}
    </div>
  )
}
