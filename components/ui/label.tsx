import type { LabelHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn("text-sm font-medium text-foreground", "peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className)}
    />
  )
}
