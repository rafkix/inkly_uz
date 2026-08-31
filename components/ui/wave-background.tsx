  "use client"

  import { useEffect, useRef, useState } from "react"
  import { motion, useReducedMotion, useAnimationFrame } from "framer-motion"

  // ─────────────────────────────────────────────────────────────────────────────
  // WaveBackground — to'lqin fon + ilon izi kursor animatsiyasi
  // ─────────────────────────────────────────────────────────────────────────────

  const WAVE_COLORS = [
    { base: "#FF6A00", from: "#FF6A00", to: "#FF8A3D" },
    { base: "#3B82F6", from: "#3B82F6", to: "#60A5FA" },
    { base: "#10B981", from: "#10B981", to: "#34D399" },
    { base: "#8B5CF6", from: "#8B5CF6", to: "#A78BFA" },
    { base: "#F43F5E", from: "#F43F5E", to: "#FB7185" },
  ]

  const SNAKE_PALETTE = [
    { r: 255, g: 106, b: 0   },
    { r: 59,  g: 130, b: 246 },
    { r: 16,  g: 185, b: 129 },
    { r: 139, g: 92,  b: 246 },
    { r: 244, g: 63,  b: 94  },
  ]

  const SEGMENT_COUNT   = 28
  const SEGMENT_SPACING = 13
  const HEAD_RADIUS     = 8
  const TAIL_MIN_RADIUS = 2.5
  const HEAD_EASE       = 0.38
  const BODY_EASE       = 0.18

  const ysDesktop        = [-40, 40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920]
  const ysMobile         = [80, 200, 320, 440, 560, 680, 800]
  const snakeRowsDesktop = [1, 4, 7, 10]

  // y + sinusoidal offset bilan path quradi
  // mobile=true bo'lsa 390px wide viewBox uchun quriladi
  function buildPath(y: number, offset = 0, mobile = false) {
    const yo = y + offset
    if (mobile) {
      // 390px wide — to'lqin amplitudasi kichikroq
      return `M -20 ${yo} Q 80 ${yo - 40}, 195 ${yo} Q 310 ${yo + 40}, 410 ${yo}`
    }
    return `M -100 ${yo} Q 100 ${yo - 65}, 300 ${yo} Q 500 ${yo + 65}, 700 ${yo} Q 900 ${yo - 65}, 1100 ${yo} Q 1300 ${yo + 65}, 1500 ${yo}`
  }

  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t
  }

  function getSnakeColor(i: number) {
    const t   = i / (SEGMENT_COUNT - 1)
    const idx = t * (SNAKE_PALETTE.length - 1)
    const lo  = Math.floor(idx)
    const hi  = Math.min(lo + 1, SNAKE_PALETTE.length - 1)
    const f   = idx - lo
    const a   = SNAKE_PALETTE[lo]
    const b   = SNAKE_PALETTE[hi]
    return {
      r: a.r + (b.r - a.r) * f,
      g: a.g + (b.g - a.g) * f,
      b: a.b + (b.b - a.b) * f,
    }
  }

  // ── Animated wave path — useAnimationFrame bilan haqiqiy float ──────────────
  function FloatingPath({
    baseY,
    amplitude,
    period,
    phaseOffset,
    stroke,
    strokeWidth,
    opacity,
    strokeDasharray,
    dashDuration,
    dashDelay,
    idPrefix,
    colorIdx,
    shimmer,
    mobile,
  }: {
    baseY: number
    amplitude: number
    period: number
    phaseOffset: number
    stroke: string
    strokeWidth: number
    opacity: number
    strokeDasharray?: string
    dashDuration?: number
    dashDelay?: number
    idPrefix: string
    colorIdx: number
    shimmer?: boolean
    mobile?: boolean
  }) {
    const pathRef = useRef<SVGPathElement>(null)
    const t0 = useRef(performance.now())

    useAnimationFrame(() => {
      if (!pathRef.current) return
      const elapsed = (performance.now() - t0.current) / 1000
      const offset  = Math.sin((elapsed / period) * Math.PI * 2 + phaseOffset) * amplitude
      pathRef.current.setAttribute("d", buildPath(baseY, offset, mobile))
    })

    return (
      <path
        ref={pathRef}
        d={buildPath(baseY, 0, mobile)}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={opacity}
        strokeDasharray={strokeDasharray}
      />
    )
  }

  // ── Snake canvas hook ──────────────────────────────────────────────────────
  function useSnakeCanvas(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    enabled: boolean,
  ) {
    useEffect(() => {
      if (!enabled) return
      const canvas    = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      let W = 0, H = 0, rafId = 0
      let mouseX: number | null = null
      let mouseY: number | null = null
      let active = false
      const segments: { x: number; y: number }[] = []

      function resize() {
        const rect = container!.getBoundingClientRect()
        W = rect.width; H = rect.height
        canvas!.width  = W * devicePixelRatio
        canvas!.height = H * devicePixelRatio
        ctx!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      }

      function initSegments(cx: number, cy: number) {
        segments.length = 0
        for (let i = 0; i < SEGMENT_COUNT; i++)
          segments.push({ x: cx - i * SEGMENT_SPACING, y: cy })
      }

      function onMove(e: MouseEvent) {
        const rect = container!.getBoundingClientRect()
        mouseX = e.clientX - rect.left
        mouseY = e.clientY - rect.top
        if (!active) { active = true; initSegments(mouseX, mouseY) }
      }

      function onLeave() { mouseX = null; mouseY = null }

      function draw() {
        ctx!.clearRect(0, 0, W, H)
        if (!active || segments.length === 0) { rafId = requestAnimationFrame(draw); return }

        if (mouseX !== null && mouseY !== null) {
          segments[0].x = lerp(segments[0].x, mouseX, HEAD_EASE)
          segments[0].y = lerp(segments[0].y, mouseY, HEAD_EASE)
        }

        for (let i = 1; i < segments.length; i++) {
          const prev = segments[i - 1], cur = segments[i]
          const dx = cur.x - prev.x, dy = cur.y - prev.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001
          if (dist > SEGMENT_SPACING) {
            const ratio = (dist - SEGMENT_SPACING) / dist
            cur.x -= dx * ratio * 0.72; cur.y -= dy * ratio * 0.72
          } else {
            cur.x = lerp(cur.x, prev.x + (dx / dist) * SEGMENT_SPACING, BODY_EASE)
            cur.y = lerp(cur.y, prev.y + (dy / dist) * SEGMENT_SPACING, BODY_EASE)
          }
        }

        for (let i = segments.length - 1; i >= 0; i--) {
          const t      = i / (segments.length - 1)
          const radius = lerp(HEAD_RADIUS, TAIL_MIN_RADIUS, Math.pow(t, 0.7))
          const alpha  = lerp(1, 0.07, Math.pow(t, 1.1))
          const c      = getSnakeColor(i)
          const seg    = segments[i]
          const prev   = segments[Math.max(0, i - 1)]
          const angle  = Math.atan2(prev.y - seg.y, prev.x - seg.x)

          ctx!.save()
          ctx!.translate(seg.x, seg.y)
          ctx!.rotate(angle)
          ctx!.scale(1.3, 1.0)

          ctx!.beginPath()
          ctx!.arc(0, 0, radius, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${alpha.toFixed(3)})`
          ctx!.fill()

          if (i === 0) {
            ctx!.beginPath(); ctx!.arc( HEAD_RADIUS*0.28, -radius*0.32, radius*0.22, 0, Math.PI*2)
            ctx!.fillStyle = "rgba(255,255,255,0.88)"; ctx!.fill()
            ctx!.beginPath(); ctx!.arc(-HEAD_RADIUS*0.28, -radius*0.32, radius*0.22, 0, Math.PI*2)
            ctx!.fillStyle = "rgba(255,255,255,0.88)"; ctx!.fill()
            ctx!.beginPath(); ctx!.arc( HEAD_RADIUS*0.28, -radius*0.32, radius*0.1, 0, Math.PI*2)
            ctx!.fillStyle = "rgba(0,0,0,0.75)"; ctx!.fill()
            ctx!.beginPath(); ctx!.arc(-HEAD_RADIUS*0.28, -radius*0.32, radius*0.1, 0, Math.PI*2)
            ctx!.fillStyle = "rgba(0,0,0,0.75)"; ctx!.fill()
            const ts = HEAD_RADIUS + 1
            ctx!.strokeStyle = `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},0.95)`
            ctx!.lineWidth = 1.5; ctx!.lineCap = "round"
            ctx!.beginPath(); ctx!.moveTo(ts, 0);     ctx!.lineTo(ts+8, 0);      ctx!.stroke()
            ctx!.beginPath(); ctx!.moveTo(ts+8, 0);   ctx!.lineTo(ts+13, -3.5); ctx!.stroke()
            ctx!.beginPath(); ctx!.moveTo(ts+8, 0);   ctx!.lineTo(ts+13,  3.5); ctx!.stroke()
          }
          ctx!.restore()
        }
        rafId = requestAnimationFrame(draw)
      }

      resize()
      initSegments(W / 2, H / 2)
      active = false
      container.addEventListener("mousemove", onMove)
      container.addEventListener("mouseleave", onLeave)
      window.addEventListener("resize", resize)
      rafId = requestAnimationFrame(draw)

      return () => {
        cancelAnimationFrame(rafId)
        container.removeEventListener("mousemove", onMove)
        container.removeEventListener("mouseleave", onLeave)
        window.removeEventListener("resize", resize)
      }
    }, [enabled, canvasRef, containerRef])
  }

  // ── ShimmerPath — to'lqin ustidan yorug' chiziq o'tadi ──────────────────────
  function ShimmerPath({
    baseY,
    amplitude,
    period,
    phaseOffset,
    colorIdx,
    idPrefix,
    delay,
    shimmerDuration,
    mobile,
  }: {
    baseY: number
    amplitude: number
    period: number
    phaseOffset: number
    colorIdx: number
    idPrefix: string
    delay: number
    shimmerDuration: number
    mobile?: boolean
  }) {
    const pathRef = useRef<SVGPathElement>(null)
    const t0 = useRef(performance.now())

    useAnimationFrame(() => {
      if (!pathRef.current) return
      const elapsed = (performance.now() - t0.current) / 1000
      const offset  = Math.sin((elapsed / period) * Math.PI * 2 + phaseOffset) * amplitude
      pathRef.current.setAttribute("d", buildPath(baseY, offset, mobile))
    })

    return (
      <motion.path
        ref={pathRef}
        d={buildPath(baseY, 0, mobile)}
        fill="none"
        stroke={`url(#${idPrefix}-shimmer-${colorIdx})`}
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="0.07 0.93"
        initial={{ strokeDashoffset: 1.07 }}
        animate={{ strokeDashoffset: -0.07 }}
        transition={{
          duration: shimmerDuration,
          delay,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        }}
      />
    )
  }

  // ── TrailPath — chapdan o'ngga suzuvchi trail ────────────────────────────────
  function TrailPath({
    baseY,
    amplitude,
    period,
    phaseOffset,
    colorIdx,
    idPrefix,
    dashDuration,
    dashDelay,
    mobile,
  }: {
    baseY: number
    amplitude: number
    period: number
    phaseOffset: number
    colorIdx: number
    idPrefix: string
    dashDuration: number
    dashDelay: number
    mobile?: boolean
  }) {
    const pathRef = useRef<SVGPathElement>(null)
    const t0 = useRef(performance.now())

    useAnimationFrame(() => {
      if (!pathRef.current) return
      const elapsed = (performance.now() - t0.current) / 1000
      const offset  = Math.sin((elapsed / period) * Math.PI * 2 + phaseOffset) * amplitude
      pathRef.current.setAttribute("d", buildPath(baseY, offset, mobile))
    })

    return (
      <motion.path
        ref={pathRef}
        d={buildPath(baseY, 0, mobile)}
        fill="none"
        stroke={`url(#${idPrefix}-trail-${colorIdx})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="0.11 0.89"
        initial={{ strokeDashoffset: 1 }}
        animate={{ strokeDashoffset: -0.11 }}
        transition={{
          duration: dashDuration,
          delay: dashDelay,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        }}
      />
    )
  }

  // ── Props ──────────────────────────────────────────────────────────────────
  interface WaveBackgroundProps {
    opacity?: number
    viewBoxHeight?: number
    idPrefix?: string
    className?: string
    snakeEnabled?: boolean
  }

  // ── Komponent ──────────────────────────────────────────────────────────────
  export function WaveBackground({
    opacity       = 1,
    viewBoxHeight = 900,
    idPrefix      = "wave",
    className,
    snakeEnabled  = true,
  }: WaveBackgroundProps) {
    const reducedMotionRaw = useReducedMotion()
    const [mounted, setMounted]   = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef    = useRef<HTMLCanvasElement>(null)

    const reducedMotion = mounted ? (reducedMotionRaw ?? false) : false

    useEffect(() => {
      const mq = window.matchMedia("(max-width: 1023px)")
      setIsMobile(mq.matches)
      setMounted(true)
      const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }, [])

    const snakeActive = snakeEnabled && !reducedMotion && !isMobile
    useSnakeCanvas(canvasRef, containerRef, snakeActive)

    const baseYs = isMobile ? ysMobile : ysDesktop
    const snakeYs = isMobile
      ? ysMobile
      : snakeRowsDesktop.map((i) => ysDesktop[i])
    const snakeDurations = isMobile
      ? ysMobile.map((_, i) => 12 + i * 2)
      : snakeRowsDesktop.map((_, i) => 12 + i * 2.5)
    const snakeDelays = isMobile
      ? ysMobile.map((_, i) => i * 2.5)
      : snakeRowsDesktop.map((_, i) => i * 3)

    return (
      <motion.div
        ref={containerRef}
        aria-hidden="true"
        className={
          className ??
          "pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        }
        initial={false}
        animate={{ opacity: mounted ? opacity : 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* SSR placeholder */}
        {!mounted && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 1280 ${viewBoxHeight}`}
          />
        )}

        {mounted && (
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio={isMobile ? "xMidYMid meet" : "xMidYMid slice"}
            viewBox={isMobile ? "0 0 390 900" : `0 0 1280 ${viewBoxHeight}`}
          >
            <defs>
              {/* Trail gradientlari */}
              {WAVE_COLORS.map((c, i) => (
                <linearGradient key={i} id={`${idPrefix}-trail-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor={c.from} stopOpacity="0"    />
                  <stop offset="40%"  stopColor={c.to}   stopOpacity="0.95" />
                  <stop offset="65%"  stopColor={c.from} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={c.from} stopOpacity="0"    />
                </linearGradient>
              ))}
              {/* Shimmer gradientlari — oq + rang chiziq */}
              {WAVE_COLORS.map((c, i) => (
                <linearGradient key={`sg-${i}`} id={`${idPrefix}-shimmer-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#fff"  stopOpacity="0"   />
                  <stop offset="44%"  stopColor="#fff"  stopOpacity="0"   />
                  <stop offset="50%"  stopColor={c.to}  stopOpacity="0.7" />
                  <stop offset="52%"  stopColor="#fff"  stopOpacity="1"   />
                  <stop offset="56%"  stopColor={c.to}  stopOpacity="0.7" />
                  <stop offset="65%"  stopColor="#fff"  stopOpacity="0"   />
                  <stop offset="100%" stopColor="#fff"  stopOpacity="0"   />
                </linearGradient>
              ))}
            </defs>

            {/* Base to'lqinlar — float + statik chiziq */}
            {baseYs.map((y, i) => {
              const amp    = 7 + (i % 4) * 3        // 7–16px amplituda
              const period = 4 + (i % 5) * 0.9      // 4–7.6s davr
              const phase  = (i * Math.PI) / 3       // faza siljishi
              return (
                <FloatingPath
                  key={`base-${i}`}
                  baseY={y}
                  amplitude={amp}
                  period={period}
                  phaseOffset={phase}
                  stroke={WAVE_COLORS[i % WAVE_COLORS.length].base}
                  strokeWidth={isMobile ? 1.8 : 1.4}
                  opacity={isMobile ? 0.28 : 0.18}
                  colorIdx={i % WAVE_COLORS.length}
                  idPrefix={idPrefix}
                  mobile={isMobile}
                />
              )
            })}

            {/* Trail to'lqinlar — float + chapdan-o'ngga */}
            {!reducedMotion && snakeYs.map((y, i) => (
              <TrailPath
                key={`trail-${i}`}
                baseY={y}
                amplitude={10 + i * 3}
                period={5 + i * 1.2}
                phaseOffset={(i * Math.PI) / 2}
                colorIdx={i % WAVE_COLORS.length}
                idPrefix={idPrefix}
                dashDuration={snakeDurations[i]}
                dashDelay={snakeDelays[i]}
                mobile={isMobile}
              />
            ))}

            {/* Shimmer to'lqinlar — float + yorug' chiziq o'tadi */}
            {!reducedMotion && baseYs.map((y, i) => (
              <ShimmerPath
                key={`shimmer-${i}`}
                baseY={y}
                amplitude={7 + (i % 4) * 3}
                period={4 + (i % 5) * 0.9}
                phaseOffset={(i * Math.PI) / 3}
                colorIdx={i % WAVE_COLORS.length}
                idPrefix={idPrefix}
                delay={i * 0.5}
                shimmerDuration={3 + (i % 4) * 0.7}
                mobile={isMobile}
              />
            ))}
          </svg>
        )}

        {/* Ilon izi canvas */}
        {mounted && snakeActive && (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "auto",
            }}
          />
        )}

        {/* Ambient glow — desktop */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/2 hidden h-[560px] w-[560px] -translate-y-1/2 rounded-full lg:block"
          style={{
            background:
              "radial-gradient(circle, rgba(255,106,0,0.10) 0%, rgba(255,138,61,0.04) 45%, transparent 70%)",
          }}
          initial={false}
          animate={
            !mounted ? { opacity: 0.9, scale: 1 }
            : reducedMotion ? { opacity: 0.9, scale: 1 }
            : { scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }
          }
          transition={{ duration: 6, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Ambient glow — mobile */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-[30%] h-[240px] w-[240px] rounded-full lg:hidden"
          style={{
            background:
              "radial-gradient(circle, rgba(255,106,0,0.07) 0%, rgba(255,138,61,0.03) 45%, transparent 70%)",
          }}
          initial={false}
          animate={
            !mounted ? { opacity: 0.85, scale: 1 }
            : reducedMotion ? { opacity: 0.85, scale: 1 }
            : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
          }
          transition={{ duration: 6, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    )
  }