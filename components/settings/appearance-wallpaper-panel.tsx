import { Image as ImageIcon, Video } from "lucide-react"
import type { ProfileThemeUpdate, ThemeWallpaperEffect, ThemeWallpaperStyle } from "@/types/api"
import { PanelHeader, OptionTile, ColorField } from "./appearance-shared"

const STYLES: { id: ThemeWallpaperStyle; pro: boolean }[] = [
  { id: "fill", pro: false },
  { id: "gradient", pro: false },
  { id: "blur", pro: false },
  { id: "pattern", pro: true },
]
const LABEL: Record<ThemeWallpaperStyle, string> = {
  fill: "Fill",
  gradient: "Gradient",
  blur: "Blur",
  pattern: "Pattern",
  image: "Image",
  video: "Video",
}

const EFFECTS: ThemeWallpaperEffect[] = ["none", "mono", "blur", "halftone", "tint", "noise"]
const EFFECT_LABEL: Record<ThemeWallpaperEffect, string> = {
  none: "None",
  mono: "Mono",
  blur: "Blur",
  halftone: "Halftone",
  tint: "Tint",
  noise: "Noise",
}
const EFFECT_HINT: Partial<Record<ThemeWallpaperEffect, string>> = {
  tint: "Matn ko'rinishini yaxshilaydi va kontentni yanada ko'rinadigan qiladi",
  noise: "Nozik don teksturasi qo'shadi",
}

interface WallpaperPanelProps {
  theme: ProfileThemeUpdate
  onThemeChange: (patch: ProfileThemeUpdate) => void
  onBack: () => void
}

export function WallpaperPanel({ theme, onThemeChange, onBack }: WallpaperPanelProps) {
  const color = theme.wallpaper_color ?? "#FF6A00"
  const effect = theme.wallpaper_effect ?? "none"

  return (
    <>
      <PanelHeader title="Fon" onBack={onBack} />

      <p className="mb-2.5 text-sm font-semibold text-foreground">Fon uslubi</p>
      <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {STYLES.map(({ id, pro }) => (
          <OptionTile
            key={id}
            selected={theme.wallpaper_style === id}
            onClick={() => onThemeChange({ wallpaper_style: id })}
            label={LABEL[id]}
            proBadge={pro}
          >
            <div className="h-8 w-full rounded-control" style={{ background: color }} />
          </OptionTile>
        ))}
        <OptionTile
          selected={theme.wallpaper_style === "image"}
          onClick={() => onThemeChange({ wallpaper_style: "image" })}
          label="Image"
          proBadge
        >
          <ImageIcon size={20} className="text-text-muted" />
        </OptionTile>
        <OptionTile
          selected={theme.wallpaper_style === "video"}
          onClick={() => onThemeChange({ wallpaper_style: "video" })}
          label="Video"
          proBadge
        >
          <Video size={20} className="text-text-muted" />
        </OptionTile>
      </div>

      <ColorField label="Fon rangi" value={color} onChange={(v) => onThemeChange({ wallpaper_color: v })} />

      <p className="mb-2.5 mt-5 text-sm font-semibold text-foreground">Effekt</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {EFFECTS.map((e) => (
          <OptionTile
            key={e}
            selected={effect === e}
            onClick={() => onThemeChange({ wallpaper_effect: e })}
            label={EFFECT_LABEL[e]}
          >
            <div
              className="h-8 w-full rounded-control border border-border"
              style={{
                background: color,
                filter:
                  e === "mono"
                    ? "grayscale(1)"
                    : e === "blur"
                    ? "blur(1.5px)"
                    : e === "tint"
                    ? "brightness(0.7)"
                    : undefined,
              }}
            />
          </OptionTile>
        ))}
      </div>
      {EFFECT_HINT[effect] && <p className="mt-2 text-xs text-text-muted">{EFFECT_HINT[effect]}</p>}
    </>
  )
}
