"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const telegramNavItems = [
  { href: "/telegram/account", label: "Akkaunt" },
  { href: "/telegram/channels", label: "Kanallar" },
  { href: "/telegram/verify", label: "Tasdiqlash" },
] as const

export default function TelegramLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-bg-muted">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-border-default bg-white lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border-default px-5">
          <Link href="/" className="flex items-center gap-2 text-text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-lg font-bold tracking-tighter">inkly</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {telegramNavItems.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-inkly-orange-light text-primary"
                    : "text-text-secondary hover:bg-bg-muted hover:text-text-primary",
                )}
              >
                {label === "Akkaunt" && (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-primary" : "text-text-muted"} aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <path d="M16 21h4a2 2 0 0 0 2-2v-4" />
                  </svg>
                )}
                {label === "Kanallar" && (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-primary" : "text-text-muted"} aria-hidden="true">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <path d="M4 22h16" />
                    <path d="M12 15v7" />
                  </svg>
                )}
                {label === "Tasdiqlash" && (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-primary" : "text-text-muted"} aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                )}
                <span className="flex-1">{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="flex h-14 items-center justify-between border-b border-border-default bg-white px-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-text-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-base font-bold tracking-tighter">inkly</span>
          </Link>
        </header>

        {/* Desktop topbar */}
        <header className="hidden h-14 items-center justify-between border-b border-border-default bg-white px-6 lg:flex">
          <div className="text-sm font-medium text-text-secondary">Telegram sozlamalari</div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}