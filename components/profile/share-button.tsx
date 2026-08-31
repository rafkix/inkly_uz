"use client"

import { Share2, Check } from "lucide-react"
import { useState } from "react"

export function ShareButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Havolani nusxalash"
        title={copied ? "Nusxalandi!" : "Havolani nusxalash"}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
      >
        {copied
          ? <Check size={15} className="text-primary" />
          : <Share2 size={16} />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Havolani nusxalash"
      title={copied ? "Nusxalandi!" : "Havolani nusxalash"}
      className="flex h-[34px] w-[38px] items-center justify-center rounded-md border border-border bg-white text-foreground-muted transition hover:bg-inkly-orange-light hover:text-primary hover:border-primary/40"
    >
      {copied ? <Check size={15} className="text-success" /> : <Share2 size={16} />}
    </button>
  )
}