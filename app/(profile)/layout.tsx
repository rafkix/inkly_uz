import { Navbar } from "@/components/layout/navbar"
import { ConditionalFooter } from "@/components/layout/conditional-footer"

// Profil bilan bog'liq barcha sahifalar uchun alohida layout:
// /@username, /@username/[slug], /@username/followers, /@username/following.
//
// Marketing guruhidan ataylab ajratildi — profil sahifalari o'ziga xos
// hero/navigatsiya talablariga ega (masalan MobileHero, sticky sidebar) va
// kelajakda marketing sahifalaridan mustaqil rivojlanishi kerak.
//
// Navbar va ConditionalFooter pathname asosida ishlaydi, shuning uchun
// bu yerga ko'chirilishi ularning /@username uchun ko'rsatilish/yashirilish
// mantig'iga ta'sir qilmaydi.
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative isolate min-h-screen">
      <Navbar />
      {children}
      <ConditionalFooter />
    </div>
  )
}
