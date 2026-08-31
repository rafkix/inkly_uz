import type { ProfileThemeUpdate } from "@/types/api"
import { PanelHeader, ColorField } from "./appearance-shared"

const FONTS = ["Link Sans", "Inter", "Georgia", "Manrope"]

interface PanelProps {
  theme: ProfileThemeUpdate
  onThemeChange: (patch: ProfileThemeUpdate) => void
  onBack: () => void
}

export function TextPanel({ theme, onThemeChange, onBack }: PanelProps) {
  return (
    <>
      <PanelHeader title="Matn" onBack={onBack} />

      <div className="mb-5 flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Sahifa shrifti</label>
        <select
          value={theme.page_font}
          onChange={(e) => onThemeChange({ page_font: e.target.value })}
          className="w-full rounded-control border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <ColorField
        label="Sahifa matni rangi"
        value={theme.page_text_color ?? "#171412"}
        onChange={(v) => onThemeChange({ page_text_color: v })}
      />

      <div className="mb-4 mt-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Muqobil sarlavha shrifti</p>
          <p className="text-xs text-text-muted">Standart holatda sahifa shriftiga mos keladi</p>
        </div>
        <button
          role="switch"
          aria-checked={theme.alternative_title_font}
          onClick={() => onThemeChange({ alternative_title_font: !theme.alternative_title_font })}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            theme.alternative_title_font ? "bg-primary" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              theme.alternative_title_font ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {theme.alternative_title_font && (
        <div className="mb-4 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Sarlavha shrifti</label>
          <select
            value={theme.title_font ?? FONTS[0]}
            onChange={(e) => onThemeChange({ title_font: e.target.value })}
            className="w-full rounded-control border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      )}

      <ColorField
        label="Sarlavha rangi"
        value={theme.title_color ?? "#171412"}
        onChange={(v) => onThemeChange({ title_color: v })}
      />
    </>
  )
}

export function ColorsPanel({ theme, onThemeChange, onBack }: PanelProps) {
  return (
    <>
      <PanelHeader title="Ranglar" onBack={onBack} />
      <ColorField
        label="Fon"
        value={theme.wallpaper_color ?? "#FF6A00"}
        onChange={(v) => onThemeChange({ wallpaper_color: v })}
      />
      <ColorField
        label="Tugmalar"
        value={theme.button_color ?? "#FFFFFF"}
        onChange={(v) => onThemeChange({ button_color: v })}
      />
      <ColorField
        label="Tugma matni"
        value={theme.button_text_color ?? "#171412"}
        onChange={(v) => onThemeChange({ button_text_color: v })}
      />
      <ColorField
        label="Sahifa matni"
        value={theme.page_text_color ?? "#171412"}
        onChange={(v) => onThemeChange({ page_text_color: v })}
      />
      <ColorField
        label="Sarlavha"
        value={theme.title_color ?? "#171412"}
        onChange={(v) => onThemeChange({ title_color: v })}
      />
    </>
  )
}
