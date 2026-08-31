"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, PenLine, Settings, BookOpen, LogOut, ExternalLink, Menu, X, Bell, ChevronLeft, User, Palette, Search, ChevronRight,  } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { LogoMark } from "@/components/ui/logo"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"
import { LoadingDots } from "@/components/ui/loading-dots"
import { notificationsApi } from "@/lib/api/notifications"

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { href: "/dashboard",       icon: LayoutDashboard, label: "Dashboard" },
  { href: "/write",           icon: PenLine,         label: "Yozish" },
  { href: "/telegram", icon: User,           label: "Telegram" },
  { href: "/dashboard/posts", icon: BookOpen,        label: "Maqolalarim" },
  { href: "/dashboard/settings/profile",icon: Settings,        label: "Sozlamalar" },
  { href: "/dashboard/notifications", icon: Bell, label: "Bildirishnomalar" },
  { href: "/dashboard/settings/appearance", icon: Palette,     label: "Ko'rinish" },
]

// Route → page title mapping for breadcrumb
const PAGE_TITLES: Record<string, string> = {
  "/dashboard":             "Dashboard",
  "/write":                 "Yangi maqola",
  "/telegram":              "Telegram",
  "/dashboard/posts":       "Maqolalarim",
  "/dashboard/settings/profile":      "Sozlamalar",
  "/dashboard/settings/appearance":   "Ko'rinish",
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + "/")) return val
  }
  return "Inkly"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(href + "/")
}

