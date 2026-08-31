import { Metadata } from "next"
import { Container } from "@/components/layout/containers"

export const metadata: Metadata = {
  title: "Maxfiylik siyosati - Inkly",
  description: "Inkly platformasida foydalanuvchi ma'lumotlarini yig'ish va qayta ishlash qoidalari.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-border-default">
        <Container variant="marketing" className="py-24 sm:py-32">
          <h1 className="font-display mb-6 text-[40px] font-medium tracking-[-0.02em] text-text-primary leading-[1.1] sm:text-[52px] lg:text-[60px]">
            Maxfiylik siyosati
          </h1>
          <p className="text-[15px] leading-relaxed text-text-secondary sm:text-base">
            Sizning shaxsiy ma&apos;lumotlaringiz xavfsizligi biz uchun muhim.
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
                <li><a href="#collected" className="hover:text-primary transition-colors">1. Yig&apos;iladigan ma&apos;lumotlar</a></li>
                <li><a href="#usage" className="hover:text-primary transition-colors">2. Ma&apos;lumotlardan foydalanish</a></li>
                <li><a href="#thirdparty" className="hover:text-primary transition-colors">3. Uchinchi shaxslar</a></li>
                <li><a href="#cookies" className="hover:text-primary transition-colors">4. Cookie fayllari</a></li>
                <li><a href="#delete" className="hover:text-primary transition-colors">5. Ma&apos;lumotlarni o&apos;chirish</a></li>
              </ul>
            </div>
          </aside>

          {/* Privacy text */}
          <article className="prose prose-inkly prose-lg max-w-none text-text-secondary">
            <p className="lead text-text-primary">
              Inkly platformasida biz sizning shaxsiy ma&apos;lumotlaringiz xavfsizligiga juda jiddiy qaraymiz. Ushbu siyosat qanday ma&apos;lumotlar yig&apos;ilishi va ulardan qanday foydalanilishini batafsil tushuntiradi.
            </p>

            <h2 id="collected" className="font-display text-[22px] font-medium tracking-[-0.02em] text-text-primary mt-16 mb-6 sm:text-[26px]">1. Yig&apos;iladigan ma&apos;lumotlar</h2>
            <p>
              Platformadan foydalanish uchun ro&apos;yxatdan o&apos;tganingizda, biz quyidagi ma&apos;lumotlarni so&apos;rashimiz va saqlashimiz mumkin:
            </p>
            <ul className="space-y-2">
              <li><strong>Ro&apos;yxatdan o&apos;tish ma&apos;lumotlari:</strong> Ismingiz (yoki taxallusingiz), elektron pochta manzilingiz va xavfsiz parolingiz (parollar doimiy shifrlangan holatda saqlanadi).</li>
              <li><strong>Profil ma&apos;lumotlari:</strong> O&apos;z ixtiyoringiz bilan kiritgan bio, ijtimoiy tarmoq havolalari yoki avatar rasmi.</li>
              <li><strong>Faollik tarixi:</strong> Tizimga kirish sanalari, chop etilgan maqolalar, IP manzil (tizim xavfsizligi va spamning oldini olish uchun).</li>
            </ul>

            <h2 id="usage" className="font-display text-[22px] font-medium tracking-[-0.02em] text-text-primary mt-16 mb-6 sm:text-[26px]">2. Ma&apos;lumotlardan qanday foydalanamiz?</h2>
            <p>Biz sizning ma&apos;lumotlaringizni faqat tizim faoliyatini ta&apos;minlash uchun, xususan quyidagi maqsadlarda ishlatamiz:</p>
            <ul className="space-y-2">
              <li>Platformada sizni identifikatsiya qilish va avtorizatsiya jarayonini ta&apos;minlash.</li>
              <li>Parolni unutganda tiklash kodlari va xizmatga oid muhim xabarlarni elektron pochtangizga yuborish.</li>
              <li>Xatoliklarni tahlil qilish, tizim sifatini va tezligini oshirish.</li>
              <li>Noqonuniy harakatlar, firibgarlik yoki spam tarqalishini aniqlash va ularning oldini olish.</li>
            </ul>

            <h2 id="thirdparty" className="font-display text-[22px] font-medium tracking-[-0.02em] text-text-primary mt-16 mb-6 sm:text-[26px]">3. Uchinchi shaxslarga uzatish</h2>
            <p>
              Biz sizning shaxsiy ma&apos;lumotlaringizni <strong>hech qachon</strong> uchinchi shaxslarga sotmaymiz yoki reklama beruvchilar bilan bo&apos;lishmaymiz.
            </p>
            <p>
              Sizning ma&apos;lumotlaringiz faqatgina Qonunchilik doirasida, rasmiy sud yoki huquq-tartibot organlari tomonidan rasmiy so&apos;rovnoma bilan talab qilingandagina oshkor etilishi mumkin (agar bu qonuniy asosga ega bo&apos;lsa).
            </p>

            <h2 id="cookies" className="font-display text-[22px] font-medium tracking-[-0.02em] text-text-primary mt-16 mb-6 sm:text-[26px]">4. Cookie fayllari (Cookies)</h2>
            <p>
              Platformamiz avtorizatsiya (sessiya) holatini saqlab qolish va sizning shaxsiy sozlamalaringizni eslab qolish uchun faqat eng zaruriy <strong>xavfsiz cookie</strong> (Secure / HttpOnly) fayllaridan foydalanadi. Biz uchinchi tomonlarning kuzatuvchi (obtrusive tracking) yoki reklama cookie-larini ishlatmaymiz.
            </p>

            <h2 id="delete" className="font-display text-[22px] font-medium tracking-[-0.02em] text-text-primary mt-16 mb-6 sm:text-[26px]">5. Ma&apos;lumotlarni o&apos;chirish huquqi</h2>
            <p>
              Siz istalgan vaqtda o&apos;z profilingizni va u yerdagi barcha maqolalaringizni to&apos;liq o&apos;chirib yuborish huquqiga egasiz. Akkaunt o&apos;chirilgach, ma&apos;lumotlar qayta tiklanmaydigan qilib serverlardan darhol va to&apos;liq tozalanadi.
            </p>
            <p className="mt-8">
              Barcha savol va takliflaringiz bo&apos;lsa bizga yozing: <a href="mailto:support@inkly.uz" className="text-primary font-medium hover:underline">support@inkly.uz</a>
            </p>
          </article>
        </Container>
      </section>
    </main>
  )
}
