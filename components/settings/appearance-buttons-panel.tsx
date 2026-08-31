import type { ProfileThemeUpdate, ThemeButtonCorner, ThemeButtonShadow, ThemeButtonStyle } from "@/types/api"
import { BUTTON_CORNER_RADIUS, BUTTON_SHADOW_CSS } from "@/types/api"
import { PanelHeader, OptionTile, ColorField } from "./appearance-shared"
import { cn } from "@/lib/utils"

const STYLES: { id: ThemeButtonStyle; pro: boolean }[] = [
  { id: "solid", pro: false },
  { id: "glass", pro: true },
  { id: "outline", pro: false },
]
const STYLE_LABEL: Record<ThemeButtonStyle, string> = { solid: "Solid", glass: "Glass", outline: "Outline" }

const CORNERS: ThemeButtonCorner[] = ["square", "round", "rounder", "full"]
const CORNER_LABEL: Record<ThemeButtonCorner, string> = {
  square: "Square",
  round: "Round",
  rounder: "Rounder",
  full: "Full",
}

const SHADOWS: ThemeButtonShadow[] = ["none", "soft", "strong", "hard"]
const SHADOW_LABEL: Record<ThemeButtonShadow, string> = { none: "None", soft: "Soft", strong: "Strong", hard: "Hard" }

interface ButtonsPanelProps {
  theme: ProfileThemeUpdate
  onThemeChange: (patch: ProfileThemeUpdate) => void
  onBack: () => void
}

export function ButtonsPanel({ theme, onThemeChange, onBack }: ButtonsPanelProps) {
  const corner = theme.button_corner ?? "rounder"
  const shadow = theme.button_shadow ?? "none"

  return (
    <>
      <PanelHeader title="Tugmalar" onBack={onBack} />

      <p className="mb-2.5 text-sm font-semibold text-foreground">Tugma uslubi</p>
      <div className="mb-6 grid grid-cols-3 gap-2">
        {STYLES.map(({ id, pro }) => (
          <OptionTile
            key={id}
            selected={theme.button_style === id}
            onClick={() => onThemeChange({ button_style: id })}
            label={STYLE_LABEL[id]}
            proBadge={pro}
          >
            <div
              className="h-7 w-full rounded-full"
              style={{
                background: id === "solid" ? "#fff" : id === "glass" ? "rgba(255,255,255,0.4)" : "transparent",
                border: id === "outline" ? "1.5px solid var(--foreground)" : "none",
              }}
            />
          </OptionTile>
        ))}
      </div>

      <p className="mb-2.5 text-sm font-semibold text-foreground">Burchak yumaloqligi</p>
      <div className="mb-6 grid grid-cols-4 gap-2" role="radiogroup" aria-label="Burchak yumaloqligi">
        {CORNERS.map((c) => (
          <button
            key={c}
            role="radio"
            aria-checked={corner === c}
            onClick={() => onThemeChange({ button_corner: c })}
            className={cn(
              "flex h-12 flex-col items-center justify-center gap-1 rounded-panel border-[1.5px] text-text-muted transition",
              corner === c ? "border-primary bg-accent text-primary" : "border-border hover:border-text-muted",
            )}
          >
            <div
              className="h-3.5 w-6 border-[1.5px] border-current"
              style={{ borderRadius: `${Math.min(BUTTON_CORNER_RADIUS[c], 14)}px` }}
            />
          </button>
        ))}
      </div>
      <div className="mb-6 grid grid-cols-4 gap-2 text-center text-[11px] text-text-muted">
        {CORNERS.map((c) => (
          <span key={c}>{CORNER_LABEL[c]}</span>
        ))}
      </div>

      <p className="mb-2.5 text-sm font-semibold text-foreground">Tugma soyasi</p>
      <div className="mb-6 grid grid-cols-4 gap-2" role="radiogroup" aria-label="Tugma soyasi">
        {SHADOWS.map((s) => (
          <button
            key={s}
            role="radio"
            aria-checked={shadow === s}
            onClick={() => onThemeChange({ button_shadow: s })}
            className={cn(
              "flex h-12 items-center justify-center rounded-panel border-[1.5px] text-xs font-medium transition",
              shadow === s
                ? "border-primary bg-accent text-primary"
                : "border-border text-text-muted hover:border-text-muted",
            )}
          >
            {SHADOW_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <ColorField
          label="Tugma rangi"
          value={theme.button_color ?? "#FFFFFF"}
          onChange={(v) => onThemeChange({ button_color: v })}
        />
        <ColorField
          label="Tugma matni rangi"
          value={theme.button_text_color ?? "#171412"}
          onChange={(v) => onThemeChange({ button_text_color: v })}
        />
      </div>
    </>
  )
}
