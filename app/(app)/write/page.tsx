"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingDots } from "@/components/ui/loading-dots"

export default function WriteEntryPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/write/editor")
  }, [router])

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <LoadingDots size="lg" className="text-primary" />
    </div>
  )
}
