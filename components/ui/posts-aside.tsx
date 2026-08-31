"use client"

import { useState } from "react"
import Link from "next/link"
import {
    ArrowUpRight,
    BriefcaseBusiness,
    Check,
    Code2,
    FlaskConical,
    GraduationCap,
    Palette,
    Sparkles,
    Tag,
    UserRound,
} from "lucide-react"

import type { CategoryPublicResponse } from "@/types/api"
import { LoadingDots } from "@/components/ui/loading-dots"

interface PostsAsideProps {
    categories: CategoryPublicResponse[]
    totalPosts: number
}

const categoryIcons = [
    Tag,
    BriefcaseBusiness,
    Code2,
    Palette,
    UserRound,
    FlaskConical,
    Sparkles,
    GraduationCap,
]

export function PostsAside({
    categories,
    totalPosts,
}: PostsAsideProps) {
    return (
        <aside className="flex w-full flex-col gap-4">
            <CategoriesCard
                categories={categories}
                totalPosts={totalPosts}
            />

            {/* BUG 3 FIX: TrendingCard olib tashlandi — hardcoded "Test" ma'lumot bor edi,
                haqiqiy trending API endpoint tayyor bo'lgach qayta qo'shiladi */}

            <SubscribeCard />
        </aside>
    )
}

function CategoriesCard({
    categories,
    totalPosts,
}: {
    categories: CategoryPublicResponse[]
    totalPosts: number
}) {
    return (
        <section className="rounded-xl border border-border-default bg-white p-4">
            <h2 className="mb-4 text-base font-semibold tracking-tight text-text-primary">
                Kategoriyalar
            </h2>

            <div className="flex flex-col gap-1">
                <CategoryItem
                    href="/posts"
                    label="Barchasi"
                    count={totalPosts}
                    icon={Tag}
                    active
                />

                {categories.slice(0, 8).map((category, index) => {
                    const Icon = categoryIcons[index % categoryIcons.length]

                    return (
                        <CategoryItem
                            key={category.uuid}
                            href={`/posts?category=${encodeURIComponent(category.slug)}`}
                            label={category.name}
                            count={Number(category.posts_count) || 0}
                            icon={Icon}
                        />
                    )
                })}
            </div>

            {categories.length > 8 && (
                <Link
                    href="/categories"
                    className="mt-3 flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-inkly-hover"
                >
                    Barcha kategoriyalar
                    <ArrowUpRight size={14} />
                </Link>
            )}
        </section>
    )
}

function CategoryItem({
    href,
    label,
    count,
    icon: Icon,
    active = false,
}: {
    href: string
    label: string
    count?: number
    icon: React.ElementType
    active?: boolean
}) {
    return (
        <Link
            href={href}
            className={[
                "flex min-h-9 items-center gap-2",
                "rounded-lg px-2 py-1.5 text-sm",
                "transition-colors",
                active
                    ? "bg-inkly-orange-light text-primary"
                    : "text-text-primary hover:bg-bg-muted",
            ].join(" ")}
        >
            <span
                className={[
                    "flex h-4 w-4 shrink-0",
                    "items-center justify-center",
                    "rounded-sm border",
                    active
                        ? "border-inkly-coral"
                        : "border-border-default",
                ].join(" ")}
            >
                <Icon size={10} strokeWidth={1.7} />
            </span>

            <span className="min-w-0 flex-1 truncate">
                {label}
            </span>

            {typeof count === "number" && (
                <span
                    className={[
                        "rounded-full px-2 py-0.5",
                        "text-[11px] font-medium",
                        active
                            ? "bg-white text-primary"
                            : "bg-bg-muted text-text-muted",
                    ].join(" ")}
                >
                    {count}
                </span>
            )}
        </Link>
    )
}

/* ── BUG 4 FIX: SubscribeCard — real form handler qo'shildi ────────────────
   Avval: form submit qilganda sahifa reload bo'lar, hech narsa saqlanmasdi.
   Endi: e.preventDefault() bilan to'xtatiladi, email validatsiya qilinadi,
   yuklash holati ko'rsatiladi, muvaffaqiyat/xato xabar beriladi.
   Backend /api/v1/subscribe endpoint tayyor bo'lgach — fetch chaqiruvi qo'shiladi.
────────────────────────────────────────────────────────────────────────── */
function SubscribeCard() {
    const [email, setEmail] = useState("")
    const [agreed, setAgreed] = useState(false)
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errorMsg, setErrorMsg] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg("")

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMsg("To'g'ri email manzil kiriting")
            return
        }
        if (!agreed) {
            setErrorMsg("Maxfiylik siyosatiga rozilik bildiring")
            return
        }

        setStatus("loading")
        try {
            // TODO: real subscribe endpoint ulanganda quyidagi izohni oching:
            // await fetch("/api/v1/subscribe", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({ email }),
            // })
            await new Promise((r) => setTimeout(r, 600)) // placeholder
            setStatus("success")
            setEmail("")
            setAgreed(false)
        } catch {
            setStatus("error")
            setErrorMsg("Xatolik yuz berdi. Qayta urinib ko'ring.")
        }
    }

    if (status === "success") {
        return (
            <section className="rounded-xl border border-success-soft-border bg-success-soft p-4">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success">
                        <Check size={16} className="text-white" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-success">Obuna bo'ldingiz!</p>
                        <p className="text-xs text-success mt-0.5">Yangi maqolalar haqida xabar olasiz.</p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="rounded-xl border border-inkly-peach bg-inkly-orange-light p-4">
            <p className="text-sm font-medium leading-5 text-text-primary">
                Yangi maqolalar va imkoniyatlar haqida birinchilardan bo'lib biling.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2" noValidate>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg("") }}
                    placeholder="Email manzilingiz"
                    disabled={status === "loading"}
                    className={[
                        "h-10 w-full rounded-lg border",
                        "bg-white px-3",
                        "text-sm text-text-primary",
                        "outline-none",
                        "placeholder:text-text-muted",
                        "disabled:opacity-60",
                        "transition-colors",
                        errorMsg
                            ? "border-red-400 focus:border-red-500"
                            : "border-border-default focus:border-primary",
                    ].join(" ")}
                />

                {errorMsg && (
                    <p className="text-[11px] text-red-500">{errorMsg}</p>
                )}

                <button
                    type="submit"
                    disabled={status === "loading"}
                    className={[
                        "flex h-10 items-center",
                        "justify-center gap-2",
                        "rounded-lg bg-primary",
                        "px-4 text-sm font-semibold",
                        "text-white transition-colors",
                        "hover:bg-inkly-hover",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                    ].join(" ")}
                >
                    {status === "loading" ? (
                        <><LoadingDots size="sm" /> Yuborilmoqda...</>
                    ) : (
                        <>Obuna bo'lish <ArrowUpRight size={14} /></>
                    )}
                </button>

                <label className="mt-1 flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-text-muted">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => { setAgreed(e.target.checked); setErrorMsg("") }}
                        className="mt-0.5 h-3 w-3 cursor-pointer"
                    />
                    <span>
                        <Link href="/privacy" className="underline hover:text-primary transition-colors">
                            Maxfiylik siyosatiga
                        </Link>{" "}
                        roziman
                    </span>
                </label>
            </form>
        </section>
    )
}