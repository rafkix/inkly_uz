import Link from "next/link"
import { Compass, Home } from "lucide-react"
import { LogoMark } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6">
      {/* ── Orqa fon: yumshoq radial nur ─────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,106,0,0.06) 0%, rgba(255,138,61,0.03) 45%, transparent 75%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <LogoMark size={40} className="mb-8" />

        {/* ── 404 katta raqam ── */}
        <div className="relative mb-4">
          <span
            className="select-none text-[7rem] font-bold leading-none tracking-tighter text-text-primary sm:text-[9rem]"
            style={{
              backgroundImage: "linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-text-secondary) 55%, var(--color-text-muted) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            404
          </span>
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Sahifa topilmadi
        </h1>
        <p className="mb-10 max-w-sm text-balance text-base leading-relaxed text-text-secondary">
          Siz izlagan sahifa mavjud emas, o&apos;chirilgan yoki manzil noto&apos;g&apos;ri kiritilgan bo&apos;lishi mumkin.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <Home size={16} />
              Bosh sahifaga qaytish
            </Button>
          </Link>
          <Link href="/posts">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              <Compass size={16} />
              Maqolalarni ko&apos;rish
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