// ─── NavLinks ─────────────────────────────────────────────────────────────────
function NavLinks({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-0.5 px-2 py-2">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150",
              collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
              active
                ? "text-primary"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            {/* Active background */}
            {active && (
              <span
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255,106,0,0.10) 0%, rgba(255,138,61,0.06) 100%)",
                  border: "1px solid rgba(255,106,0,0.14)",
                }}
              />
            )}
            {/* Hover background */}
            {!active && (
              <span className="absolute inset-0 rounded-xl bg-transparent transition-colors duration-150 group-hover:bg-bg-muted" />
            )}

            <Icon
              size={15}
              className={cn(
                "relative shrink-0 transition-colors duration-150",
                active ? "text-primary" : "text-text-muted group-hover:text-text-muted",
              )}
            />
            {!collapsed && (
              <>
                <span className="relative flex-1 truncate">{label}</span>
                {active && (
                  <span
                    className="relative h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--color-inkly-orange)" }}
                  />
                )}
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar() {
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery("")
      ;(e.target as HTMLInputElement).blur()
    }
    if (e.key === "Escape") {
      setQuery("")
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div
      className="relative flex items-center"
      style={{
        width: focused ? 220 : 180,
        transition: "width 220ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <div
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: focused ? "var(--color-white)" : "var(--color-bg-muted)",
          border: `1.5px solid ${focused ? "rgba(255,106,0,0.35)" : "var(--color-border-default)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(255,106,0,0.08)" : "none",
          transition: "all 180ms cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <Search
          size={14}
          style={{
            color: focused ? "var(--color-inkly-orange)" : "#9CA3AF",
            transition: "color 180ms ease",
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          placeholder="Qidirish…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-sm outline-none placeholder:text-border-default"
          style={{ color: "var(--color-text-primary)" }}
        />
        {focused && (
          <kbd
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              background: "var(--color-inkly-orange-light)",
              color: "#9CA3AF",
              border: "1px solid var(--color-border-default)",
            }}
          >
            ↵
          </kbd>
        )}
      </div>
    </div>
  )
}

// ─── Notification Button ───────────────────────────────────────────────────────
function NotificationButton({ count }: { count: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150"
      style={{
        background: hovered ? "var(--color-bg-muted)" : "transparent",
        border: `1.5px solid ${hovered ? "var(--color-border-default)" : "transparent"}`,
      }}
      aria-label="Bildirishnomalar"
    >
      <Bell size={17} style={{ color: hovered ? "var(--color-text-primary)" : "var(--color-text-muted)" }} />
      {count > 0 && (
        <span
          className="absolute flex items-center justify-center font-bold text-white"
          style={{
            top: 4,
            right: 4,
            minWidth: 16,
            height: 16,
            borderRadius: 99,
            fontSize: 9,
            background: "linear-gradient(135deg, var(--color-inkly-orange), var(--color-inkly-coral))",
            boxShadow: "0 0 0 2px var(--color-white)",
            padding: "0 3px",
          }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  )
}

// ─── ProfileDropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({
  user,
  onLogout,
}: {
  user: { full_name: string; username: string; avatar?: string }
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-150 hover:bg-bg-muted"
        style={{
          border: `1.5px solid ${open ? "var(--color-border-default)" : "transparent"}`,
        }}
      >
        <Avatar src={user.avatar} name={user.full_name} size={28} />
        <ChevronRight
          size={13}
          className={cn(
            "hidden text-text-muted transition-transform duration-200 sm:block",
            open && "rotate-90",
          )}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden"
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-border-default)",
            borderRadius: 16,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 12px 32px -4px rgba(0,0,0,0.10)",
          }}
        >
          {/* User card */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-inkly-orange-light)" }}
          >
            <Avatar src={user.avatar} name={user.full_name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{user.full_name}</p>
              <p className="truncate text-xs text-text-muted">@{user.username}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            {[
              { href: `/@${user.username}`, icon: User, label: "Sahifam", external: true },
              { href: "/dashboard/settings/profile",  icon: Settings, label: "Sozlamalar" },
              { href: "/dashboard/settings/appearance", icon: Palette, label: "Ko'rinish" },
            ].map(({ href, icon: Icon, label, external }) => (
              <Link
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-muted hover:text-text-primary"
              >
                <Icon size={14} className="text-text-muted" />
                <span className="flex-1">{label}</span>
                {external && <ExternalLink size={11} className="text-border-default" />}
              </Link>
            ))}
          </div>

          <div className="p-1.5" style={{ borderTop: "1px solid var(--color-inkly-orange-light)" }}>
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-red-50"
              style={{ color: "#EF4444" }}
            >
              <LogOut size={14} />
              Chiqish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar section label ─────────────────────────────────────────────────────
function SectionLabel({ label, collapsed }: { label: string; collapsed?: boolean }) {
  if (collapsed) return <div className="mx-auto my-2 h-px w-6" style={{ background: "var(--color-border-default)" }} />
  return (
    <p
      className="mx-3 mb-1 mt-3 text-[10px] font-semibold uppercase tracking-widest"
      style={{ color: "#C4BEB8" }}
    >
      {label}
    </p>
  )
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state, logout } = useAuth()
  const { user, loading } = state
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  const fetchNotifCount = useCallback(async () => {
    const tok = state.token
    if (!tok) return
    try {
      const res = await notificationsApi.unreadCount(tok) as { count?: number; unread_count?: number } | null
      if (res && typeof res === "object") {
        const count = (res as { count?: number; unread_count?: number }).count
          ?? (res as { count?: number; unread_count?: number }).unread_count
          ?? 0
        setNotifCount(Number(count))
      }
    } catch {
      // silently ignore — badge simply stays 0
    }
  }, [state.token])

  useEffect(() => {
    fetchNotifCount()
    const id = setInterval(fetchNotifCount, 60_000)
    return () => clearInterval(id)
  }, [fetchNotifCount])

  const pageTitle  = getPageTitle(pathname)

  // /write sahifasi dashboard layoutisiz ishlaydi
  if (pathname === "/write" || pathname.startsWith("/write/")) {
    return <>{children}</>
  }

  // ── Auth guard ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-muted">
        <LoadingDots size="lg" className="size-6 text-primary" />
      </div>
    )
  }

  if (!user) {
    if (typeof window !== "undefined") {
      const next = encodeURIComponent(pathname || "/dashboard")
      router.replace(`/login?next=${next}`)
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-muted">
        <LoadingDots size="lg" className="size-6 text-primary" />
      </div>
    )
  }

  // Blocked accounts: force logout and redirect
  if (user.status === "blocked") {
    if (typeof window !== "undefined") {
      logout().finally(() => router.replace("/login?reason=blocked"))
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-muted">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-red-500">Akkauntingiz bloklangan.</p>
          <p className="text-xs text-text-muted">Qo&apos;shimcha ma&apos;lumot uchun support@inkly.uz ga murojaat qiling.</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.replace("/")
  }

  // ── Sidebar inner ────────────────────────────────────────────────────────────
  function SidebarInner({ mobile = false }: { mobile?: boolean }) {
    const isCollapsed = collapsed && !mobile
    return (
      <>
        {/* Logo row */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center",
            isCollapsed ? "justify-center px-3" : "justify-between px-4",
          )}
          style={{ borderBottom: "1px solid var(--color-inkly-orange-light)" }}
        >
          {!isCollapsed && (
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={mobile ? () => setMobileOpen(false) : undefined}
            >
              <LogoMark size={20} />
              <span className="text-[15px] font-bold tracking-tighter text-text-primary">inkly</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/">
              <LogoMark size={20} />
            </Link>
          )}
          {mobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-muted"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-1">
          <SectionLabel label="Asosiy" collapsed={isCollapsed} />
          <NavLinks
            pathname={pathname}
            collapsed={isCollapsed}
            onNavigate={mobile ? () => setMobileOpen(false) : undefined}
          />
        </div>

        {/* User footer */}
        {user && (
          <div style={{ borderTop: "1px solid var(--color-inkly-orange-light)", padding: "8px" }}>
            {isCollapsed ? (
              <div className="flex justify-center py-1">
                <Avatar src={user.avatar} name={user.full_name} size={30} />
              </div>
            ) : (
              <div
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-bg-muted"
                style={{ cursor: "default" }}
              >
                <Avatar src={user.avatar} name={user.full_name} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-text-primary">
                    {user.full_name}
                  </p>
                  <p className="truncate text-[11px] leading-tight text-text-muted">
                    @{user.username}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Chiqish"
                  className="rounded-lg p-1.5 text-border-default transition-colors hover:bg-red-50 hover:text-red-400"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg-muted)" }}>

      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col bg-white transition-all duration-200 lg:flex",
          collapsed ? "w-[60px]" : "w-[220px]",
        )}
        style={{ borderRight: "1px solid var(--color-border-default)" }}
      >
        <SidebarInner />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-[4.5rem] flex h-6 w-6 items-center justify-center rounded-full bg-white transition-all duration-150 hover:border-primary hover:text-primary"
          style={{
            border: "1.5px solid var(--color-border-default)",
            color: "#9CA3AF",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
          title={collapsed ? "Kengaytirish" : "Yiqish"}
        >
          <ChevronLeft
            size={11}
            className={cn("transition-transform duration-200", collapsed && "rotate-180")}
          />
        </button>
      </aside>

      {/* ── Mobile Drawer ───────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(20,20,20,0.35)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white"
            style={{
              borderRight: "1px solid var(--color-border-default)",
              boxShadow: "4px 0 24px rgba(0,0,0,0.10)",
            }}
          >
            <SidebarInner mobile />
          </aside>
        </div>
      )}

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* ── Topbar ──────────────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between px-4 lg:px-5"
          style={{
            background: "rgba(255,255,255,0.92)",
            borderBottom: "1px solid var(--color-border-default)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Left — mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-muted lg:hidden"
              aria-label="Menyuni ochish"
            >
              <Menu size={18} />
            </button>

            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-1.5 lg:hidden">
              <LogoMark size={18} />
              <span className="text-sm font-bold tracking-tighter text-text-primary">inkly</span>
            </Link>

            {/* Desktop breadcrumb */}
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-sm font-semibold text-text-primary">{pageTitle}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Search — hidden on mobile */}
            <div className="hidden sm:block">
              <SearchBar />
            </div>

            {/* Write CTA */}
            <Link
              href="/write"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, var(--color-inkly-orange) 0%, var(--color-inkly-coral) 100%)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.15) inset, 0 2px 8px rgba(255,106,0,0.28)",
              }}
            >
              <PenLine size={13} />
              <span className="hidden sm:inline">Yangi maqola</span>
              <span className="sm:hidden">Yoz</span>
            </Link>

            <NotificationButton count={notifCount} />

            {user && (
              <ProfileDropdown
                user={{ ...user, avatar: user.avatar ?? undefined }}
                onLogout={handleLogout}
              />
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}