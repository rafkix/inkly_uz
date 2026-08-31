"use client"

import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import { Github, Twitter } from "@/components/ui/brand-icons"
import { VerifiedDot } from "@/components/ui/badge"
import { getMediaUrl } from "@/lib/api/client"
import { FollowButton } from "@/components/profile/follow-button"

interface MobileHeroUser {
    full_name: string
    username: string
    slug?: string | null
    avatar?: string | null
    bio?: string | null
    is_verified?: boolean
    is_following?: boolean
    followers_count?: number
    socials?: {
        telegram?: string | null
        github?: string | null
        twitter?: string | null
        instagram?: string | null
    }
}

const DEFAULT_COLORS = { primary: "var(--color-inkly-orange)", secondary: "var(--color-inkly-coral)" } as const

function isVivid(r: number, g: number, b: number): boolean {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    const brightness = (r + g + b) / 3
    return saturation > 0.18 && brightness > 35 && brightness < 220
}

function extractColors(imgEl: HTMLImageElement): { primary: string; secondary: string } {
    try {
        const canvas = document.createElement("canvas")
        const size = 80
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")
        if (!ctx) return DEFAULT_COLORS

        ctx.drawImage(imgEl, 0, 0, size, size)
        const data = ctx.getImageData(0, 0, size, size).data

        let r1 = 0, g1 = 0, b1 = 0, c1 = 0
        let r2 = 0, g2 = 0, b2 = 0, c2 = 0
        const half = size / 2

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x += 4) {
                const i = (y * size + x) * 4
                const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
                if (a < 128) continue
                const brightness = (r + g + b) / 3
                if (brightness < 20 || brightness > 235) continue
                if (y < half) { r1 += r; g1 += g; b1 += b; c1++ }
                else { r2 += r; g2 += g; b2 += b; c2++ }
            }
        }

        if (c1 === 0 && c2 === 0) return DEFAULT_COLORS

        const avgR1 = c1 ? Math.round(r1 / c1) : 0
        const avgG1 = c1 ? Math.round(g1 / c1) : 0
        const avgB1 = c1 ? Math.round(b1 / c1) : 0

        const avgR2 = c2 ? Math.round(r2 / c2) : 0
        const avgG2 = c2 ? Math.round(g2 / c2) : 0
        const avgB2 = c2 ? Math.round(b2 / c2) : 0

        const primaryOk = isVivid(avgR1, avgG1, avgB1)
        const secondaryOk = isVivid(avgR2, avgG2, avgB2)

        if (!primaryOk && !secondaryOk) return DEFAULT_COLORS

        return {
            primary: primaryOk ? `rgb(${avgR1}, ${avgG1}, ${avgB1})` : DEFAULT_COLORS.primary,
            secondary: secondaryOk ? `rgb(${avgR2}, ${avgG2}, ${avgB2})` : DEFAULT_COLORS.secondary,
        }
    } catch {
        return DEFAULT_COLORS
    }
}

// ─── Mask konstantalari ─────────────────────────────────────────────────────

const RADIAL_MASK = `radial-gradient(110.26% 96% at 50% 0%,
    #000 50%,
    rgba(0,0,0,0.99) 54.68%,
    rgba(0,0,0,0.97) 58.79%,
    rgba(0,0,0,0.94) 62.4%,
    rgba(0,0,0,0.90) 65.61%,
    rgba(0,0,0,0.85) 68.52%,
    rgba(0,0,0,0.79) 71.2%,
    rgba(0,0,0,0.72) 73.75%,
    rgba(0,0,0,0.65) 76.25%,
    rgba(0,0,0,0.57) 78.8%,
    rgba(0,0,0,0.48) 81.48%,
    rgba(0,0,0,0.39) 84.39%,
    rgba(0,0,0,0.30) 87.6%,
    rgba(0,0,0,0.20) 91.21%,
    rgba(0,0,0,0.10) 95.32%,
    rgba(0,0,0,0.00) 100%
)`

