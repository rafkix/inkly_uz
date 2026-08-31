"use client"

/**
 * PublishModal — "Nashr qilish" tugmasi bosilganda chiqadigan modal.
 *
 * Qanday ishlatiladi:
 *
 *   import { PublishModal } from "@/components/editor/publish-modal"
 *
 *   <PublishModal
 *     open={showPublishModal}
 *     onClose={() => setShowPublishModal(false)}
 *     onConfirm={handlePublish}
 *     publishing={publishing}
 *     publicationState={publicationState}
 *     onPublicationState={handlePublicationState}
 *     visibility={visibility}
 *     onVisibility={setVisibility}
 *     categories={categories}
 *     selectedCategories={selectedCategories}
 *     selectedCategoryNames={selectedCategoryNames}
 *     onToggleCategory={toggleCategory}
 *     excerpt={excerpt}
 *     onExcerpt={setExcerpt}
 *     coverPreviewUrl={coverPreviewUrl}
 *     uploadingCover={uploadingCover}
 *     onCoverUpload={handleCoverUpload}
 *     onRemoveCover={removeCover}
 *     coverInputRef={coverInputRef}
 *     allowComments={allowComments}
 *     onAllowComments={setAllowComments}
 *     allowReactions={allowReactions}
 *     onAllowReactions={setAllowReactions}
 *     allowReposts={allowReposts}
 *     onAllowReposts={setAllowReposts}
 *     seoIndexable={seoIndexable}
 *     onSeoIndexable={setSeoIndexable}
 *     isPinned={isPinned}
 *     onIsPinned={setIsPinned}
 *     scheduledAt={scheduledAt}
 *     onScheduledAt={setScheduledAt}
 *   />
 */

import { useEffect, useRef, useState } from "react"

import {
  Check,
  ChevronDown,
  Image as ImageIcon,
  Search,
  Send,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoadingDots } from "@/components/ui/loading-dots"

import type {
  CategoryPublicResponse,
  PostVisibility,
} from "@/types/api"

type PublicationState = "draft" | "published"

/* =========================================================
   Props
========================================================= */

interface PublishModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  publishing: boolean

  publicationState: PublicationState
  onPublicationState: (value: PublicationState) => void

  visibility: PostVisibility
  onVisibility: (value: PostVisibility) => void

  categories: CategoryPublicResponse[]
  selectedCategories: string[]
  selectedCategoryNames: string[]
  onToggleCategory: (uuid: string) => void

  excerpt: string
  onExcerpt: (value: string) => void

  coverPreviewUrl: string
  uploadingCover: boolean
  onCoverUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onRemoveCover: () => void
  coverInputRef: React.RefObject<HTMLInputElement | null>

  allowComments: boolean
  onAllowComments: (value: boolean) => void
  allowReactions: boolean
  onAllowReactions: (value: boolean) => void
  allowReposts: boolean
  onAllowReposts: (value: boolean) => void
  seoIndexable: boolean
  onSeoIndexable: (value: boolean) => void
  isPinned: boolean
  onIsPinned: (value: boolean) => void

  scheduledAt: string | null
  onScheduledAt: (value: string | null) => void
}

/* =========================================================
   Modal
========================================================= */

