import { Metadata } from "next"
import { Check, Shield, Type, PenLine } from "lucide-react"
import { Container } from "@/components/layout/containers"

export const metadata: Metadata = {
  title: "Biz haqimizda - Inkly",
  description: "Inkly platformasi haqida ma'lumot. Erkin ijodkorlar uchun eng qulay yozish maydoni.",
}

const features = [
  {
    icon: Check,
    title: "Minimalizm",
    text: "Hech qanday ortiqcha elementlarsiz toza interfeys. Sizning diqqatingizni yozishdan chalg'itadigan hech narsa yo'q.",
    palette: { iconBg: "bg-inkly-orange-light", iconFg: "text-primary" },
  },
  {
    icon: Shield,
    title: "Xavfsizlik",
    text: "Ma'lumotlaringiz xavfsiz va ishonchli saqlanadi. Loyihalar ustida xavotirsiz ishlashingiz mumkin.",
    palette: { iconBg: "bg-violet-50", iconFg: "text-violet-600" },
  },
  {
    icon: Type,
    title: "Tipografiya",
    text: "Maxsus tanlangan shriftlar va satr oraliqlari asarlaringizni nafaqat o'qishga oson, balki vizual jihatdan go'zal qiladi.",
    palette: { iconBg: "bg-sky-50", iconFg: "text-sky-600" },
  },
  {
    icon: PenLine,
    title: "Oson tahrirlash",
    text: "Zamonaviy block-editor orqali matn, rasm, havola va boshqa unsurlarni birgina klik bilan qo'shish imkoniyati.",
    palette: { iconBg: "bg-emerald-50", iconFg: "text-emerald-600" },
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-border-default">
        <Container variant="marketing" className="py-24 sm:py-32">
          <h1 className="font-display mb-6 text-[40px] font-medium tracking-[-0.02em] text-text-primary leading-[1.1] sm:text-[52px] lg:text-[60px]">
            Biz haqimizda
          </h1>
          <p className="text-[15px] leading-relaxed text-text-secondary max-w-2xl sm:text-base md:text-lg">
            <strong>Inkly</strong> — erkin ijodkorlar, jurnalistlar va o'z fikrlarini yozib qoldirishni yaxshi ko'radigan insonlar uchun yaratilgan, chalg'ituvchi unsurlardan xoli platformadir.
          </p>
        </Container>
      </section>

      {/* Main Content */}
      <section className="border-t border-border-default bg-white">
        <Container variant="marketing" className="py-20 sm:py-28 flex flex-col gap-16 md:gap-24">
          
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="font-display text-[28px] font-medium tracking-[-0.02em] text-text-primary mb-4 sm:text-[34px] lg:text-[38px]">Bizning maqsadimiz</h2>
            </div>
            <div className="prose prose-inkly text-lg text-text-secondary">
              <p>
                Hozirgi axborot asrida diqqatni jamlash tobora qiyinlashib bormoqda. Murakkab interfeyslar, tinimsiz bildirishnomalar va keraksiz tugmalar yozuvchi uchun eng kerakli narsa — ilhomni bo'g'ib qo'yishi mumkin.
              </p>
              <p>
                Inkly aynan shu muammoga yechim sifatida dunyoga keldi. Biz yozuvchilarga fikrlarini erkin ifoda etishlari uchun barcha qulayliklarga ega, ammo shu bilan birga nihoyatda sodda va sokin muhitni taqdim etamiz. Sizning ishingiz faqat yozish; matnning qanday qilib mukammal ko'rinishi haqida biz qayg'uramiz.
              </p>
            </div>
          </div>

          <div className="border-t border-border-default pt-16 md:pt-24">
            <h2 className="font-display text-[28px] font-medium tracking-[-0.02em] text-text-primary mb-12 sm:text-[34px] lg:text-[38px]">Nima uchun aynan Inkly?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature.title} className="group p-6 rounded-2xl bg-white border border-border-default transition-all duration-300 hover:shadow-[0_4px_24px_rgba(20,20,20,0.06)] hover:border-primary/20">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.palette.iconBg} mb-4`}>
                    <feature.icon className={`h-5 w-5 ${feature.palette.iconFg}`} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-[17px] font-medium tracking-[-0.01em] text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-[14px] leading-relaxed text-text-secondary">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start border-t border-border-default pt-16 md:pt-24">
            <div>
              <h2 className="font-display text-[28px] font-medium tracking-[-0.02em] text-text-primary mb-4 sm:text-[34px] lg:text-[38px]">Bizning jamoa</h2>
            </div>
            <div className="prose prose-inkly text-lg text-text-secondary">
              <p>
                Biz texnologiyalar, dizayn va sifatli matnlar ustida qayg'uradigan yosh va tajribali mutaxassislar jamoasimiz. Bizning eng katta orzumiz — O'zbekiston va dunyo bo'ylab sifatli hamda savodli maqolalar ko'payishiga o'z hissamizni qo'shishdir.
              </p>
              <p>
                Inkly platformasini tanlaganingiz uchun tashakkur. Fikrlaringiz o'z o'quvchilarini topishiga chin dildan ishonamiz!
              </p>
            </div>
          </div>

        </Container>
      </section>
    </main>
  )
}