const BLUR_MASK = `radial-gradient(110.26% 96% at 50% 0%,
    rgba(0,0,0,0.00) 60%,
    rgba(0,0,0,0.01) 64.72%,
    rgba(0,0,0,0.03) 68.55%,
    rgba(0,0,0,0.07) 71.65%,
    rgba(0,0,0,0.12) 74.13%,
    rgba(0,0,0,0.18) 76.15%,
    rgba(0,0,0,0.25) 77.82%,
    rgba(0,0,0,0.33) 79.3%,
    rgba(0,0,0,0.41) 80.7%,
    rgba(0,0,0,0.50) 82.18%,
    rgba(0,0,0,0.59) 83.85%,
    rgba(0,0,0,0.67) 85.87%,
    rgba(0,0,0,0.76) 88.35%,
    rgba(0,0,0,0.85) 91.45%,
    rgba(0,0,0,0.93) 95.28%,
    #000 100%
)`

// ─── MobileHero ─────────────────────────────────────────────────────────────

export function MobileHero({ user }: { user: MobileHeroUser }) {
    const avatarUrl = user.avatar ? getMediaUrl(user.avatar) : null
    const [ready, setReady] = useState(false)
    const [colors, setColors] = useState<{ primary: string; secondary: string }>(DEFAULT_COLORS)

    useEffect(() => {
        if (!avatarUrl) {
            setReady(true)
            return
        }

        const img = new Image()
        img.crossOrigin = "anonymous"

        const timer = setTimeout(() => setReady(true), 1500)

        img.onload = () => {
            clearTimeout(timer)
            setColors(extractColors(img))
            setReady(true)
        }
        img.onerror = () => {
            clearTimeout(timer)
            setReady(true)
        }

        img.src = avatarUrl

        return () => {
            clearTimeout(timer)
            img.onload = null
            img.onerror = null
        }
    }, [avatarUrl])

    const initial = user.username?.[0]?.toUpperCase() ?? "?"
    const { telegram, github, twitter, instagram } = user.socials ?? {}
    const hasSocials = !!(telegram || github || twitter || instagram)

    return (
        <section
            className="relative sm:hidden"
            style={{ opacity: ready ? 1 : 0, transition: "opacity 0.4s ease" }}
        >
            {/* ── Top bar ── */}
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 pt-5">
                <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                    <button
                        aria-label="Ulashish"
                        className="flex h-9 w-9 items-center justify-center rounded-panel border border-white/20 text-white/70 transition hover:text-white"
                        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(12px)" }}
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden>
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Avatar BOR ── */}
            {avatarUrl ? (
                <div className="relative w-full" style={{ height: "calc(100vw - 80px)" }}>
                    <div className="absolute inset-0" style={{ backgroundColor: "var(--color-white)" }} />
                    <div
                        className="absolute left-0 right-0 top-0"
                        style={{ height: "100vw", mask: RADIAL_MASK, WebkitMask: RADIAL_MASK }}
                    >
                        <img
                            src={avatarUrl}
                            alt=""
                            aria-hidden
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover object-top"
                        />
                        <div
                            className="absolute inset-0"
                            style={{ mask: BLUR_MASK, WebkitMask: BLUR_MASK }}
                        />
                    </div>
                </div>
            ) : (
                /* ── Avatar YO'Q — avatar bilan aynan bir xil struktura ── */
                <div className="relative w-full" style={{ height: "calc(100vw - 80px)" }}>
                    {/* ✅ FIX: #000000 → var(--color-white) — mask pastga o'tganda oq fonga silliq o'tadi */}
                    <div className="absolute inset-0" style={{ backgroundColor: "var(--color-white)" }} />
                    <div
                        className="absolute left-0 right-0 top-0"
                        style={{ height: "100vw", mask: RADIAL_MASK, WebkitMask: RADIAL_MASK }}
                    >
                        {/* Qora gradient fon — faqat mask ichida ko'rinadi */}
                        <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(160deg, var(--color-text-primary) 0%, #000000 100%)" }}
                        />

                        {/* Harf — markazda, biroz yuqoriroq */}
                        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "10%" }}>
                            <LetterTile char={initial} />
                        </div>

                        {/* Blur overlay — avatar bilan bir xil */}
                        <div
                            className="absolute inset-0"
                            style={{ mask: BLUR_MASK, WebkitMask: BLUR_MASK }}
                        />
                    </div>
                </div>
            )}

            {/* ── Matn qismi ── */}
            <div
                className="relative z-10 w-full px-6 pb-8 text-center"
                style={{ marginTop: "-32px" }}
            >
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <h1 className="text-[28px] font-bold tracking-[-0.02em] text-text-primary">
                        @{user.username}
                    </h1>
                    {user.is_verified && <VerifiedDot />}
                </div>

                {user.bio && (
                    <p
                        className="mt-2 line-clamp-2 text-[13px] leading-[1.6]"
                        style={{
                            background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        {user.bio}
                    </p>
                )}

                {hasSocials && (
                    <div className="mt-5 flex items-center justify-center gap-3">
                        {instagram && (
                            <SocialIcon
                                href={`https://instagram.com/${instagram}`}
                                label="Instagram"
                                color="#E1306C"
                                hoverBg="rgba(225,48,108,0.06)"
                                hoverBorder="rgba(225,48,108,0.35)"
                            >
                                <InstagramIcon />
                            </SocialIcon>
                        )}
                        {telegram && (
                            <SocialIcon
                                href={`https://t.me/${telegram}`}
                                label="Telegram"
                                color="var(--color-brand-telegram)"
                                hoverBg="rgba(38,165,228,0.06)"
                                hoverBorder="rgba(38,165,228,0.35)"
                            >
                                <Send size={16} />
                            </SocialIcon>
                        )}
                        {github && (
                            <SocialIcon
                                href={`https://github.com/${github}`}
                                label="GitHub"
                                color="#24292e"
                                hoverBg="rgba(36,41,46,0.06)"
                                hoverBorder="rgba(36,41,46,0.30)"
                            >
                                <Github size={16} />
                            </SocialIcon>
                        )}
                        {twitter && (
                            <SocialIcon
                                href={`https://twitter.com/${twitter}`}
                                label="Twitter/X"
                                color="#000000"
                                hoverBg="rgba(0,0,0,0.05)"
                                hoverBorder="rgba(0,0,0,0.25)"
                            >
                                <Twitter size={16} />
                            </SocialIcon>
                        )}
                    </div>
                )}

                {/* Follow tugmasi */}
                <div className="mt-5 flex justify-center">
                    <FollowButton
                        targetSlug={user.slug ?? user.username}
                        initialIsFollowing={user.is_following ?? false}
                        initialFollowersCount={user.followers_count ?? 0}
                    />
                </div>
            </div>
        </section>
    )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function charColor(ch: string): string {
    const PALETTE = [
        "var(--color-inkly-orange)", "#6C63FF", "#00C9A7", "#FF4757",
        "#FFA502", "#1E90FF", "#FF6B81", "#2ED573",
        "#A855F7", "#F43F5E", "#06B6D4", "#84CC16",
    ]
    const code = ch.toUpperCase().charCodeAt(0)
    return PALETTE[code % PALETTE.length]
}

function LetterTile({ char }: { char: string }) {
    const color = charColor(char)
    return (
        <span
            style={{
                fontSize: "clamp(120px, 38vw, 200px)",
                fontWeight: 900,
                color,
                letterSpacing: "-0.05em",
                lineHeight: 1,
                textShadow: `0 0 80px ${color}99, 0 0 140px ${color}44`,
            }}
        >
            {char.toUpperCase()}
        </span>
    )
}

function SocialIcon({ href, label, color, hoverBg, hoverBorder, children }: {
    href: string
    label: string
    color: string
    hoverBg: string
    hoverBorder: string
    children: React.ReactNode
}) {
    const [hovered, setHovered] = useState(false)

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                color: color,
                background: hovered ? hoverBg : "var(--color-white)",
                border: `1px solid ${hovered ? hoverBorder : "var(--color-border-default)"}`,
                boxShadow: hovered ? `0 2px 12px ${hoverBg}` : "0 1px 3px rgba(0,0,0,0.06)",
                transition: "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
            }}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full"
        >
            {children}
        </a>
    )
}

function InstagramIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C9.2912 2 8.94131 2 7.86907 2.05643C7.03985 2.07241 6.21934 2.22888 5.44244 2.51919C4.78781 2.77878 4.23476 3.11738 3.67043 3.68172C3.11738 4.23476 2.76749 4.78781 2.51919 5.45372C2.27088 6.08578 2.10158 6.80813 2.05643 7.88036C2.01129 8.94131 2 9.27991 2 12C2 14.7088 2 15.0474 2.05643 16.1196C2.10158 17.1919 2.28217 17.9255 2.51919 18.5576C2.77878 19.2122 3.11738 19.7652 3.67043 20.3183C4.23476 20.8713 4.78781 21.2212 5.45372 21.4695C6.08578 21.7178 6.80813 21.8871 7.88036 21.9323C8.94131 21.9887 9.27991 22 12 22C14.7088 22 15.0474 22 16.1196 21.9436C17.1919 21.8984 17.9255 21.7178 18.5576 21.4808C19.2122 21.2212 19.7652 20.8826 20.3183 20.3183C20.8713 19.7652 21.2212 19.2122 21.4695 18.5463C21.7178 17.9142 21.8871 17.1919 21.9323 16.1196C21.9887 15.0474 22 14.7088 22 12C22 9.2912 22 8.94131 21.9436 7.86907C21.8984 6.79684 21.7178 6.07449 21.4808 5.44244C21.2212 4.78781 20.8826 4.23476 20.3183 3.67043C19.7652 3.11738 19.2122 2.76749 18.5463 2.51919C17.9142 2.27088 17.1919 2.10158 16.1196 2.05643C15.0587 2.01129 14.7088 2 12 2ZM12 3.80812C14.6637 3.80812 14.9797 3.81941 16.0519 3.86456C16.8175 3.89842 17.2351 4.02257 17.518 4.13542C17.8905 4.27086 18.1501 4.44016 18.4323 4.73366C18.7258 5.02716 18.895 5.27547 19.0305 5.64799C19.1434 5.93085 19.2675 6.33714 19.3014 7.11403C19.3465 8.17498 19.3578 8.49093 19.3578 11.1659C19.3578 13.8408 19.3465 14.1568 19.3014 15.2177C19.2675 15.9946 19.1434 16.4009 19.0305 16.6838C18.895 17.0563 18.7258 17.3159 18.4323 17.5981C18.1388 17.8916 17.8905 18.0609 17.518 18.1963C17.2351 18.3092 16.8288 18.4333 16.0519 18.4672C14.9909 18.5123 14.675 18.5236 12 18.5236C9.325 18.5236 9.00905 18.5123 7.94811 18.4672C7.17121 18.4333 6.76492 18.3092 6.48207 18.1963C6.10955 18.0609 5.84995 17.8916 5.56709 17.5981C5.2736 17.3046 5.10429 17.0563 4.96886 16.6838C4.85601 16.4009 4.73186 15.9946 4.69799 15.2177C4.65285 14.1568 4.64156 13.8408 4.64156 11.1659C4.64156 8.49093 4.65285 8.17498 4.69799 7.11403C4.73186 6.33714 4.85601 5.93085 4.96886 5.64799C5.10429 5.27547 5.2736 5.01587 5.56709 4.73366C5.86059 4.44016 6.10955 4.27086 6.48207 4.13542C6.76492 4.02257 7.17121 3.89842 7.94811 3.86456C9.00905 3.81941 9.325 3.80812 12 3.80812ZM12 6.86486C9.16216 6.86486 6.86486 9.16216 6.86486 12C6.86486 14.8378 9.16216 17.1351 12 17.1351C14.8378 17.1351 17.1351 14.8378 17.1351 12C17.1351 9.16216 14.8378 6.86486 12 6.86486ZM12 15.3378C10.1576 15.3378 8.66216 13.8424 8.66216 12C8.66216 10.1576 10.1576 8.66216 12 8.66216C13.8424 8.66216 15.3378 10.1576 15.3378 12C15.3378 13.8424 13.8424 15.3378 12 15.3378ZM18.5351 6.66216C18.5351 7.32432 18.0 7.85946 17.3378 7.85946C16.6757 7.85946 16.1405 7.32432 16.1405 6.66216C16.1405 6 16.6757 5.46486 17.3378 5.46486C18.0 5.46486 18.5351 6 18.5351 6.66216Z" />
        </svg>
    )
}