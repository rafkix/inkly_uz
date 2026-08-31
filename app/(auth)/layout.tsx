import Link from 'next/link'
import {  } from '@/components/ui/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}
