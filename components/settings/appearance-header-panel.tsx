import Link from "next/link"
import { Type, Image as ImageIcon } from "lucide-react"
import type { ProfileThemeUpdate, ThemeHeaderLayout, ThemeHeaderShape, ThemeTitleStyle } from "@/types/api"
import { PanelHeader, OptionTile, ColorField } from "./appearance-shared"

const LAYOUTS: { id: ThemeHeaderLayout; pro: boolean }[] = [
  { id: "classic", pro: false },
  { id: "hero", pro: true },
  { id: "banner", pro: true },
  { id: "cutout", pro: true },
  { id: "shape", pro: false },
]
const LAYOUT_LABEL: Record<ThemeHeaderLayout, string> = {
  classic: "Classic",
  hero: "Hero",
  banner: "Banner",
  cutout: "Cutout",
  shape: "Shape",
}
const AVATAR_SHAPE: Record<ThemeHeaderLayout, string> = {
  classic: "9999px",
  hero: "9999px",
  banner: "9999px",
  cutout: "9999px",
  shape: "9999px", // shape tanlanganda haqiqiy shakl SHAPE_STYLE dan olinadi
}

const SHAPES: ThemeHeaderShape[] = ["loop", "flower", "oval", "rounded", "burst"]
const SHAPE_LABEL: Record<ThemeHeaderShape, string> = {
  loop: "Loop",
  flower: "Flower",
  oval: "Oval",
  rounded: "Rounded",
  burst: "Burst",
}
// Linktree'dagi haqiqiy nomlarga eng yaqin CSS taxminlari — final ko'rinish
// dizayner tomonidan SVG/clip-path bilan aniqlashtirilishi mumkin.
const SHAPE_STYLE: Record<ThemeHeaderShape, string> = {
  loop: "42% 58% 63% 37% / 41% 42% 58% 59%",
  flower: "63% 37% 37% 63% / 43% 37% 63% 57%",
  oval: "50% / 65%",
  rounded: "28%",
  burst: "48% 52% 70% 30% / 30% 70% 30% 70%",
}

interface HeaderPanelProps {
  theme: ProfileThemeUpdate
  onThemeChange: (patch: ProfileThemeUpdate) => void
  onBack: () => void
}

// Ism, foydalanuvchi nomi va bio "Profil sozlamalari" (/settings/profile) sahifasida
// tahrirlanadi — real Linktree'da Title/Bio shu yerda bo'lsa-da, bizda ikkilanishni
// oldini olish uchun faqat Title style/font/color kabi KO'RINISH sozlamalari shu yerda qoladi.
export function HeaderPanel({ theme, onThemeChange, onBack }: HeaderPanelProps) {
  const isShape = theme.header_layout === "shape"
  const isBanner = theme.header_layout === "banner"

  return (
    <>
      <PanelHeader title="Sarlavha" onBack={onBack} />

      <p className="mb-2.5 text-sm font-semibold text-foreground">Joylashuv</p>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {LAYOUTS.map(({ id, pro }) => (
          <OptionTile
            key={id}
            selected={theme.header_layout === id}
            onClick={() =>
              onThemeChange({
                header_layout: id,
                header_shape: id === "shape" ? theme.header_shape ?? "loop" : null,
              })
            }
            label={LAYOUT_LABEL[id]}
            proBadge={pro}
          >
            <div className="h-[30px] w-[30px] bg-primary" style={{ borderRadius: AVATAR_SHAPE[id] }} />
          </OptionTile>
        ))}
      </div>

      {/* Shape tanlanganda — sub-shape tanlash */}
      {isShape && (
        <div className="mb-6 rounded-panel border border-border bg-muted/50 p-3">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-tight text-text-muted">Shape</p>
          <div className="grid grid-cols-5 gap-2">
            {SHAPES.map((s) => (
              <OptionTile
                key={s}
                selected={theme.header_shape === s}
                onClick={() => onThemeChange({ header_shape: s })}
                label={SHAPE_LABEL[s]}
              >
                <div className="h-[26px] w-[26px] bg-primary" style={{ borderRadius: SHAPE_STYLE[s] }} />
              </OptionTile>
            ))}
          </div>
        </div>
      )}

      {/* Banner tanlanganda — banner rasm yuklash */}
      {isBanner && (
        <div className="mb-6 flex items-center justify-between rounded-panel border border-border bg-background px-4 py-3.5">
          <span className="text-sm text-foreground">Banner rasmi</span>
          <button className="rounded-control border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
            Yuklash
          </button>
        </div>
      )}

      <p className="mb-4 text-xs text-text-muted">
        Ism, foydalanuvchi nomi va bio matnini{" "}
        <Link href="/dashboard/settings/profile" className="font-medium text-primary hover:underline">
          Profil sozlamalari
        </Link>
        da tahrirlashingiz mumkin.
      </p>

      <TitleStyleSection theme={theme} onThemeChange={onThemeChange} />
    </>
  )
}

const FONTS = ["Link Sans", "Inter", "Georgia", "Manrope", "Poppins"]

function TitleStyleSection({
  theme,
  onThemeChange,
}: {
  theme: ProfileThemeUpdate
  onThemeChange: (patch: ProfileThemeUpdate) => void
}) {
  const style: ThemeTitleStyle = theme.title_style ?? "text"

  return (
    <div className="border-t border-border pt-5">
      <p className="mb-2.5 text-sm font-semibold text-foreground">Sarlavha uslubi</p>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <OptionTile selected={style === "text"} onClick={() => onThemeChange({ title_style: "text" })} label="Text">
          <Type size={20} />
        </OptionTile>
        <OptionTile
          selected={style === "logo"}
          onClick={() => onThemeChange({ title_style: "logo" })}
          label="Logo"
          proBadge
        >
          <ImageIcon size={20} />
        </OptionTile>
      </div>

      <div className="mb-4 flex items-center justify-between">
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
    </div>
  )
}
