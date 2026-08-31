import { Send } from "lucide-react"

import { Github, Twitter } from "@/components/ui/brand-icons"
import { VerifiedDot } from "@/components/ui/badge"
import { AvatarGlow } from "@/components/profile/avatar-glow"
import { FollowButton } from "@/components/profile/follow-button"
import { getPublicAuthorSafe } from "@/lib/api/public"

type ProfileUser = NonNullable<Awaited<ReturnType<typeof getPublicAuthorSafe>>>

interface ProfileBannerProps {
    user: ProfileUser
    avatarUrl: string
}

export function ProfileBanner({ user, avatarUrl }: ProfileBannerProps) {
    return (
        <AvatarGlow avatarUrl={avatarUrl}>
            <section className="relative h-[380px] overflow-hidden rounded-2xl bg-[#0a0505]">

                {/* 1. Chap: to'liq aniq rasm — faqat o'ng chekkasi asta yo'qoladi */}
                {avatarUrl && (
                    <div className="absolute left-0 top-0 h-full" style={{ width: "34%" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={avatarUrl}
                            alt=""
                            aria-hidden
                            className="h-full w-full object-cover object-top"
                            style={{
                                maskImage: "linear-gradient(to right, black 60%, transparent 100%)",
                                WebkitMaskImage: "linear-gradient(to right, black 60%, transparent 100%)",
                            }}
                        />
                    </div>
                )}

                {/* 2. O'ng: blur rang glow — fon sifatida butun bannerga tarqaladi */}
                {avatarUrl && (
                    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={avatarUrl}
                            alt=""
                            aria-hidden
                            className="absolute left-0 top-0 h-full w-full object-cover object-top"
                            style={{
                                filter: "blur(80px) brightness(0.2) saturate(3)",
                                transform: "scaleX(1.5)",
                                transformOrigin: "left center",
                                maskImage:
                                    "linear-gradient(to right, transparent 5%, black 30%, black 70%, transparent 100%)",
                                WebkitMaskImage:
                                    "linear-gradient(to right, transparent 5%, black 30%, black 70%, transparent 100%)",
                            }}
                        />
                    </div>
                )}

                {/* 3. O'ng tomoni qoraytirish — avatar rangiga mos dinamik gradient */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to right, transparent 28%, rgba(var(--glow-r, 5), var(--glow-g, 1), var(--glow-b, 1), 0.55) 50%, rgba(var(--glow-r, 3), var(--glow-g, 0), var(--glow-b, 0), 0.9) 100%)",
                        zIndex: 1,
                    }}
                />

                {/* 4. Pastga fade */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                    style={{ zIndex: 2 }}
                />

                {/* 5. Glow — avatar rangiga mos accent */}
                <div
                    aria-hidden
                    className="absolute -bottom-10 -right-10 h-[220px] w-[220px] rounded-full opacity-20 blur-[70px]"
                    style={{
                        backgroundColor: "rgb(var(--glow-r, 255), var(--glow-g, 140), var(--glow-b, 60))",
                        zIndex: 2,
                    }}
                />

                {/* 6. Kontent — o'ng tomonda, blur ustida */}
                <div
                    className="absolute inset-y-0 bottom-0 right-0 flex flex-col justify-center pb-0 pr-10"
                    style={{ zIndex: 3, left: "36%" }}
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-[30px] font-bold tracking-[-0.04em] text-white lg:text-[34px]">
                            {user.full_name}
                        </h1>
                        {user.is_verified && <VerifiedDot />}
                        <span className="rounded-sm border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                            Yozuvchi
                        </span>
                    </div>

                    <p className="mt-1 text-[13px] font-medium text-white/50">@{user.username}</p>

                    {user.bio && (
                        <p className="mt-2 line-clamp-1 max-w-[500px] text-[12px] leading-[1.65] text-white/65">
                            {user.bio}
                        </p>
                    )}

                    {(user.socials?.telegram || user.socials?.github || user.socials?.twitter) && (
                        <div className="mt-3 flex items-center gap-2">
                            {user.socials.telegram && (
                                <SocialButton href={`https://t.me/${user.socials.telegram}`} label="Telegram" dark>
                                    <Send size={15} />
                                </SocialButton>
                            )}
                            {user.socials.github && (
                                <SocialButton href={`https://github.com/${user.socials.github}`} label="GitHub" dark>
                                    <Github size={15} />
                                </SocialButton>
                            )}
                            {user.socials.twitter && (
                                <SocialButton href={`https://twitter.com/${user.socials.twitter}`} label="Twitter" dark>
                                    <Twitter size={15} />
                                </SocialButton>
                            )}
                        </div>
                    )}
                </div>

                {/* Follow tugmasi — desktop hero bottom-right */}
                <div className="absolute bottom-6 right-10" style={{ zIndex: 4 }}>
                    <FollowButton
                        targetSlug={user.slug ?? user.username}
                        initialIsFollowing={user.is_following ?? false}
                        initialFollowersCount={user.followers_count ?? 0}
                    />
                </div>
            </section>
        </AvatarGlow>
    )
}

/* ================================================================
   SOCIAL BUTTON
================================================================ */

function SocialButton({
    href,
    label,
    children,
    dark = false,
}: {
    href: string
    label: string
    children: React.ReactNode
    dark?: boolean
}) {
    return (

        <a href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={[
                "flex h-[34px] w-[34px] items-center justify-center rounded-full border transition",
                dark
                    ? "border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/40"
                    : "border-border-default bg-white/80 text-[#252B31] hover:border-[#FFB58F] hover:bg-white hover:text-primary",
            ].join(" ")}
        >
            {children}
        </a>
    )
}