"use client"

import { useEffect, useRef, useState } from "react"

interface AvatarGlowProps {
  avatarUrl: string
  children: React.ReactNode
}

/**
 * Avatardan dominant rangni canvas orqali chiqarib,
 * uni CSS custom property (--glow-r/g/b) sifatida
 * bola elementlarga uzatadi. Banner gradient shu
 * o'zgaruvchilardan foydalanadi — statik ranglar o'rniga.
 */
export function AvatarGlow({ avatarUrl, children }: AvatarGlowProps) {
  const [rgb, setRgb] = useState<[number, number, number] | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!avatarUrl) return

    let cancelled = false

    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.src = avatarUrl

    img.onload = () => {
      if (cancelled) return

      const canvas = canvasRef.current ?? document.createElement("canvas")
      canvasRef.current = canvas

      const size = 32
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(img, 0, 0, size, size)

      try {
        const { data } = ctx.getImageData(0, 0, size, size)
        let r = 0
        let g = 0
        let b = 0
        let count = 0

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3]
          if (alpha < 100) continue

          const pr = data[i]
          const pg = data[i + 1]
          const pb = data[i + 2]

          const luminance = (pr + pg + pb) / 3
          const weight = luminance > 240 || luminance < 15 ? 0.3 : 1

          r += pr * weight
          g += pg * weight
          b += pb * weight
          count += weight
        }

        if (count > 0) {
          r = Math.round(r / count)
          g = Math.round(g / count)
          b = Math.round(b / count)

          const [sr, sg, sb] = saturateAndDarken(r, g, b)
          setRgb([sr, sg, sb])
        }
      } catch {
        // CORS yoki canvas tainted — fallback statik rangda qoladi
      }
    }

    return () => {
      cancelled = true
    }
  }, [avatarUrl])

  const style = rgb
    ? ({
        "--glow-r": rgb[0],
        "--glow-g": rgb[1],
        "--glow-b": rgb[2],
      } as React.CSSProperties)
    : undefined

  return (
    <div className="contents" style={style}>
      {children}
    </div>
  )
}

/** RGB ni to'yingan va qorong'iroq holga keltiradi (banner uchun) */
function saturateAndDarken(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2 / 255

  const darkenFactor = l > 0.55 ? 0.5 : 0.75

  return [
    Math.round(r * darkenFactor),
    Math.round(g * darkenFactor),
    Math.round(b * darkenFactor),
  ]
}