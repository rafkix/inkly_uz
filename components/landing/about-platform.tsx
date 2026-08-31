import { Container } from "@/components/layout/containers"

export function AboutPlatform() {
  return (
    <section
      aria-labelledby="about-platform-heading"
      className="border-t border-border-default bg-bg-muted/40 px-4 py-20 sm:px-6 sm:py-28"
    >
      <Container variant="marketing">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Platforma haqida
          </p>
          <h2
            id="about-platform-heading"
            className="font-display mt-3 text-balance text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary sm:text-[34px] lg:text-[38px]"
          >
            Inkly nima?
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-text-secondary sm:text-base">
            Inkly — o&apos;z fikrlarini, bilimlarini va tajribasini yozib qoldirishni
            yaxshi ko&apos;radigan insonlar uchun yaratilgan publishing platforma.
            Har bir foydalanuvchi o&apos;z shaxsiy blog sahifasiga ega bo&apos;ladi.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Kimlar uchun */}
          <div className="rounded-2xl border border-border-default bg-white p-6">
            <h3 className="font-display text-[17px] font-medium tracking-[-0.01em] text-text-primary">
              Kimlar uchun?
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
              Bloggerlar, jurnalistlar, talabalar, o&apos;qituvchilar, dasturchilar —
              har kim o&apos;z sohasida bilim va tajriba ulashmoqchi bo&apos;lsa.
            </p>
          </div>

          {/* Shaxsiy blog */}
          <div className="rounded-2xl border border-border-default bg-white p-6">
            <h3 className="font-display text-[17px] font-medium tracking-[-0.01em] text-text-primary">
              Shaxsiy blog sahifa
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
              inkly.uz/@username — barcha maqolalaringiz bitta manzilda, sizning ismingiz
              ostida to&apos;planadi.
            </p>
          </div>

          {/* Auditoriya */}
          <div className="rounded-2xl border border-border-default bg-white p-6">
            <h3 className="font-display text-[17px] font-medium tracking-[-0.01em] text-text-primary">
              Auditoriya yarating
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
              Boshqa mualliflarni kuzating, o&apos;z o&apos;quvchilaringizni to&apos;plang
              va ular bilan reaksiya va izohlar orqali muloqot qiling.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
