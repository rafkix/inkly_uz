import Image from "next/image"
import { Send, Eye, Heart } from "lucide-react"
import type { ProfileThemeUpdate, ThemeHeaderShape } from "@/types/api"
import { BUTTON_CORNER_RADIUS, BUTTON_SHADOW_CSS } from "@/types/api"

const AVATAR_SHAPE: Record<string, string> = {
  classic: "9999px",
  hero: "9999px",
  banner: "9999px",
  cutout: "9999px",
}
const HEADER_SHAPE_STYLE: Record<ThemeHeaderShape, string> = {
  loop: "42% 58% 63% 37% / 41% 42% 58% 59%",
  flower: "63% 37% 37% 63% / 43% 37% 63% 57%",
  oval: "50% / 65%",
  rounded: "28%",
  burst: "48% 52% 70% 30% / 30% 70% 30% 70%",
}

interface PreviewPhoneProps {
  theme: ProfileThemeUpdate
  title: string
  bio: string
  avatarUrl?: string | null
}

export function PreviewPhone({ theme, title, bio, avatarUrl }: PreviewPhoneProps) {
  const wallpaperCss =
    theme.wallpaper_style === "gradient"
      ? `linear-gradient(160deg, ${theme.wallpaper_color}, #10161a)`
      : theme.wallpaper_style === "blur"
      ? `radial-gradient(circle at 30% 20%, ${theme.wallpaper_color}, #10161a)`
      : theme.wallpaper_color

  const avatarBorderRadius =
    theme.header_layout === "shape" && theme.header_shape
      ? HEADER_SHAPE_STYLE[theme.header_shape]
      : AVATAR_SHAPE[theme.header_layout ?? "classic"]

  const titleFontFamily = theme.alternative_title_font && theme.title_font ? theme.title_font : theme.page_font

  const wallpaperFilter =
    theme.wallpaper_effect === "mono"
      ? "grayscale(1)"
      : theme.wallpaper_effect === "blur"
      ? "blur(6px)"
      : theme.wallpaper_effect === "tint"
      ? "brightness(0.65)"
      : theme.wallpaper_effect === "halftone"
      ? "contrast(1.4)"
      : undefined

  return (
    <div className="sticky top-6 flex justify-center rounded-panel bg-muted p-6">
      <div
        className="w-[300px] overflow-hidden rounded-4xl border-[8px] border-foreground"
        style={{ background: wallpaperCss, filter: wallpaperFilter }}
      >
        <div className="px-[18px] pb-5 pt-[34px] text-center">
          <div
            className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center overflow-hidden text-xl font-bold text-white"
            style={{ background: "#FF6A00", borderRadius: avatarBorderRadius }}
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill sizes="72px" className="object-cover" />
            ) : (
              title.replace("@", "")[0]?.toUpperCase()
            )}
          </div>

          <h2 className="mt-3 text-[17px] font-bold" style={{ fontFamily: titleFontFamily, color: theme.title_color }}>
            {title}
          </h2>

          <p
            className="mt-2.5 text-xs leading-relaxed"
            style={{ fontFamily: theme.page_font, color: theme.page_text_color }}
          >
            {bio}
          </p>

          <div className="mt-3.5 flex justify-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", color: theme.page_text_color }}
            >
              <Send size={13} />
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            {["Yozuvlarim", "Bog'lanish"].map((label) => (
              <div
                key={label}
                className="py-2.5 text-[13px] font-medium"
                style={{
                  borderRadius: BUTTON_CORNER_RADIUS[theme.button_corner ?? "rounder"],
                  boxShadow: BUTTON_SHADOW_CSS[theme.button_shadow ?? "none"],
                  color: theme.button_text_color,
                  background:
                    theme.button_style === "solid"
                      ? theme.button_color
                      : theme.button_style === "glass"
                      ? "rgba(255,255,255,0.18)"
                      : "transparent",
                  border: theme.button_style === "outline" ? `1.5px solid ${theme.button_color}` : "none",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0e0e0e] px-4 pb-[18px] pt-3.5">
          <div className="py-2.5">
            <p className="text-xs font-semibold text-white">IELTS Writing uchun 7 ta band</p>
            <div className="mt-1.5 flex gap-2.5 text-[10px] text-white/60">
              <span className="flex items-center gap-1">
                <Eye size={10} />
                4.2K
              </span>
              <span className="flex items-center gap-1">
                <Heart size={10} />
                312
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
