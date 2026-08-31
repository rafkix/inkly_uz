"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDown, Menu, PenLine, Search, X } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "framer-motion"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/posts", label: "Maqolalar" },
  { href: "/about", label: "Haqida" },
]

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
}

const itemVariants: Variants = {
  closed: { opacity: 0, y: -8 },
  open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

// Navbar faqat mobil ekranda yashiriladigan sahifalar.
// Bu sahifalarning o'zining mobil "hero" header'i bor (masalan MobileHero),
// shuning uchun mobil kenglikda global Navbar bilan ustma-ust tushmasin.
// Desktopda esa Navbar to'liq ko'rinadi.
const HIDDEN_ON_MOBILE_PAGES = [
  /^\/(profile)\/@[^/]+$/,   // /@username — profil sahifasi
]

export function Navbar() {
  const { state } = useAuth()
  const { user, loading } = state
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Shu sahifalarda navbar faqat mobil enda yashiriladi (desktopda ko'rinadi)
  const isHiddenOnMobile = HIDDEN_ON_MOBILE_PAGES.some((pattern) => pattern.test(pathname))

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] w-full transition-all duration-300",
        isHiddenOnMobile && "hidden sm:block",
        scrolled
          ? "border-b border-border-default/80 bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[76px] w-full max-w-[1400px] items-center px-6 sm:px-8 lg:px-10">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/header.png"
            alt="Inkly"
            width={110}
            height={36}
            priority
            className="object-contain"
            style={{ height: 36, width: "auto" }}
          />
        </Link>

        {/* Desktop nav links */}
        <nav className="ml-[88px] hidden h-full items-center gap-[36px] lg:flex">
          {links.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex h-full items-center text-[13px] font-medium tracking-[-0.01em] transition-colors",
                  active ? "text-primary" : "text-text-primary hover:text-primary"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-[11px] left-0 right-0 h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop right */}
        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <Link
            href="/search"
            aria-label="Qidirish"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-inkly-orange-light hover:text-primary"
          >
            <Search size={20} strokeWidth={1.8} />
          </Link>

          {loading ? (
            <div className="h-9 w-[130px] animate-pulse rounded-full bg-bg-muted" />
          ) : user ? (
            <>
              <Link href="/write">
                <Button className="h-[38px] gap-2 rounded-lg bg-primary px-[15px] text-[12px] font-semibold text-white shadow-none hover:bg-inkly-hover">
                  <PenLine size={14} strokeWidth={1.9} />
                  Maqola yozish
                </Button>
              </Link>
              <Link
                href={user?.username ? `/@${user.username}` : "/dashboard"}
                className="group flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-inkly-orange-light"
              >
                <Avatar src={user.avatar} name={user.full_name} size={32} />
                <span className="max-w-[145px] truncate text-[12px] font-medium text-text-primary">
                  inkly.uz/@{user.username}
                </span>
                <ChevronDown size={15} strokeWidth={1.8} className="shrink-0 text-[#444]" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13px] font-medium text-text-primary transition-colors hover:text-primary"
              >
                Kirish
              </Link>
              <Link href="/register">
                <Button className="h-[38px] rounded-lg bg-primary px-4 text-[12px] font-semibold text-white shadow-none hover:bg-inkly-hover">
                  Boshlash
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          {user && (
            <Link
              href={user?.username ? `/@${user.username}` : "/dashboard"}
              aria-label="Profilim"
            >
              <Avatar src={user.avatar} name={user.full_name} size={32} />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-navbar"
            aria-label="Menyu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#222] transition-colors hover:bg-inkly-orange-light hover:text-primary"
          >
            {open ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-navbar"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden border-t border-border-default bg-white/95 backdrop-blur-md lg:hidden"
          >
            <nav className="mx-auto flex max-w-[1400px] flex-col px-6 py-4 sm:px-8">
              {links.map((link) => {
                const active = isActive(link.href)
                return (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-[14px] font-medium transition-colors",
                        active ? "bg-inkly-orange-light text-primary" : "text-[#222] hover:bg-inkly-orange-light"
                      )}
                    >
                      {link.label}
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  </motion.div>
                )
              })}

              {user && (
                <motion.div variants={itemVariants} className="mt-2">
                  <Link
                    href={user?.username ? `/@${user.username}` : "/dashboard"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-[#222] transition-colors hover:bg-inkly-orange-light"
                  >
                    <Avatar src={user.avatar} name={user.full_name} size={28} />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-text-primary">
                        {user.full_name}
                      </span>
                      <span className="text-[11px] text-foreground-muted">
                        @{user.username}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )}

              {user && (
                <motion.div
                  variants={itemVariants}
                  className="mt-3 border-t border-border-default pt-3"
                >
                  <Link
                    href="/write"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[13px] font-semibold text-white hover:bg-inkly-hover"
                  >
                    <PenLine size={15} />
                    Maqola yozish
                  </Link>
                </motion.div>
              )}

              {!user && !loading && (
                <motion.div
                  variants={itemVariants}
                  className="mt-3 grid grid-cols-2 gap-2 border-t border-border-default pt-3"
                >
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-border-default px-4 py-3 text-[13px] font-medium text-[#222]"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-[13px] font-semibold text-white"
                  >
                    Boshlash
                  </Link>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}