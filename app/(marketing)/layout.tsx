import { Navbar } from "@/components/layout/navbar"
import { ConditionalFooter } from "@/components/layout/conditional-footer"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="public-site relative isolate min-h-screen">
      <Navbar />
      {children}
      <ConditionalFooter />
    </div>
  )
}
