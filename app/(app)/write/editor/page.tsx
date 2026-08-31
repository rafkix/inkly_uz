"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"

import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, Eye, EyeOff, FileText, Hash, Image as ImageIcon, Maximize2, Minimize2, MoreVertical, Save, Send, Settings2, X,  } from "lucide-react"

import { ArticlePreview } from "@/components/editor/article-preview"
import { PublishModal } from "@/components/editor/publish-modal"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { uploadsApi } from "@/lib/api/uploads"
import { categoriesApi } from "@/lib/api/categories"
import { getMediaUrl } from "@/lib/api/client"

import type { CategoryPublicResponse, PostVisibility } from "@/types/api"
import { LoadingDots } from "@/components/ui/loading-dots"

/* ─── Dynamic Editor ─────────────────────────────────────────────── */

const InklyEditorNovel = dynamic(
  () =>
    import("@/components/editor/inkly-editor-novel").then(
      (mod) => mod.InklyEditorNovel,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center gap-3 min-h-[280px] text-sm text-muted-foreground">
        <LoadingDots size="md" className="text-primary" />
        <span>Muharrir yuklanmoqda...</span>
      </div>
    ),
  },
)

/* ─── Types ──────────────────────────────────────────────────────── */

type SaveStatus = "idle" | "saving" | "saved" | "error"
type PublicationState = "draft" | "published"
type SidebarTab = "meta" | "settings" | null
type EditorWidth = "narrow" | "comfortable" | "wide" | "full"

const AUTOSAVE_DELAY_MS = 3_000
const MIN_WRITE_PCT = 30
const MAX_WRITE_PCT = 70
const DEFAULT_WRITE_PCT = 50
const MOBILE_BREAKPOINT_PX = 768

const WIDTH_MAP: Record<EditorWidth, string> = {
  narrow: "max-w-[580px]",
  comfortable: "max-w-[680px]",
  wide: "max-w-[860px]",
  full: "max-w-none",
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function htmlToPlain(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
}
function wordCount(html: string) {
  const t = htmlToPlain(html)
  return t ? t.split(/\s+/).filter(Boolean).length : 0
}
function charCount(html: string) { return htmlToPlain(html).length }
function readTime(w: number) { return Math.max(1, Math.ceil(w / 200)) }

/* ─── useIsMobile ────────────────────────────────────────────────
   md breakpoint (768px) bilan CSS'dagi max-md: bilan izchil ─── */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return isMobile
}

/* ─── Save Pill ──────────────────────────────────────────────────── */

function SavePill({
  status, savedAt, isDirty, onSave, disabled,
}: {
  status: SaveStatus; savedAt: Date | null
  isDirty: boolean; onSave: () => void; disabled: boolean
}) {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium whitespace-nowrap border transition-all duration-150"

  if (status === "saving") return (
    <span className={`${base} bg-muted text-muted-foreground border-border`}>
      <LoadingDots size="sm" className="text-primary" />
      <span>Saqlanmoqda</span>
    </span>
  )
  if (status === "saved" && !isDirty) return (
    <span className={`${base} bg-success-soft text-success border-[#BBF7D0]`}>
      <Check size={10} />
      <span>{savedAt ? fmtTime(savedAt) : "Saqlangan"}</span>
    </span>
  )
  if (status === "error") return (
    <button onClick={onSave} disabled={disabled}
      className={`${base} bg-inkly-orange-light text-destructive border-[#FECACA] cursor-pointer hover:brightness-95`}>
      <X size={10} />
      <span>Xatolik · Qayta</span>
    </button>
  )
  if (isDirty) return (
    <button onClick={onSave} disabled={disabled}
      className={`${base} bg-inkly-orange-light text-[#C2410C] border-[#FED7AA] cursor-pointer hover:brightness-95`}>
      <Save size={10} />
      <span>Saqlash</span>
    </button>
  )
  return null
}

/* ─── Cover Zone ─────────────────────────────────────────────────── */

