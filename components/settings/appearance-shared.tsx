import { ChevronLeft, ChevronRight, Zap } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function SettingsRow({
  icon,
  title,
  value,
  onClick,
}: {
  icon: ReactNode
  title: string
  value?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="mb-2.5 flex w-full items-center gap-3.5 rounded-panel border border-border bg-background px-4 py-3.5 text-left transition-colors hover:border-primary/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-muted text-text-secondary">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-foreground">{title}</span>
      {value && <span className="text-sm text-text-muted">{value}</span>}
      <ChevronRight size={16} className="text-text-muted" />
    </button>
  )
}

export function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <button onClick={onBack} aria-label="Orqaga" className="flex text-foreground">
        <ChevronLeft size={22} />
      </button>
      <h2 className="m-0 text-lg font-bold text-foreground">{title}</h2>
    </div>
  )
}

export function OptionTile({
  selected,
  onClick,
  label,
  children,
  proBadge = false,
}: {
  selected: boolean
  onClick: () => void
  label: string
  children: ReactNode
  proBadge?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-panel bg-muted px-2 py-2.5",
        selected ? "border-2 border-primary" : "border border-border",
      )}
    >
      {proBadge && (
        <span className="absolute right-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-white">
          <Zap size={9} fill="currentColor" />
        </span>
      )}
      {children}
      <span className="text-[11px] text-text-secondary">{label}</span>
    </button>
  )
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3.5">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-control border border-input px-2.5 py-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-5 w-5 border-none bg-transparent p-0"
        />
        <span className="text-[13px] text-text-secondary">{value.toUpperCase()}</span>
      </div>
    </div>
  )
}
