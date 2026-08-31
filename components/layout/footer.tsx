import Link from "next/link"
import { Send } from "lucide-react"

import { LogoMark } from "@/components/ui/logo"

const columns = [
  {
    title: "Platforma",
    links: [
      { href: "/", label: "Bosh sahifa" },
      { href: "/posts", label: "Maqolalar" },
      { href: "/creators", label: "Yozuvchilar" },
      { href: "/categories", label: "Kategoriyalar" },
    ],
  },
  {
    title: "Ma'lumot",
    links: [
      { href: "/about", label: "Haqida" },
      { href: "/privacy", label: "Maxfiylik siyosati" },
      { href: "/terms", label: "Foydalanish shartlari" },
      { href: "/contact", label: "Aloqa" },
    ],
  },
  {
    title: "Yordam",
    links: [
      { href: "/contact", label: "Bog'lanish" },
      { href: "/about", label: "Biz haqimizda" },
    ],
  },
]

function TelegramIcon() {
  return <Send size={16} strokeWidth={1.8} />
}

const socialLinks = [
  {
    href: "https://t.me/inklyuz",
    label: "Telegram",
    icon: TelegramIcon,
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-white">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-8">

        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.25fr_2fr_1.2fr] lg:gap-16">

          <div className="max-w-[270px]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5"
            >
              <LogoMark />

              <span className="text-[25px] font-bold tracking-[-0.055em] text-text-primary">
                inkly
              </span>
            </Link>

            <p className="mt-5 text-[13px] leading-[1.75] text-foreground-muted">
              Yozuvchilar, fikr yurituvchilar va ijodkorlar
              uchun zamonaviy blog platformasi.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {socialLinks.map((social) => {
                const Icon = social.icon

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-all duration-200 hover:bg-inkly-orange-light hover:text-primary"
                  >
                    <Icon />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-8">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[12px] font-semibold text-text-primary">
                  {column.title}
                </h3>

                <div className="mt-5 flex flex-col gap-3.5">
                  {column.links.map((link) => (
                    <Link
                      key={`${column.title}-${link.href}`}
                      href={link.href}
                      className="w-fit text-[12px] text-foreground-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-default py-6 text-[11px] text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Inkly.
            Barcha huquqlar himoyalangan.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary"
            >
              Maxfiylik
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-primary"
            >
              Foydalanish shartlari
            </Link>

            <Link
              href="/"
              className="font-semibold tracking-[-0.02em] text-[#222]"
            >
              inkly.uz
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}