function CoverZone({
  previewUrl, uploading, inputRef, onUpload, onRemove,
}: {
  previewUrl: string; uploading: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onRemove: () => void
}) {
  if (previewUrl) {
    return (
      <div className="group relative mb-6 rounded-xl overflow-hidden bg-muted">
        <img
          src={previewUrl}
          alt="Muqova"
          className="block w-full object-cover"
          style={{ aspectRatio: "2.4/1" }}
        />
        <div className="absolute top-2.5 right-2.5 flex gap-1.5
          opacity-100 md:opacity-0 -translate-y-1 md:group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-200">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            bg-black/65 hover:bg-black/80 text-white/90 text-[11.5px] font-medium
            backdrop-blur-sm transition-colors duration-150 disabled:opacity-60">
            {uploading ? <LoadingDots size="sm" /> : <ImageIcon size={11} />}
            <span className="hidden sm:inline">Almashtirish</span>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center w-8 h-8 rounded-lg
            bg-black/65 hover:bg-red-600/75 text-white/80 hover:text-white
            backdrop-blur-sm transition-colors duration-150">
            <X size={12} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="w-full flex items-center justify-center gap-2 mb-6
      py-4 rounded-xl border border-dashed border-border/70
      text-[13px] text-muted-foreground/60
      hover:text-muted-foreground hover:border-border hover:bg-muted/30
      transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
      {uploading ? (
        <><LoadingDots size="sm" className="text-primary" /> Yuklanmoqda...</>
      ) : (
        <><ImageIcon size={14} /> Muqova rasm qo'shish</>
      )}
    </button>
  )
}

/* ─── Stats Bar ──────────────────────────────────────────────────── */

function StatsBar({ content, title, user }: { content: string; title: string; user: import("@/types/api").UserMeResponse }) {
  const words = wordCount(content)
  const chars = charCount(content)
  const mins = readTime(words)
  const titleLen = title.trim().length

  return (
    <div className="hidden md:flex items-center justify-between px-5 border-t border-border
      bg-background gap-3 flex-wrap h-[44px] flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-full
          bg-foreground text-background text-[11px] font-bold flex-shrink-0 select-none">
          {user?.username?.[0]?.toUpperCase() ?? "N"}
        </div>
        <Sep />
        <Stat value={words} label="so'z" />
        <Sep />
        <Stat value={chars} label="belgi" />
        <Sep />
        <div className="flex items-center gap-1 text-[11.5px]">
          <Clock size={10} className="text-muted-foreground" />
          <span className="font-semibold text-foreground/65">~{mins}</span>
          <span className="text-[11px] text-muted-foreground/60">daqiqa</span>
        </div>
        {titleLen > 0 && (
          <>
            <Sep />
            <div className={`flex items-center gap-1 text-[11.5px]
              ${titleLen > 160 ? "text-amber-600" : "text-muted-foreground"}`}>
              <span className="font-semibold text-foreground/65">{titleLen}/180</span>
              <span className="text-[11px] text-muted-foreground/60">sarlavha</span>
            </div>
          </>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <KbdHint keys={["Ctrl", "S"]} label="saqlash" />
        <Sep />
        <KbdHint keys={["/"]} label="buyruqlar" />
      </div>
    </div>
  )
}

/* ─── Mobile Stats Pill ──────────────────────────────────────────
   Katta StatsBar o'rniga mobilda joy tejaydigan bitta qatorcha ─── */

function MobileStatsPill({ content }: { content: string }) {
  const words = wordCount(content)
  const mins = readTime(words)
  return (
    <div className="flex md:hidden items-center justify-center gap-2 px-3 py-1.5
      border-t border-border bg-background flex-shrink-0 text-[11px] text-muted-foreground/70">
      <span className="font-semibold text-foreground/60">{words}</span>
      <span>so'z</span>
      <Sep />
      <span className="font-semibold text-foreground/60">~{mins}</span>
      <span>daqiqa</span>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[11.5px]">
      <span className="font-semibold text-foreground/65">{value}</span>
      <span className="text-[11px] text-muted-foreground/60">{label}</span>
    </div>
  )
}

function Sep() {
  return <div className="w-px h-3 bg-border/70 flex-shrink-0" />
}

function KbdHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
      {keys.map((k, i) => (
        <kbd key={i}
          className="inline-flex items-center px-1.5 py-px rounded-sm
          border border-border bg-muted text-[10px] font-medium text-muted-foreground/70">
          {k}
        </kbd>
      ))}
      <span>{label}</span>
    </div>
  )
}

/* ─── Writing Width Control ──────────────────────────────────────── */

function WidthControl({ value, onChange }: {
  value: EditorWidth; onChange: (v: EditorWidth) => void
}) {
  const opts: Array<{ value: EditorWidth; label: string }> = [
    { value: "narrow", label: "Tor" },
    { value: "comfortable", label: "Standart" },
    { value: "wide", label: "Keng" },
    { value: "full", label: "To'liq" },
  ]
  return (
    <div className="flex items-center p-[3px] rounded-lg border border-border bg-muted/50 gap-px">
      {opts.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`h-[26px] px-2.5 rounded-sm text-[11.5px] font-medium
            transition-all duration-150 whitespace-nowrap
            ${value === opt.value
              ? "bg-background text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground"
            }`}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ─── Drag Handle (pane resizer) ─────────────────────────────────── */

function DragHandle({ onDrag }: { onDrag: (pct: number) => void }) {
  const dragging = useRef(false)

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const pct = (ev.clientX / window.innerWidth) * 100
      onDrag(Math.min(MAX_WRITE_PCT, Math.max(MIN_WRITE_PCT, pct)))
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  return (
    <div
      onMouseDown={onMouseDown}
      className="relative flex-shrink-0 flex flex-col items-center justify-center
      w-[18px] cursor-col-resize z-10 group select-none"
      style={{ touchAction: "none" }}>
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border
        group-hover:bg-border-strong transition-colors duration-150" />
      <div className="relative flex flex-col items-center gap-[3px] px-[5px] py-2.5
        rounded-full bg-background border border-border shadow-sm
        opacity-0 group-hover:opacity-100 transition-all duration-150">
        <ChevronLeft size={10} className="text-muted-foreground" />
        <div className="flex flex-col gap-[3px]">
          <MoreVertical size={10} className="text-muted-foreground/50 rotate-90" />
        </div>
        <ChevronRight size={10} className="text-muted-foreground" />
      </div>
    </div>
  )
}

/* ─── Preview Empty State ────────────────────────────────────────── */

function PreviewEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-8 text-center select-none">
      <div className="w-14 h-14 rounded-2xl bg-muted/80 flex items-center justify-center">
        <FileText size={24} className="text-muted-foreground/40" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[14px] font-semibold text-foreground/40">Ko'rinish bo'sh</p>
        <p className="text-[12.5px] text-muted-foreground/50 leading-relaxed max-w-[200px]">
          Sarlavha va matn yozing —<br />bu yerda real vaqtda ko'rinadi
        </p>
      </div>
    </div>
  )
}

/* ─── Sidebar Panel ──────────────────────────────────────────────── */

function SidebarPanel({
  activeTab, onClose, onTabChange,
  categories, selectedCategories, onToggleCategory,
  excerpt, onExcerpt,
  visibility, onVisibility,
  allowComments, onAllowComments,
  allowReactions, onAllowReactions,
  allowReposts, onAllowReposts,
  seoIndexable, onSeoIndexable,
  isPinned, onIsPinned,
  scheduledAt, onScheduledAt,
}: {
  activeTab: SidebarTab; onClose: () => void; onTabChange: (t: SidebarTab) => void
  categories: CategoryPublicResponse[]; selectedCategories: string[]; onToggleCategory: (u: string) => void
  excerpt: string; onExcerpt: (v: string) => void
  visibility: PostVisibility; onVisibility: (v: PostVisibility) => void
  allowComments: boolean; onAllowComments: (v: boolean) => void
  allowReactions: boolean; onAllowReactions: (v: boolean) => void
  allowReposts: boolean; onAllowReposts: (v: boolean) => void
  seoIndexable: boolean; onSeoIndexable: (v: boolean) => void
  isPinned: boolean; onIsPinned: (v: boolean) => void
  scheduledAt: string | null; onScheduledAt: (v: string | null) => void
}) {
  const inputCls = `w-full px-3 py-2 rounded-lg border border-border bg-background
    text-[13px] text-foreground outline-none placeholder:text-muted-foreground
    focus:border-primary/30 focus:ring-3 focus:ring-primary/8 transition-all duration-150`

  const toggles = [
    { label: "Izohlar", value: allowComments, onChange: onAllowComments },
    { label: "Reaktsiyalar", value: allowReactions, onChange: onAllowReactions },
    { label: "Repostlar", value: allowReposts, onChange: onAllowReposts },
    { label: "SEO indekslash", value: seoIndexable, onChange: onSeoIndexable },
    { label: "Tepaga pin", value: isPinned, onChange: onIsPinned },
  ]

  return (
    <aside className="relative z-10 flex flex-col w-full sm:w-[min(360px,92vw)] h-full
      border-l border-border bg-background shadow-lg
      animate-in slide-in-from-right-5 duration-200">

      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2.5
        px-3.5 py-3 border-b border-border bg-muted/40 flex-shrink-0">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-muted-foreground/50">
            INKLY
          </span>
          <strong className="text-[13px] font-[650] text-foreground leading-tight">
            Ma'lumotlar
          </strong>
        </div>
        <div className="flex gap-0.5 p-[3px] rounded-lg bg-muted">
          {([["meta", "Meta", Hash], ["settings", "Sozlamalar", Settings2]] as const).map(([tab, label, Icon]) => (
            <button key={tab} onClick={() => onTabChange(tab)}
              className={`flex items-center gap-1 px-2.5 py-[5px] rounded-md text-[12px] font-medium
                whitespace-nowrap transition-all duration-150
                ${activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
        <button onClick={onClose}
          className="flex items-center justify-center w-7 h-7 rounded-lg
          text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150">
          <X size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-5">
        {activeTab === "meta" && (
          <>
            <FieldGroup label="Qisqacha tavsif">
              <textarea
                value={excerpt}
                onChange={(e) => onExcerpt(e.target.value)}
                placeholder="SEO va ijtimoiy tarmoqlar uchun qisqa tavsif..."
                maxLength={500} rows={3}
                className={`${inputCls} resize-y leading-[1.55]`} />
              <span className="text-[11px] text-muted-foreground/60">{excerpt.length}/500</span>
            </FieldGroup>
            <FieldGroup label="Kategoriyalar">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const on = selectedCategories.includes(cat.uuid)
                  return (
                    <button key={cat.uuid} type="button"
                      onClick={() => onToggleCategory(cat.uuid)}
                      className={`flex items-center gap-1 px-3 py-[5px] rounded-full
                        border text-[12px] font-medium transition-all duration-150
                        ${on
                          ? "bg-primary/8 border-primary/25 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:bg-muted/60"
                        }`}>
                      {on && <Check size={9} />}{cat.name}
                    </button>
                  )
                })}
                {categories.length === 0 && (
                  <span className="text-[11px] text-muted-foreground">Yuklanmoqda...</span>
                )}
              </div>
            </FieldGroup>
          </>
        )}

        {activeTab === "settings" && (
          <>
            <FieldGroup label="Ko'rinish">
              <div className="flex p-[3px] bg-muted rounded-lg gap-0.5">
                {(["public", "hidden", "private"] as PostVisibility[]).map((v) => (
                  <button key={v} type="button" onClick={() => onVisibility(v)}
                    className={`flex-1 py-[6px] rounded-sm text-[12px] font-medium transition-all duration-150
                      ${visibility === v
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}>
                    {v === "public" ? "Ochiq" : v === "hidden" ? "Havola" : "Yopiq"}
                  </button>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Ruxsatlar">
              <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
                {toggles.map(({ label, value, onChange }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2.5 bg-background">
                    <span className="text-[13px] font-medium text-foreground">{label}</span>
                    <button type="button" onClick={() => onChange(!value)}
                      className={`relative w-[34px] h-5 rounded-full border-none transition-colors duration-200
                        ${value ? "bg-primary" : "bg-border"}`}>
                      <span className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white
                        shadow-sm transition-transform duration-200
                        ${value ? "translate-x-[14px]" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Rejalashtirilgan vaqt">
              <input type="datetime-local" value={scheduledAt ?? ""}
                onChange={(e) => onScheduledAt(e.target.value || null)}
                className={inputCls} />
              {scheduledAt && (
                <button type="button" onClick={() => onScheduledAt(null)}
                  className="text-[12px] text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                  Bekor qilish
                </button>
              )}
            </FieldGroup>
          </>
        )}
      </div>
    </aside>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-foreground/50">
        {label}
      </span>
      {children}
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────── */

export default function WriteEditorPage() {
  const { state } = useAuth()
  const { user, token, loading } = state
  const router = useRouter()
  const searchParams = useSearchParams()

  const editUuid = searchParams.get("edit")
  const isEditing = Boolean(editUuid)
  const isMobile = useIsMobile()

  /* Article state */
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [cover, setCover] = useState("")
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("")
  const [visibility, setVisibility] = useState<PostVisibility>("public")
  const [categories, setCategories] = useState<CategoryPublicResponse[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [allowComments, setAllowComments] = useState(true)
  const [allowReactions, setAllowReactions] = useState(true)
  const [allowReposts, setAllowReposts] = useState(true)
  const [seoIndexable, setSeoIndexable] = useState(true)
  const [isPinned, setIsPinned] = useState(false)
  const [scheduledAt, setScheduledAt] = useState<string | null>(null)
  const [publicationState, setPublicationState] = useState<PublicationState>("draft")

  /* UI state */
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingPost, setLoadingPost] = useState(isEditing)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [editorWidth, setEditorWidth] = useState<EditorWidth>("comfortable")
  const [writePct, setWritePct] = useState(DEFAULT_WRITE_PCT)

  /* Refs */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedUuidRef = useRef<string | null>(editUuid)
  const saveRequestIdRef = useRef(0)
  const lastSavedSignatureRef = useRef("")
  const coverInputRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  /* Auth guard */
  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [loading, user, router])

  /* Title auto-resize */
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [title])

  /* ESC to exit focus mode */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && focusMode) setFocusMode(false) }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [focusMode])

  /* Global shortcuts */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === "s") { e.preventDefault(); if (title.trim()) saveDraft(true) }
      if (ctrl && e.shiftKey && e.key === "P") { e.preventDefault(); handleOpenPublishModal() }
      if (ctrl && e.shiftKey && e.key === "F") { e.preventDefault(); setFocusMode((v) => !v) }
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [title])

  /* Load categories */
  useEffect(() => {
    let cancelled = false
    categoriesApi.list({ page_size: 50 })
      .then((res) => { if (!cancelled) setCategories(res.items) })
      .catch(() => { })
    return () => { cancelled = true }
  }, [])

  /* Load post for editing */
  useEffect(() => {
    if (!editUuid || !token) return
    let cancelled = false
    setLoadingPost(true)
    postsApi.myGet(token, editUuid).then((post) => {
      if (cancelled) return
      setTitle(post.title ?? "")
      setExcerpt(post.excerpt ?? "")
      setContent(post.content ?? "")
      setCover(post.cover ?? "")
      setCoverPreviewUrl(getMediaUrl(post.cover) ?? "")
      setVisibility(post.visibility ?? "public")
      setAllowComments(post.allow_comments ?? true)
      setAllowReactions(post.allow_reactions ?? true)
      setAllowReposts(post.allow_reposts ?? true)
      setSeoIndexable(post.seo_indexable ?? true)
      setIsPinned(post.is_pinned ?? false)
      setScheduledAt(post.scheduled_at ?? null)
      setSelectedCategories(post.categories?.map((c: import("@/types/api").PostCategory) => c.uuid) ?? [])
      savedUuidRef.current = post.uuid
      const status = post.status ?? "draft"
      setPublicationState(status === "published" ? "published" : "draft")
      lastSavedSignatureRef.current = JSON.stringify({ title: post.title, content: post.content })
      setSaveStatus("saved"); setSavedAt(new Date())
    }).catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Maqolani yuklashda xatolik")
    }).finally(() => { if (!cancelled) setLoadingPost(false) })
    return () => { cancelled = true }
  }, [editUuid, token])

  /* Build post data */
  const buildPostData = useCallback(() => ({
    title: title.trim(), content,
    excerpt: excerpt.trim() || undefined,
    cover: cover || undefined,
    visibility, categories: selectedCategories,
    seo_indexable: seoIndexable, allow_comments: allowComments,
    allow_reactions: allowReactions, allow_reposts: allowReposts,
    is_pinned: isPinned, scheduled_at: scheduledAt,
  }), [title, content, excerpt, cover, visibility, selectedCategories,
    allowComments, allowReactions, allowReposts, seoIndexable, isPinned, scheduledAt])

  const draftSignature = useMemo(() => JSON.stringify(buildPostData()), [buildPostData])
  const hasContent = htmlToPlain(content).length > 0
  const hasDraftInput = Boolean(title.trim() || hasContent || excerpt.trim() || cover || selectedCategories.length)
  const isDirty = hasDraftInput && draftSignature !== lastSavedSignatureRef.current
  const hasPreviewContent = Boolean(title.trim() || hasContent)

  /* Before unload */
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (!isDirty) return; e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [isDirty])

  /* Save draft */
  const saveDraft = useCallback(async (showErr = true) => {
    if (!token) return
    if (!title.trim()) { if (showErr && hasContent) setError("Saqlash uchun sarlavha kiriting."); return }
    const reqId = ++saveRequestIdRef.current
    setSaveStatus("saving")
    try {
      const data = buildPostData()
      let uuid = savedUuidRef.current
      if (uuid) { await postsApi.update(token, uuid, data) }
      else { const post = await postsApi.create(token, data); uuid = post.uuid; savedUuidRef.current = uuid }
      if (reqId === saveRequestIdRef.current) {
        lastSavedSignatureRef.current = JSON.stringify(data)
        setSaveStatus("saved"); setSavedAt(new Date())
      }
    } catch (err) {
      if (reqId !== saveRequestIdRef.current) return
      setSaveStatus("error")
      if (showErr) setError(err instanceof Error ? err.message : "Saqlashda xatolik")
    }
  }, [token, title, hasContent, buildPostData])

  /* Autosave */
  useEffect(() => {
    if (!token || !isDirty || !title.trim()) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveDraft(false), AUTOSAVE_DELAY_MS)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [token, isDirty, title, saveDraft])

  /* Cover upload */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ""
    if (!file || !token) return
    setError(null)
    if (!file.type.startsWith("image/")) { setError("Faqat rasm fayllarini yuklash mumkin."); return }
    if (file.size > 5 * 1024 * 1024) { setError("Rasm hajmi 5MB dan oshmasligi kerak."); return }
    setUploadingCover(true)
    try {
      const upload = await uploadsApi.cover(token, file)
      // BUG 15 FIX: getMediaUrl(upload.path) — edit modeda path bilan izchil
      setCover(upload.path); setCoverPreviewUrl(getMediaUrl(upload.path) ?? upload.url)
    } catch (err) { setError(err instanceof Error ? err.message : "Rasm yuklashda xatolik") }
    finally { setUploadingCover(false) }
  }
  const removeCover = () => { setCover(""); setCoverPreviewUrl("") }

  /* Categories */
  const toggleCategory = (uuid: string) => {
    setSelectedCategories((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid])
  }
  const selectedCategoryNames = useMemo(
    () => categories.filter((c) => selectedCategories.includes(c.uuid)).map((c) => c.name),
    [categories, selectedCategories],
  )

  /* Sidebar */
  const toggleSidebar = (tab: SidebarTab) => setSidebarTab((prev) => prev === tab ? null : tab)

  /* Open publish modal */
  const handleOpenPublishModal = () => {
    if (!title.trim()) { setError("Sarlavha majburiy."); return }
    if (!hasContent) { setError("Maqola matni bo'sh bo'lishi mumkin emas."); return }
    setError(null); setShowPublishModal(true)
  }

  /* Publish */
  const handlePublish = async () => {
    if (!token || publishing) return
    if (!title.trim() || !hasContent) { setError("Sarlavha va maqola matni majburiy."); return }
    setPublishing(true); setError(null)
    try {
      const data = buildPostData()
      let uuid = savedUuidRef.current
      if (!uuid) { const post = await postsApi.create(token, data); uuid = post.uuid; savedUuidRef.current = uuid }
      else { await postsApi.update(token, uuid, data) }
      if (publicationState !== "published") {
        lastSavedSignatureRef.current = JSON.stringify(data)
        setSaveStatus("saved"); setSavedAt(new Date()); setShowPublishModal(false); return
      }
      // BUG 11 FIX: faqat PublishSettings fieldlari — title/content publish endpointiga ketmasdi
      const published = await postsApi.publish(token, uuid, {
        visibility: data.visibility,
        scheduled_at: data.scheduled_at ?? null,
        seo_indexable: data.seo_indexable,
        is_pinned: data.is_pinned,
        allow_comments: data.allow_comments,
        allow_reactions: data.allow_reactions,
        allow_reposts: data.allow_reposts,
        excerpt: data.excerpt ?? null,
        cover: data.cover ?? null,
        categories: data.categories ?? null,
      })
      lastSavedSignatureRef.current = JSON.stringify(data)
      setPublicationState("published"); setSaveStatus("saved"); setSavedAt(new Date())
      setShowPublishModal(false)
      // BUG 10 FIX: /@ prefiksi qo'shildi — avval /@username/slug o'rniga /username/slug edi
      // BUG 12 FIX: optional chaining — published.author undefined bo'lsa dashboard ga redirect
      if (published?.author?.username && published?.slug) {
        router.push(`/@${published.author.username}/${published.slug}`)
      } else {
        router.push("/dashboard/posts")
      }
      router.refresh()
    } catch (err) { setError(err instanceof Error ? err.message : "Saqlashda xatolik") }
    finally { setPublishing(false) }
  }

  const handleBack = () => {
    if (isDirty && !window.confirm("Saqlanmagan o'zgarishlar bor. Chiqib ketasizmi?")) return
    router.push("/dashboard/posts")
  }

  /* Loading */
  if (loading || !user || loadingPost) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="flex flex-col items-center gap-3.5 text-sm text-muted-foreground">
          <LoadingDots size="lg" className="text-primary" />
          {loadingPost && <span>Maqola yuklanmoqda...</span>}
        </div>
      </div>
    )
  }

  const sidebarOpen = sidebarTab !== null
  // Mobil'da preview panel CSS orqali (max-md:hidden) yashirin bo'ladi,
  // shuning uchun yozish paneli har doim to'liq kenglikda bo'lishi kerak
  // va sudrab kattalashtirish tutqichi ko'rsatilmasligi kerak.
  const previewVisible = showPreview && !isMobile

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className={`flex flex-col w-full h-dvh overflow-hidden bg-background
      ${focusMode
        ? "[&_.editor-topbar]:-translate-y-full [&_.editor-topbar]:opacity-0 [&_.editor-topbar]:pointer-events-none"
        : ""}`}>

      {/* ── Topbar ──────────────────────────────────────────────── */}
      <header className="editor-topbar flex-shrink-0 flex items-center justify-between
        h-[54px] px-3 sm:px-4 bg-background border-b border-border z-40
        transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]">

        {/* Left */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button type="button" onClick={handleBack} aria-label="Orqaga"
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
            text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150">
            <ArrowLeft size={16} />
          </button>
          <span className="hidden sm:inline text-[13.5px] font-semibold text-foreground whitespace-nowrap">
            {isEditing ? "Tahrirlash" : "Yangi maqola"}
          </span>
          {publicationState !== "draft" && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
          <SavePill
            status={saveStatus} savedAt={savedAt} isDirty={isDirty}
            onSave={() => { setError(null); saveDraft(true) }}
            disabled={saveStatus === "saving" || !title.trim()} />
        </div>

        {/* Center — width control (faqat desktop, preview panel bo'lganda mazmunli) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          {!focusMode && <WidthControl value={editorWidth} onChange={setEditorWidth} />}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <button type="button" onClick={() => setFocusMode((v) => !v)}
            title={focusMode ? "Oddiy rejim (Esc)" : "Diqqat rejimi"}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg
            text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150">
            {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <div className="hidden sm:block w-px h-4 bg-border mx-0.5 flex-shrink-0" />

          <button type="button" onClick={() => toggleSidebar("meta")}
            title="Meta ma'lumotlar"
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150
              ${sidebarTab === "meta"
                ? "bg-primary/8 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
            <Hash size={14} />
          </button>

          <button type="button" onClick={() => toggleSidebar("settings")}
            title="Sozlamalar"
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150
              ${sidebarTab === "settings"
                ? "bg-primary/8 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
            <Settings2 size={14} />
          </button>

          <div className="w-px h-4 bg-border mx-0.5 flex-shrink-0" />

          {/* Ko'rish/yashirish — faqat desktopda ma'noli (mobilda preview panel yo'q) */}
          <button type="button" onClick={() => setShowPreview((v) => !v)}
            className={`hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12.5px] font-medium
              transition-all duration-150
              ${showPreview
                ? "bg-primary/8 border-primary/20 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
            {showPreview ? <Eye size={13} /> : <EyeOff size={13} />}
            <span className="hidden lg:inline">Ko'rish</span>
          </button>

          <button type="button" onClick={handleOpenPublishModal}
            disabled={publishing || uploadingCover || !title.trim() || !hasContent}
            className="flex items-center gap-1.5 h-8 px-3 sm:px-4 rounded-lg border-none
            bg-primary hover:bg-primary/90 text-white text-[12.5px] font-semibold
            transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
            shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_8px_rgba(255,106,0,0.28)]
            hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_3px_12px_rgba(255,106,0,0.38)]
            disabled:shadow-none">
            {publishing ? <LoadingDots size="sm" /> : <Send size={12} />}
            <span className="hidden sm:inline">Nashr</span>
          </button>
        </div>
      </header>

      {/* ── Error Banner ────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5
          bg-inkly-orange-light border-b border-[#FECACA] text-[13px] text-destructive
          animate-in slide-in-from-top-1 duration-150 flex-shrink-0"
          role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Yopish"
            className="flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0
            hover:bg-inkly-peach transition-colors duration-150">
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Workspace ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Write pane ────────────────────────────────────────── */}
        <main
          className="flex flex-col min-w-0 min-h-0 overflow-hidden bg-background"
          style={{ width: previewVisible ? `${writePct}%` : "100%" }}>

          {/* Cover + Title zone */}
          <div className="flex-shrink-0 border-b border-border">
            <div className="w-full max-w-[780px] mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-0">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <CoverZone
                previewUrl={coverPreviewUrl}
                uploading={uploadingCover}
                inputRef={coverInputRef}
                onUpload={handleCoverUpload}
                onRemove={removeCover}
              />
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sarlavha..."
                rows={1}
                maxLength={180}
                spellCheck={false}
                style={{ caretColor: "var(--color-inkly-orange)" }}
                className="block w-full resize-none overflow-hidden border-none outline-none bg-transparent
                  text-[clamp(22px,6vw,42px)] font-[800] leading-[1.12] tracking-[-0.03em]
                  text-foreground placeholder:text-foreground/20
                  pb-4 sm:pb-5" />
            </div>
          </div>

          {/* Editor area */}
          <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto
            scrollbar-thin scrollbar-color-border">
            <div className={`mx-auto w-full px-4 sm:px-6 md:px-8 pt-4 sm:pt-5 pb-24 transition-[max-width] duration-200
              ${WIDTH_MAP[editorWidth]}`}>
              <InklyEditorNovel
                content={content}
                onChange={setContent}
                token={token}
                placeholder="Yozing yoki '/' bosing buyruqlar uchun..."
              />
            </div>
          </div>
        </main>

        {/* ── Drag handle (faqat desktop, preview ochiq bo'lganda) ── */}
        {previewVisible && (
          <DragHandle onDrag={setWritePct} />
        )}

        {/* ── Preview pane ──────────────────────────────────────── */}
        {previewVisible && (
          <aside
            className="flex flex-col min-w-0 min-h-0 overflow-hidden bg-muted/30 max-md:hidden"
            style={{ flex: 1 }}
            aria-label="Maqola ko'rinishi">

            <div className="flex items-center justify-between flex-shrink-0
              px-4 py-2.5 border-b border-border bg-background/70 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <Eye size={11} className="text-muted-foreground/50" />
                <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground/50">
                  Ko'rinishi
                </span>
                {hasPreviewContent && (
                  <span className="px-1.5 py-px rounded-full bg-emerald-50 border border-emerald-200
                    text-emerald-600 text-[9px] font-bold tracking-[0.06em]">
                    LIVE
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                title="Ko'rinishni yopish"
                className="flex items-center justify-center w-[26px] h-[26px] rounded-lg
                text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150">
                <EyeOff size={13} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5
              scrollbar-thin scrollbar-color-border">
              {hasPreviewContent ? (
                <div className="bg-background border border-border rounded-2xl px-7 py-8 shadow-sm">
                  <ArticlePreview
                    title={title}
                    excerpt={excerpt}
                    content={content}
                    cover={coverPreviewUrl}
                  />
                </div>
              ) : (
                <div className="bg-background border border-border rounded-2xl
                  flex items-center justify-center min-h-[300px]">
                  <PreviewEmptyState />
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ── Stats Bar (desktop) / Mobile Stats Pill ────────────────── */}
      <StatsBar content={content} title={title} user={user} />
      <MobileStatsPill content={content} />

      {/* ── Sidebar Overlay ─────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" aria-label="Yopish"
            onClick={() => setSidebarTab(null)}
            className="absolute inset-0 bg-black/8 border-0 cursor-pointer
            animate-in fade-in duration-150" />
          <SidebarPanel
            activeTab={sidebarTab} onClose={() => setSidebarTab(null)} onTabChange={setSidebarTab}
            categories={categories} selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            excerpt={excerpt} onExcerpt={setExcerpt}
            visibility={visibility} onVisibility={setVisibility}
            allowComments={allowComments} onAllowComments={setAllowComments}
            allowReactions={allowReactions} onAllowReactions={setAllowReactions}
            allowReposts={allowReposts} onAllowReposts={setAllowReposts}
            seoIndexable={seoIndexable} onSeoIndexable={setSeoIndexable}
            isPinned={isPinned} onIsPinned={setIsPinned}
            scheduledAt={scheduledAt} onScheduledAt={setScheduledAt}
          />
        </div>
      )}

      {/* ── Publish Modal ───────────────────────────────────────── */}
      <PublishModal
        open={showPublishModal} onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublish} publishing={publishing}
        publicationState={publicationState} onPublicationState={setPublicationState}
        visibility={visibility} onVisibility={setVisibility}
        categories={categories} selectedCategories={selectedCategories}
        selectedCategoryNames={selectedCategoryNames} onToggleCategory={toggleCategory}
        excerpt={excerpt} onExcerpt={setExcerpt}
        coverPreviewUrl={coverPreviewUrl} uploadingCover={uploadingCover}
        onCoverUpload={handleCoverUpload} onRemoveCover={removeCover}
        coverInputRef={coverInputRef}
        allowComments={allowComments} onAllowComments={setAllowComments}
        allowReactions={allowReactions} onAllowReactions={setAllowReactions}
        allowReposts={allowReposts} onAllowReposts={setAllowReposts}
        seoIndexable={seoIndexable} onSeoIndexable={setSeoIndexable}
        isPinned={isPinned} onIsPinned={setIsPinned}
        scheduledAt={scheduledAt} onScheduledAt={setScheduledAt}
      />

      {/* ── Focus Mode Hint ─────────────────────────────────────── */}
      {focusMode && (
        <button type="button" onClick={() => setFocusMode(false)}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-0
          bg-black/75 hover:bg-black/88 text-white/80 text-[11.5px]
          backdrop-blur-md transition-colors duration-150
          animate-in slide-in-from-bottom-2 fade-in duration-200">
          <Minimize2 size={11} />
          <span>Esc — oddiy rejim</span>
        </button>
      )}
    </div>
  )
}