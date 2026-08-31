import { Metadata } from "next"
import { Mail, Briefcase, Send, Smartphone } from "lucide-react"
import { Container } from "@/components/layout/containers"

export const metadata: Metadata = {
  title: "Aloqa - Inkly",
  description: "Inkly jamoasi bilan bog'lanish uchun aloqa ma'lumotlari.",
}

const contacts = [
  {
    icon: Mail,
    title: "Yordam va qo'llab-quvvatlash",
    text: "Texnik muammolar, tizimda ishlash va umumiy savollar uchun asosiy elektron pochta manzilimiz.",
    link: "mailto:support@inkly.uz",
    linkText: "support@inkly.uz",
    linkColor: "text-primary",
    palette: { iconBg: "bg-inkly-orange-light", iconFg: "text-primary", hoverBg: "group-hover:bg-primary" },
  },
  {
    icon: Briefcase,
    title: "Hamkorlik va takliflar",
    text: "Biznes hamkorlik, reklama va o'zaro manfaatli takliflar yuzasidan murojaatlar uchun manzil.",
    link: "mailto:hello@inkly.uz",
    linkText: "hello@inkly.uz",
    linkColor: "text-text-primary",
    palette: { iconBg: "bg-violet-50", iconFg: "text-violet-600", hoverBg: "group-hover:bg-violet-600" },
  },
  {
    icon: Send,
    title: "Telegram kanal",
    text: "Inkly haqidagi eng so'nggi yangiliklar, foydali ma'lumotlar va yangilanishlarni kuzatib boring.",
    link: "https://t.me/inkly_uz",
    linkText: "@inkly_uz",
    linkColor: "text-brand-telegram",
    palette: { iconBg: "bg-sky-50", iconFg: "text-brand-telegram", hoverBg: "group-hover:bg-brand-telegram" },
    external: true,
  },
  {
    icon: Smartphone,
    title: "Avtorizatsiya boti",
    text: "Tizimga xavfsiz kirish uchun hamda ba'zi tezkor buyruqlar uchun mo'ljallangan maxsus bot.",
    link: "https://t.me/inkly_uz_bot",
    linkText: "@inkly_uz_bot",
    linkColor: "text-brand-telegram",
    palette: { iconBg: "bg-sky-50", iconFg: "text-brand-telegram", hoverBg: "group-hover:bg-brand-telegram" },
    external: true,
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-border-default">
        <Container variant="marketing" className="py-24 sm:py-32">
          <h1 className="font-display mb-6 text-[40px] font-medium tracking-[-0.02em] text-text-primary leading-[1.1] sm:text-[52px] lg:text-[60px]">
            Biz bilan bog&apos;laning
          </h1>
          <p className="text-[15px] leading-relaxed text-text-secondary max-w-2xl sm:text-base md:text-lg">
            Fikr, mulohaza va takliflaringiz biz uchun juda muhim! Agar loyiha bo&apos;yicha savollaringiz, hamkorlik takliflaringiz bo&apos;lsa bizga yozing.
          </p>
        </Container>
      </section>

      {/* Main Content */}
      <section className="border-t border-border-default bg-white">
        <Container variant="marketing" className="py-20 sm:py-28">
          
          <div className="grid md:grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <a
                key={contact.title}
                href={contact.link}
                {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group block p-6 rounded-2xl bg-white border border-border-default transition-all duration-300 hover:shadow-[0_4px_24px_rgba(20,20,20,0.06)] hover:border-primary/20"
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${contact.palette.iconBg} ${contact.palette.hoverBg} transition-colors duration-300 mb-4`}>
                  <contact.icon className={`h-5 w-5 ${contact.palette.iconFg} group-hover:text-white transition-colors duration-300`} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3 className="font-display text-[17px] font-medium tracking-[-0.01em] text-text-primary mb-2">{contact.title}</h3>
                <p className="text-[14px] leading-relaxed text-text-secondary mb-4">{contact.text}</p>
                <p className={`text-[15px] font-medium ${contact.linkColor}`}>{contact.linkText} &rarr;</p>
              </a>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-text-muted text-[14px] leading-relaxed">
              Barcha murojaatlarga iloji boricha tez fursatlarda (odatda 24-48 soat ichida) javob berishga harakat qilamiz.<br/>Inkly bilan birga ekanligingiz uchun rahmat!
            </p>
          </div>

        </Container>
      </section>
    </main>
  )
}
