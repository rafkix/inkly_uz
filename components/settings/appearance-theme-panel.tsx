import { useState } from "react"
import { Shuffle, Zap, Check } from "lucide-react"
import type { ProfileThemeUpdate } from "@/types/api"
import { CURATED_THEME_PRESETS } from "@/types/api"
import { PanelHeader } from "./appearance-shared"

interface ThemePanelProps {
  theme: ProfileThemeUpdate
  onThemeChange: (patch: ProfileThemeUpdate) => void
  onBack: () => void
}

export function ThemePanel({ theme, onThemeChange, onBack }: ThemePanelProps) {
  const [tab, setTab] = useState<"customizable" | "curated">(theme.theme_mode === "curated" ? "curated" : "customizable")

  function shuffle() {
    const pool = CURATED_THEME_PRESETS.filter((p) => !p.pro)
    const pick = pool[Math.floor(Math.random() * pool.length)]
    onThemeChange({ theme_mode: "curated", theme_preset: pick.id })
    setTab("curated")
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <PanelHeader title="Tema" onBack={onBack} />
        <button
          onClick={shuffle}
          className="mb-5 flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          <Shuffle size={13} />
          Aralashtirish
        </button>
      </div>

      <div className="mb-5 flex rounded-control bg-muted p-1">
        <button
          onClick={() => {
            setTab("customizable")
            onThemeChange({ theme_mode: "custom" })
          }}
          className={`flex-1 rounded-sm py-2 text-sm font-medium transition-colors ${
            tab === "customizable" ? "bg-background text-foreground shadow-sm" : "text-text-muted"
          }`}
        >
          Sozlanadigan
        </button>
        <button
          onClick={() => setTab("curated")}
          className={`flex-1 rounded-sm py-2 text-sm font-medium transition-colors ${
            tab === "curated" ? "bg-background text-foreground shadow-sm" : "text-text-muted"
          }`}
        >
          Kurategan
        </button>
      </div>

      {tab === "customizable" ? (
        <div className="rounded-panel border border-border bg-background p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Custom</span> — Header, Fon, Tugmalar, Matn va Ranglar
            bo'limlarida o'zingiz sozlagan tema.
          </p>
          <p className="mt-1.5 text-xs text-text-muted">
            Har qanday bo'limni o'zgartirsangiz, avtomatik ravishda shu rejimga qaytasiz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {CURATED_THEME_PRESETS.map((preset) => {
            const selected = theme.theme_mode === "curated" && theme.theme_preset === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => onThemeChange({ theme_mode: "curated", theme_preset: preset.id })}
                className={`relative flex flex-col items-center gap-2 rounded-panel border-[1.5px] p-2.5 transition-all ${
                  selected ? "border-primary" : "border-border hover:border-text-muted"
                }`}
              >
                {preset.pro && (
                  <span className="absolute right-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-white">
                    <Zap size={9} fill="currentColor" />
                  </span>
                )}
                {selected && (
                  <span className="absolute left-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                    <Check size={10} />
                  </span>
                )}
                <div
                  className="h-16 w-full rounded-lg"
                  style={{ background: preset.preview_color }}
                />
                <span className="text-[11px] text-text-secondary">{preset.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
