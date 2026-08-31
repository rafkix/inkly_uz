import { Metadata } from "next"
import { Container } from "@/components/layout/containers"

export const metadata: Metadata = {
  title: "Foydalanish shartlari - Inkly",
  description: "Inkly platformasidan foydalanish shartlari va qoidalari.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-border-default">
        <Container variant="marketing" className="py-24 sm:py-32">
          <h1 className="font-display mb-6 text-[40px] font-medium tracking-[-0.02em] text-text-primary leading-[1.1] sm:text-[52px] lg:text-[60px]">
            Foydalanish shartlari
          </h1>
          <p className="text-[15px] leading-relaxed text-text-secondary sm:text-base">
            So&apos;nggi yangilanish: 15-Avgust, 2026-yil
          </p>
        </Container>
      </section>

      {/* Main Content */}
      <section className="border-t border-border-default bg-white">
        <Container variant="marketing" className="py-20 sm:py-28 flex flex-col md:flex-row gap-12">
          
          {/* Sidebar / Quick Links (Hidden on small screens) */}
          <aside className="hidden md:block w-64 shrink-0 relative">
            <div className="sticky top-12 space-y-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-6">Mundarija</h3>
              <ul className="space-y-4 text-sm text-text-secondary font-medium">
                <li><a href="#rights" className="hover:text-primary transition-colors">1. Kontentga bo&apos;lgan huquqlar</a></li>
                <li><a href="#prohibited" className="hover:text-primary transition-colors">2. Taqiqlangan harakatlar</a></li>
                <li><a href="#liability" className="hover:text-primary transition-colors">3. Mas&apos;uliyatni cheklash</a></li>
                <li><a href="#changes" className="hover:text-primary transition-colors">4. Shartlarga o&apos;zgartirish</a></li>
              </ul>
            </div>
          </aside>

          {/* Terms text */}
          <article className="prose prose-inkly prose-lg max-w-none text-text-secondary">
            <p className="lead text-text-primary">
              Ushbu Foydalanish shartlari (&quot;Shartlar&quot;) siz va Inkly platformasi o&apos;rtasidagi munosabatlarni tartibga soladi. Platformadan ro&apos;yxatdan o&apos;tish yoki undan foydalanish orqali siz ushbu shartlarga rozi ekanligingizni bildirasiz.
            </p>

            <h2 id="rights" className="font-display text-[22px] font-medium tracking-[-0.02em] text-text-primary mt-16 mb-6 sm:text-[26px]">1. Kontentga bo&apos;lgan huquqlar</h2>
            <p>
              Siz Inkly platformasida chop etgan har bir maqola, matn, surat yoki boshqa materiallar (&quot;Kontent&quot;) uchun to&apos;liq huquqqa ega bo&apos;lib qolasiz. Biz sizning intellektual mulkingizga da&apos;vo qilmaymiz.
            </p>
            <p>
              Biroq, tizim ishlashi uchun siz bizga ushbu kontentni serverlarda saqlash, nusxalash va internet tarmog&apos;ida ommaga namoyish etish bo&apos;yicha cheklanmagan litsenziyani taqdim etasiz.
            </p>

            <h2 id="prohibited" className="font-display text-[22px] font-medium tracking-[-0.02em] text-text-primary mt-16 mb-6 sm:text-[26px]">2. Taqiqlangan harakatlar va kontent</h2>
            <p>
              Platforma toza, madaniyatli va xavfsiz muhitni saqlashga intiladi. Quyidagi turdagi kontentlarni joylashtirish qat&apos;iyan man etiladi:
            </p>
            <ul className="space-y-2">
              <li>O&apos;zbekiston Respublikasi qonunchiligiga zid bo&apos;lgan har qanday ma&apos;lumotlar.</li>
              <li>O&apos;zgalarning mualliflik huquqlarini to&apos;g&apos;ridan-to&apos;g&apos;ri buzuvchi materiallar (plagiat).</li>
              <li>Nafrat, zo&apos;ravonlik, kamsitish yoki irqchilikni targ&apos;ib qiluvchi matnlar.</li>
              <li>Spam, fishing havolalar yoki zararli dasturlarni tarqatuvchi postlar.</li>
              <li>Pornografik yoki 18+ yosh chegarasidagi keskin materiallar.</li>
            </ul>
            <p>
              Agar shu kabi materiallar aniqlansa, Inkly ma&apos;muriyati kontentni ogohlantirishsiz o&apos;chirish va foydalanuvchi akkauntini bloklash huquqini o&apos;zida saqlab qoladi.
            </p>

            <h2 id="liability" className="font-display text-[22px] font-medium tracking-[-0.02em] text-text-primary mt-16 mb-6 sm:text-[26px]">3. Mas&apos;uliyatni cheklash</h2>
            <p>
              Inkly platformasi asosan axborot vositachisi hisoblanadi. Biz foydalanuvchilar tomonidan joylashtirilgan maqolalarning aniqligi, to&apos;g&apos;riligi yoki huquqiy oqibatlari uchun javobgarlikni zimmamizga olmaymiz. Har bir muallif o&apos;zi yozgan matnga shaxsan o&apos;zi javobgardir.
            </p>
            <p>
              Biz tizim uzluksiz ishlashiga harakat qilamiz, lekin server uzilishlari, ma&apos;lumotlar yo&apos;qolishi yoki texnik nosozliklar yuz berganda kompensatsiya to&apos;lash majburiyatiga ega emasmiz.
            </p>

            <h2 id="changes" className="font-display text-[22px] font-medium tracking-[-0.02em] text-text-primary mt-16 mb-6 sm:text-[26px]">4. Shartlarga o&apos;zgartirish kiritish</h2>
            <p>
              Inkly ushbu shartlarga vaqt-vaqti bilan o&apos;zgartirish kiritishi mumkin. Agar shartlarda jiddiy o&apos;zgarishlar bo&apos;lsa, sizni ro&apos;yxatdan o&apos;tgan pochtangiz yoki platformadagi bildirishnomalar orqali xabardor qilamiz.
            </p>
            <p>
              O&apos;zgarishlardan so&apos;ng platformadan foydalanishda davom etishingiz yangi shartlarni qabul qilganingizni anglatadi.
            </p>
            
          </article>
        </Container>
      </section>
    </main>
  )
}
