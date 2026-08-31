"use client"

import Link from "next/link"
import { AlertCircle, FileQuestion, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingDots } from "@/components/ui/loading-dots"

export function LoadingState({ label = "Yuklanmoqda..." }: { label?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center" role="status" aria-live="polite">
      <LoadingDots size="lg" className="text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-border bg-background px-6 py-10 text-center">
      <FileQuestion className="size-7 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action && <Link href={action.href} className="inline-flex h-9 items-center justify-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">{action.label}</Link>}
    </div>
  )
}

export function ErrorState({ title = "Xatolik yuz berdi", description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-panel border border-destructive/20 bg-destructive/5 px-6 py-10 text-center" role="alert">
      <AlertCircle className="size-7 text-destructive" aria-hidden="true" />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {onRetry && <Button type="button" variant="outline" size="sm" onClick={onRetry}><RefreshCw data-icon="inline-start" />Qayta urinish</Button>}
    </div>
  )
}