export function PublishModal({
  open,
  onClose,
  onConfirm,
  publishing,

  publicationState,
  onPublicationState,

  visibility,
  onVisibility,

  categories,
  selectedCategories,
  selectedCategoryNames,
  onToggleCategory,

  excerpt,
  onExcerpt,

  coverPreviewUrl,
  uploadingCover,
  onCoverUpload,
  onRemoveCover,
  coverInputRef,

  allowComments,
  onAllowComments,
  allowReactions,
  onAllowReactions,
  allowReposts,
  onAllowReposts,
  seoIndexable,
  onSeoIndexable,
  isPinned,
  onIsPinned,

  scheduledAt,
  onScheduledAt,
}: PublishModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  /* Lock body scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  // Tanlangan holatga qarab tugma matni va harakati o'zgaradi —
  // "Qoralama" tanlansa endi hech qachon publish endpointi
  // chaqirilmaydi, faqat saqlanadi.
  const confirmLabel =
    publicationState === "published"
      ? scheduledAt
        ? "Rejalashtirish"
        : "Nashr qilish"
      : "Qoralama sifatida saqlash"

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      aria-modal="true"
      role="dialog"
      aria-label="Nashr sozlamalari"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 mx-auto flex h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl">

        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-border-default px-6 py-4">
          <h2 className="text-[15px] font-semibold text-text-primary">
            Nashr sozlamalari
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-muted hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
        >

          {/* === Holat === */}
          <Section title="Holat">
            <div className="space-y-3">
              <StatusRadio
                checked={publicationState === "draft"}
                title="Qoralama"
                description="Faqat siz ko'rasiz"
                onClick={() => onPublicationState("draft")}
              />
              <StatusRadio
                checked={publicationState === "published"}
                title="Nashr etilgan"
                description="Barchaga ochiq"
                onClick={() => onPublicationState("published")}
              />
            </div>

            {/* Ko'rinish (visibility) — avval bu prop qabul qilinsa ham
                hech qayerda ishlatilmagan edi, endi haqiqiy UI bor */}
            {publicationState !== "draft" && (
              <div className="mt-4">
                <FieldGroup label="Kimlar ko'ra oladi">
                  <div className="flex gap-2">
                    <VisibilityOption
                      active={visibility === "public"}
                      label="Ommaviy"
                      onClick={() => onVisibility("public")}
                    />
                    <VisibilityOption
                      active={visibility === "hidden"}
                      label="Havola orqali"
                      onClick={() => onVisibility("hidden")}
                    />
                    <VisibilityOption
                      active={visibility === "private"}
                      label="Faqat men"
                      onClick={() => onVisibility("private")}
                    />
                  </div>
                </FieldGroup>
              </div>
            )}

            {/* Rejalashtirilgan nashr — avval bu prop umuman
                interfeysga kiritilmagan edi, funksiya ishlamas edi */}
            {publicationState === "published" && (
              <div className="mt-4">
                <FieldGroup
                  label="Nashr vaqti"
                  hint="Bo'sh qoldirsangiz, darhol nashr etiladi"
                >
                  <input
                    type="datetime-local"
                    value={scheduledAt ?? ""}
                    onChange={(e) => onScheduledAt(e.target.value || null)}
                    className="h-9 w-full rounded-lg border border-border-default px-3 text-sm outline-none focus:border-primary transition-colors"
                  />
                </FieldGroup>
              </div>
            )}
          </Section>

          <Divider />

          {/* === Kontent === */}
          <Section title="Kontent">

            {/* Kategoriyalar */}
            <FieldGroup label="Kategoriyalar">
              <CategorySelect
                categories={categories}
                selectedCategories={selectedCategories}
                selectedNames={selectedCategoryNames}
                onToggle={onToggleCategory}
              />
            </FieldGroup>

            {/* Qisqacha tavsif */}
            <FieldGroup
              label="Qisqacha tavsif"
              right={<span className="text-[11px] text-text-muted">{excerpt.length}/500</span>}
            >
              <textarea
                value={excerpt}
                onChange={(e) => onExcerpt(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Maqolaga qisqacha tavsif yozing..."
                className="w-full resize-none rounded-lg border border-border-default px-3 py-2.5 text-sm leading-5 outline-none focus:border-primary transition-colors placeholder:text-text-muted"
              />
            </FieldGroup>

            {/* Asosiy rasm */}
            <FieldGroup label="Asosiy rasm">
              {coverPreviewUrl ? (
                <div className="group relative overflow-hidden rounded-lg border border-border-default">
                  <img
                    src={coverPreviewUrl}
                    alt="Cover"
                    className="aspect-[1.91/1] w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium"
                    >
                      Almashtirish
                    </button>
                    <button
                      type="button"
                      onClick={onRemoveCover}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-500"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex h-[80px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#C9CDD2] bg-bg-muted text-text-muted hover:border-primary hover:bg-inkly-orange-light transition-colors disabled:pointer-events-none"
                >
                  {uploadingCover ? (
                    <LoadingDots size="md" />
                  ) : (
                    <>
                      <ImageIcon size={18} />
                      <span className="mt-1 text-xs font-medium">Rasm yuklash</span>
                      <span className="text-[10px] text-text-muted">JPG, PNG yoki WebP · Maks. 5MB</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onCoverUpload}
                className="hidden"
              />
            </FieldGroup>

          </Section>

          <Divider />

          {/* === Qo'shimcha === */}
          <Section title="Qo'shimcha">
            <div className="space-y-3">
              {[
                { checked: allowComments, onChange: onAllowComments, label: "Izohlarga ruxsat berish" },
                { checked: allowReactions, onChange: onAllowReactions, label: "Reaksiyalarga ruxsat berish" },
                { checked: allowReposts, onChange: onAllowReposts, label: "Qayta ulashishga ruxsat berish" },
                { checked: seoIndexable, onChange: onSeoIndexable, label: "Qidiruv tizimlarida ko'rsatish" },
                { checked: isPinned, onChange: onIsPinned, label: "Profilga mahkamlash" },
              ].map(({ checked, onChange, label }) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-2.5 select-none"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${checked
                      ? "border-primary bg-primary"
                      : "border-border-default bg-white"
                      }`}
                    onClick={() => onChange(!checked)}
                  >
                    {checked && <Check size={10} className="text-white" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-sm text-text-primary">{label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Bottom padding for scroll */}
          <div className="h-4" />
        </div>

        {/* ── Footer (Sticky) ── */}
        <div className="shrink-0 border-t border-border-default bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={publishing}
              className="h-10 flex-1 rounded-lg border-border-default text-sm font-medium text-text-primary"
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={publishing}
              className="h-10 flex-[2] rounded-lg bg-primary text-sm font-semibold text-white hover:bg-inkly-hover disabled:opacity-60"
            >
              {publishing ? (
                <>
                  <LoadingDots size="sm" className="mr-2" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  {confirmLabel}
                  <Send size={14} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

/* =========================================================
   Helpers
========================================================= */

function Divider() {
  return <div className="mx-6 h-px bg-border-default" />
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="px-6 py-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </section>
  )
}

function FieldGroup({
  label,
  hint,
  right,
  children,
}: {
  label: string
  hint?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-semibold text-[#24292E]">{label}</label>
        {right}
      </div>
      {children}
      {hint && (
        <p className="mt-1.5 text-[10px] text-text-muted">{hint}</p>
      )}
    </div>
  )
}

function StatusRadio({
  checked,
  title,
  description,
  onClick,
}: {
  checked: boolean
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-2.5 text-left"
    >
      <span
        className={`mt-0.5 flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border transition-colors ${checked ? "border-primary" : "border-[#7D8389]"
          }`}
      >
        {checked && (
          <span className="h-[6px] w-[6px] rounded-full bg-primary" />
        )}
      </span>
      <span className="min-w-0">
        <span
          className={`block text-[13px] font-medium ${checked ? "text-text-primary" : "text-[#34393E]"
            }`}
        >
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] leading-4 text-[#7C8288]">
          {description}
        </span>
      </span>
    </button>
  )
}

function VisibilityOption({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${active
        ? "border-primary bg-inkly-orange-light text-primary"
        : "border-border-default text-text-muted hover:border-border-default"
        }`}
    >
      {label}
    </button>
  )
}

/* =========================================================
   Category Select (qidiruv bilan — kategoriyalar ko'p bo'lsa
   ham qulay tanlash uchun)
========================================================= */

function CategorySelect({
  categories,
  selectedCategories,
  selectedNames,
  onToggle,
}: {
  categories: CategoryPublicResponse[]
  selectedCategories: string[]
  selectedNames: string[]
  onToggle: (uuid: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const filtered = query
    ? categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : categories

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-border-default bg-white px-3 text-left text-sm text-text-muted outline-none hover:border-border-default transition-colors"
      >
        <span className="truncate">
          {selectedNames.length ? selectedNames.join(", ") : "Kategoriyani tanlang"}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-10 z-50 max-h-64 overflow-hidden rounded-lg border border-border-default bg-white shadow-lg">
          {categories.length > 6 && (
            <div className="flex items-center gap-2 border-b border-bg-muted px-3 py-2">
              <Search size={13} className="shrink-0 text-text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kategoriya qidirish..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-text-muted">Kategoriyalar topilmadi</div>
            ) : (
              filtered.map((cat) => {
                const selected = selectedCategories.includes(cat.uuid)
                return (
                  <button
                    key={cat.uuid}
                    type="button"
                    onClick={() => onToggle(cat.uuid)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-inkly-orange-light"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected
                        ? "border-primary bg-primary text-white"
                        : "border-border-default"
                        }`}
                    >
                      {selected && <Check size={11} />}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}