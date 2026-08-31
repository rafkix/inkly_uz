"use client"

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  Component,
} from "react"
import type { ReactNode } from "react"
import { Editor, EditorContent, useEditor } from "@tiptap/react"
import { Node, mergeAttributes } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import LinkExt from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

import {
  Bold,
  Italic,
  Link as LinkIcon,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  X,
  ExternalLink,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { uploadsApi } from "@/lib/api/uploads"

import "./inkly-editor.css"
import { LoadingDots } from "@/components/ui/loading-dots"

/* =========================================================
   EditorErrorBoundary
========================================================= */

class EditorErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; key: number }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, key: 0 }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    if (
      error instanceof DOMException ||
      (error.message && error.message.includes("insertBefore"))
    ) {
      setTimeout(() => {
        this.setState((s) => ({ hasError: false, key: s.key + 1 }))
      }, 50)
    }
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

/* =========================================================
   Types
========================================================= */

interface InklyEditorProps {
  content: string
  onChange: (content: string) => void
  token?: string | null
  placeholder?: string
}

interface VideoParseResult {
  provider: "youtube" | "vimeo" | null
  embedUrl: string | null
}

type SlashItem = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  command: (
    editor: Editor,
    triggerImage?: () => void,
    triggerVideo?: () => void
  ) => void
}

interface SlashCommandState {
  active: boolean
  query: string
  range: { from: number; to: number }
}

/* =========================================================
   Video URL helpers
========================================================= */

function parseVideoUrl(url: string): VideoParseResult {
  const trimmed = url.trim()
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of ytPatterns) {
    const match = trimmed.match(pattern)
    if (match) {
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`,
      }
    }
  }
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?byline=0&portrait=0`,
    }
  }
  return { provider: null, embedUrl: null }
}

/* =========================================================
   Mobile helpers
   — useIsMobile: ekran kengligiga qarab mobil rejimni aniqlaydi
   — useKeyboardInset: virtual klaviatura balandligini
     window.visualViewport orqali kuzatadi, shunda kerakli
     panellarni klaviatura ustida (Telegram uslubida) suza olamiz
========================================================= */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return isMobile
}

function useKeyboardInset() {
  const [inset, setInset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      // Kichik shovqinlarni (1-2px) e'tiborsiz qoldiramiz
      setInset(kb > 40 ? Math.round(kb) : 0)
    }
    update()
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [])
  return inset
}

/* =========================================================
   Video Node
========================================================= */

const VideoNode = Node.create({
  name: "inklyVideo",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      provider: { default: null },
    }
  },
  parseHTML() {
    return [{ tag: "div[data-inkly-video]" }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-inkly-video": "" }),
      [
        "div",
        { class: "inkly-video-block" },
        [
          "div",
          { class: "inkly-video-ratio" },
          [
            "iframe",
            {
              src: HTMLAttributes.src,
              allow:
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              allowfullscreen: "true",
              loading: "lazy",
              title: "Embedded video",
              frameborder: "0",
            },
          ],
        ],
      ],
    ]
  },
  addNodeView() {
    return ({ node }) => {
      const wrapper = document.createElement("div")
      wrapper.setAttribute("data-inkly-video", "")
      const block = document.createElement("div")
      block.className = "inkly-video-block"
      const ratio = document.createElement("div")
      ratio.className = "inkly-video-ratio"
      const iframe = document.createElement("iframe")
      iframe.src = node.attrs.src ?? ""
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      iframe.allowFullscreen = true
      iframe.loading = "lazy"
      iframe.title = "Embedded video"
      iframe.frameBorder = "0"
      ratio.appendChild(iframe)
      block.appendChild(ratio)
      wrapper.appendChild(block)
      return {
        dom: wrapper,
        update(updatedNode) {
          if (updatedNode.type.name !== "inklyVideo") return false
          if (iframe.src !== updatedNode.attrs.src) {
            iframe.src = updatedNode.attrs.src ?? ""
          }
          return true
        },
      }
    }
  },
})

/* =========================================================
   Slash items
========================================================= */

const SLASH_ITEMS: SlashItem[] = [
  {
    id: "h1",
    title: "Sarlavha 1",
    description: "Katta bo'lim sarlavhasi",
    icon: <Heading1 size={18} />,
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: "h2",
    title: "Sarlavha 2",
    description: "O'rta bo'lim sarlavhasi",
    icon: <Heading2 size={18} />,
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "h3",
    title: "Sarlavha 3",
    description: "Kichik bo'lim sarlavhasi",
    icon: <Heading3 size={18} />,
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: "quote",
    title: "Iqtibos",
    description: "Ajratilgan iqtibos bloki",
    icon: <Quote size={18} />,
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: "bulletList",
    title: "Belgili ro'yxat",
    description: "Tartibsiz ro'yxat",
    icon: <List size={18} />,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "orderedList",
    title: "Raqamli ro'yxat",
    description: "Tartiblangan ro'yxat",
    icon: <ListOrdered size={18} />,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "codeBlock",
    title: "Kod bloki",
    description: "Monospace kod",
    icon: <Code2 size={18} />,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: "image",
    title: "Rasm",
    description: "Rasm yuklash",
    icon: <ImageIcon size={18} />,
    command: (_editor, triggerImage) => triggerImage?.(),
  },
  {
    id: "video",
    title: "Video",
    description: "YouTube yoki Vimeo",
    icon: <Video size={18} />,
    command: (_editor, _triggerImage, triggerVideo) => triggerVideo?.(),
  },
]

const SLASH_CLOSED: SlashCommandState = {
  active: false,
  query: "",
  range: { from: 0, to: 0 },
}

/* =========================================================
   createSlashDetectExtension
========================================================= */

function createSlashDetectExtension(
  onUpdateRef: React.MutableRefObject<(s: SlashCommandState) => void>,
  onCloseRef: React.MutableRefObject<() => void>
) {
  return Extension.create({
    name: "slashDetect",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("slashDetect"),
          view() {
            return {
              update(view) {
                const { $from } = view.state.selection
                const textBefore = $from.parent.textContent.slice(
                  0,
                  $from.parentOffset
                )
                const slashIndex = textBefore.lastIndexOf("/")

                if (slashIndex === -1) {
                  onCloseRef.current()
                  return
                }

                const charBeforeSlash = textBefore[slashIndex - 1]
                if (
                  charBeforeSlash &&
                  charBeforeSlash !== " " &&
                  charBeforeSlash !== "\n"
                ) {
                  onCloseRef.current()
                  return
                }

                const query = textBefore.slice(slashIndex + 1)
                if (query.includes(" ")) {
                  onCloseRef.current()
                  return
                }

                const from = $from.pos - query.length - 1
                const to = $from.pos


                onUpdateRef.current({
                  active: true,
                  query,
                  range: { from, to },
                })
              },
            }
          },
        }),
      ]
    },
  })
}

/* =========================================================
   SlashCommandMenu
========================================================= */

function SlashCommandMenu({
  items,
  selectedIndex,
  onSelect,
}: {
  items: SlashItem[]
  selectedIndex: number
  onSelect: (item: SlashItem) => void
}) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  if (items.length === 0) return null

  return (
    <div
      className="inkly-slash-menu"
      role="listbox"
      aria-label="Buyruqlar menyusi"
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          type="button"
          role="option"
          aria-selected={index === selectedIndex}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(item)
          }}
          className={`inkly-slash-item${
            index === selectedIndex ? " inkly-slash-item--active" : ""
          }`}
        >
          <span className="inkly-slash-icon">{item.icon}</span>
          <span className="inkly-slash-text">
            <span className="inkly-slash-title">{item.title}</span>
            <span className="inkly-slash-desc">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

/* =========================================================
   BubbleButton
========================================================= */

function BubbleButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inkly-bubble-btn${active ? " inkly-bubble-btn--active" : ""}`}
    >
      {children}
    </button>
  )
}

/* =========================================================
   LinkPopover
========================================================= */

function LinkPopover({
  onApply,
  onClose,
  initialUrl,
}: {
  onApply: (url: string) => void
  onClose: () => void
  initialUrl: string
}) {
  const [value, setValue] = useState(initialUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const apply = useCallback(() => {
    const trimmed = value.trim()
    const normalized =
      trimmed && !/^https?:\/\//i.test(trimmed)
        ? `https://${trimmed}`
        : trimmed
    onApply(normalized)
  }, [value, onApply])

  return (
    <div className="inkly-link-popover">
      <div className="inkly-link-popover-inner">
        <LinkIcon size={13} className="inkly-link-icon" />
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); apply() }
            if (e.key === "Escape") { e.preventDefault(); onClose() }
          }}
          placeholder="Havolani joylashtiring..."
          className="inkly-link-input"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={apply}
          className="inkly-link-apply"
          title="Qo'llash"
        >
          <Check size={12} />
        </button>
        {initialUrl && (
          <>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onApply("")}
              className="inkly-link-remove"
              title="Havolani o'chirish"
            >
              <X size={12} />
            </button>
            <a
              href={initialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={(e) => e.preventDefault()}
              className="inkly-link-open"
              title="Havolani ochish"
            >
              <ExternalLink size={12} />
            </a>
          </>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   VideoInputPopover
========================================================= */

function VideoInputPopover({
  onInsert,
  onClose,
}: {
  onInsert: (url: string) => void
  onClose: () => void
}) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const insert = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) { setError("Iltimos, havolani kiriting"); return }
    const { embedUrl } = parseVideoUrl(trimmed)
    if (!embedUrl) {
      setError("Faqat YouTube va Vimeo havolalari qo'llab-quvvatlanadi")
      return
    }
    onInsert(trimmed)
  }, [value, onInsert])

  return (
    <div className="inkly-video-popover">
      <div className="inkly-video-popover-header">
        <Video size={15} />
        <span>Video qo'shish</span>
        <button type="button" onClick={onClose} className="inkly-video-close">
          <X size={14} />
        </button>
      </div>
      <input
        ref={inputRef}
        type="url"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError("") }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); insert() }
          if (e.key === "Escape") { e.preventDefault(); onClose() }
        }}
        placeholder="https://youtube.com/watch?v=... yoki vimeo.com/..."
        className="inkly-video-input"
      />
      {error && <p className="inkly-video-error">{error}</p>}
      <div className="inkly-video-actions">
        <button type="button" onClick={insert} className="inkly-video-btn-primary">
          Video qo'shish
        </button>
        <button type="button" onClick={onClose} className="inkly-video-btn-secondary">
          Bekor qilish
        </button>
      </div>
    </div>
  )
}

/* =========================================================
   FloatingToolbar
========================================================= */

interface FloatingToolbarProps {
  editor: Editor | null
  showLinkPopover: boolean
  setShowLinkPopover: (v: boolean) => void
  currentLinkUrl: string
  applyLink: (url: string) => void
}

function FloatingToolbar({
  editor,
  showLinkPopover,
  setShowLinkPopover,
  currentLinkUrl,
  applyLink,
}: FloatingToolbarProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor) return

    const update = () => {
      const { empty } = editor.state.selection
      if (empty || !editor.isEditable) { setVisible(false); return }

      const sel = window.getSelection()
      if (!sel?.rangeCount) { setVisible(false); return }

      const rect = sel.getRangeAt(0).getBoundingClientRect()
      const wrapperEl = document.querySelector(".inkly-novel-wrapper")
      if (!wrapperEl) { setVisible(false); return }

      const wRect = wrapperEl.getBoundingClientRect()
      const toolbarW = toolbarRef.current?.offsetWidth ?? 300
      const rawLeft = rect.left - wRect.left + rect.width / 2 - toolbarW / 2
      const left = Math.max(4, Math.min(rawLeft, wRect.width - toolbarW - 4))
      const topAbove = rect.top - wRect.top - 52
      const top = topAbove < 4 ? rect.bottom - wRect.top + 8 : topAbove

      setPos({ top, left })
      setVisible(true)
    }

    const hide = () => setVisible(false)

    editor.on("selectionUpdate", update)
    editor.on("blur", hide)
    editor.on("focus", update)

    return () => {
      editor.off("selectionUpdate", update)
      editor.off("blur", hide)
      editor.off("focus", update)
    }
  }, [editor])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowLinkPopover(false)
        setVisible(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [visible, setShowLinkPopover])

  if (!editor || !visible) return null

  return (
    <div
      ref={toolbarRef}
      className="inkly-bubble"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        zIndex: 40,
        pointerEvents: "auto",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {showLinkPopover ? (
        <LinkPopover
          initialUrl={currentLinkUrl}
          onApply={applyLink}
          onClose={() => setShowLinkPopover(false)}
        />
      ) : (
        <>
          <BubbleButton active={editor.isActive("bold")} title="Qalin"
            onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={13} />
          </BubbleButton>
          <BubbleButton active={editor.isActive("italic")} title="Kursiv"
            onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={13} />
          </BubbleButton>
          <BubbleButton active={editor.isActive("link")} title="Havola"
            onClick={() => setShowLinkPopover(true)}>
            <LinkIcon size={13} />
          </BubbleButton>

          <div className="inkly-bubble-divider" />

          <BubbleButton active={editor.isActive("heading", { level: 1 })} title="Sarlavha 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 size={13} />
          </BubbleButton>
          <BubbleButton active={editor.isActive("heading", { level: 2 })} title="Sarlavha 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={13} />
          </BubbleButton>
          <BubbleButton active={editor.isActive("heading", { level: 3 })} title="Sarlavha 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={13} />
          </BubbleButton>

          <div className="inkly-bubble-divider" />

          <BubbleButton active={editor.isActive("blockquote")} title="Iqtibos"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={13} />
          </BubbleButton>
          <BubbleButton active={editor.isActive("bulletList")} title="Belgili ro'yxat"
            onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={13} />
          </BubbleButton>
          <BubbleButton active={editor.isActive("orderedList")} title="Raqamli ro'yxat"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={13} />
          </BubbleButton>
        </>
      )}
    </div>
  )
}

/* =========================================================
   MobileBarButton / MobileFormatBar
   Telegram uslubidagi: klaviatura ochiq bo'lganda uning
   TEPASIDA suzib turadigan formatlash paneli. Katta teginish
   maydonlari (44px), gorizontal scroll.
========================================================= */

function MobileBarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 10,
        border: "none",
        background: active ? "rgba(59,130,246,0.12)" : "transparent",
        color: active ? "#3b82f6" : "inherit",
      }}
    >
      {children}
    </button>
  )
}

interface MobileFormatBarProps {
  editor: Editor
  bottom: number
  showLinkPopover: boolean
  setShowLinkPopover: (v: boolean) => void
  currentLinkUrl: string
  applyLink: (url: string) => void
  onImage: () => void
  onVideo: () => void
}

function MobileFormatBar({
  editor,
  bottom,
  showLinkPopover,
  setShowLinkPopover,
  currentLinkUrl,
  applyLink,
  onImage,
  onVideo,
}: MobileFormatBarProps) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom,
        zIndex: 50,
        background: "var(--inkly-editor-bg, #ffffff)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {showLinkPopover ? (
        <div style={{ padding: 8 }}>
          <LinkPopover
            initialUrl={currentLinkUrl}
            onApply={applyLink}
            onClose={() => setShowLinkPopover(false)}
          />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: "6px 8px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <MobileBarButton active={editor.isActive("bold")} title="Qalin"
            onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={18} />
          </MobileBarButton>
          <MobileBarButton active={editor.isActive("italic")} title="Kursiv"
            onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={18} />
          </MobileBarButton>
          <MobileBarButton active={editor.isActive("link")} title="Havola"
            onClick={() => setShowLinkPopover(true)}>
            <LinkIcon size={18} />
          </MobileBarButton>
          <div style={{ width: 1, height: 24, background: "rgba(0,0,0,0.08)", margin: "0 4px", flex: "0 0 auto" }} />
          <MobileBarButton active={editor.isActive("heading", { level: 1 })} title="Sarlavha 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 size={18} />
          </MobileBarButton>
          <MobileBarButton active={editor.isActive("heading", { level: 2 })} title="Sarlavha 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={18} />
          </MobileBarButton>
          <MobileBarButton active={editor.isActive("heading", { level: 3 })} title="Sarlavha 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={18} />
          </MobileBarButton>
          <div style={{ width: 1, height: 24, background: "rgba(0,0,0,0.08)", margin: "0 4px", flex: "0 0 auto" }} />
          <MobileBarButton active={editor.isActive("blockquote")} title="Iqtibos"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={18} />
          </MobileBarButton>
          <MobileBarButton active={editor.isActive("bulletList")} title="Belgili ro'yxat"
            onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={18} />
          </MobileBarButton>
          <MobileBarButton active={editor.isActive("orderedList")} title="Raqamli ro'yxat"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={18} />
          </MobileBarButton>
          <div style={{ width: 1, height: 24, background: "rgba(0,0,0,0.08)", margin: "0 4px", flex: "0 0 auto" }} />
          <MobileBarButton title="Rasm" onClick={onImage}>
            <ImageIcon size={18} />
          </MobileBarButton>
          <MobileBarButton title="Video" onClick={onVideo}>
            <Video size={18} />
          </MobileBarButton>
        </div>
      )}
    </div>
  )
}

/* =========================================================
   MobileSlashSheet
   Slash-buyruqlar uchun klaviatura ustida suzuvchi bottom-sheet
========================================================= */

function MobileSlashSheet({
  items,
  selectedIndex,
  bottom,
  onSelect,
}: {
  items: SlashItem[]
  selectedIndex: number
  bottom: number
  onSelect: (item: SlashItem) => void
}) {
  if (items.length === 0) return null
  return (
    <div
      role="listbox"
      aria-label="Buyruqlar menyusi"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom,
        zIndex: 55,
        maxHeight: "45vh",
        overflowY: "auto",
        background: "var(--inkly-editor-bg, #ffffff)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "14px 14px 0 0",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
      }}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={index === selectedIndex}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(item)
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "12px 16px",
            border: "none",
            background: index === selectedIndex ? "rgba(0,0,0,0.04)" : "transparent",
            textAlign: "left",
          }}
        >
          <span style={{ flex: "0 0 auto", opacity: 0.7 }}>{item.icon}</span>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 500, fontSize: 14 }}>{item.title}</span>
            <span style={{ fontSize: 12, opacity: 0.6 }}>{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

/* =========================================================
   Main Editor
========================================================= */

function _InklyEditorInner({
  content,
  onChange,
  token,
  placeholder,
}: InklyEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [slashState, setSlashState] = useState<SlashCommandState>(SLASH_CLOSED)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const [isEditorFocused, setIsEditorFocused] = useState(false)

  const isMobile = useIsMobile()
  const keyboardInset = useKeyboardInset()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<Editor | null>(null)
  const isInternalUpdate = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const slashActiveRef = useRef(false)
  const slashItemsRef = useRef<SlashItem[]>([])
  const slashIndexRef = useRef(0)
  const slashRangeRef = useRef<{ from: number; to: number }>({ from: 0, to: 0 })
  const executeSlashRef = useRef<(item: SlashItem) => void>(() => {})

  slashActiveRef.current = slashState.active
  slashIndexRef.current = selectedIndex
  slashRangeRef.current = slashState.range


  const slashUpdateRef = useRef<(s: SlashCommandState) => void>(() => {})
  const slashCloseRef = useRef<() => void>(() => {})

  slashUpdateRef.current = (state: SlashCommandState) => {
    let rangeChanged = false
    setSlashState((prev) => {
      const isSame =
        prev.active === state.active &&
        prev.query === state.query &&
        prev.range.from === state.range.from &&
        prev.range.to === state.range.to
      if (isSame) return prev
      // Faqat range/query haqiqatan o'zgarganda (harf kiritilganda/o'chirilganda)
      // indeksni 0 ga qaytaramiz. ProseMirror'ning bekorga qayta-update
      // qilishi (query bir xil) tanlangan indeksni buzmasligi kerak.
      rangeChanged = true
      return state
    })
    if (rangeChanged) {
      setSelectedIndex(0)
    }

    requestAnimationFrame(() => {
      const selection = window.getSelection()
      if (!selection?.rangeCount) return
      const rect = selection.getRangeAt(0).getBoundingClientRect()
      const editorRect = editorRef.current?.getBoundingClientRect()
      if (!editorRect) return
      const newTop = rect.bottom - editorRect.top + 8
      const newLeft = Math.min(rect.left - editorRect.left, editorRect.width - 280)
      setMenuPos((prev) =>
        prev.top === newTop && prev.left === newLeft
          ? prev
          : { top: newTop, left: newLeft }
      )
    })
  }

  slashCloseRef.current = () => {
    setSlashState((prev) => (prev.active ? { ...prev, active: false } : prev))
  }

  const filteredItems = useMemo(() => {
    if (!slashState.active) return []
    if (!slashState.query) return SLASH_ITEMS
    const q = slashState.query.toLowerCase()
    return SLASH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    )
  }, [slashState.active, slashState.query])

  slashItemsRef.current = filteredItems

  const extensions = useRef([
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      codeBlock: { HTMLAttributes: { class: "inkly-code-block" } },
    }),
    Placeholder.configure({
      placeholder: ({ node }) =>
        node.type.name === "heading"
          ? "Sarlavha..."
          : (placeholder ?? "Yozing yoki '/' bosing buyruqlar uchun..."),
      emptyEditorClass: "is-editor-empty",
      emptyNodeClass: "is-node-empty",
    }),
    LinkExt.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: {
        class: "inkly-link",
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      },
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: { class: "inkly-image" },
    }),
    VideoNode,
    createSlashDetectExtension(slashUpdateRef, slashCloseRef),
  ]).current

  const uploadImage = useCallback(
    async (file: File) => {
      if (!token) { toast.error("Rasm yuklash uchun tizimga kiring."); return }
      if (!file.type.startsWith("image/")) return
      if (file.size > 5 * 1024 * 1024) { toast.error("Rasm hajmi 5MB dan oshmasligi kerak."); return }
      setUploadingImage(true)
      try {
        const upload = await uploadsApi.postImage(token, file)
        requestAnimationFrame(() => {
          editorInstanceRef.current?.chain().focus().setImage({ src: upload.url }).run()
          requestAnimationFrame(() => setUploadingImage(false))
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Rasmni yuklashda xatolik yuz berdi.")
        setUploadingImage(false)
      }
    },
    [token]
  )

  const executeSlashCommand = useCallback(
    (item: SlashItem) => {
      const editor = editorInstanceRef.current
      if (!editor) return
      const range = slashRangeRef.current
      editor.chain().focus().deleteRange(range).run()
      requestAnimationFrame(() => {
        slashCloseRef.current()
        if (item.id === "image") { fileInputRef.current?.click(); return }
        if (item.id === "video") { setShowVideoInput(true); return }
        item.command(editor)
      })
    },
    []
  )

  executeSlashRef.current = executeSlashCommand

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content,
    editorProps: {
      attributes: { class: "inkly-editor-content" },

      handlePaste(_view, event) {
        const items = Array.from(event.clipboardData?.items ?? [])
        const imageItem = items.find((i) => i.type.startsWith("image/"))
        if (!imageItem) return false
        const file = imageItem.getAsFile()
        if (!file) return false
        uploadImage(file)
        return true
      },

      handleDrop(_view, event) {
        const files = Array.from(event.dataTransfer?.files ?? [])
        const image = files.find((f) => f.type.startsWith("image/"))
        if (!image) return false
        uploadImage(image)
        return true
      },
    },
  })

  useEffect(() => {
    editorInstanceRef.current = editor
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const onFocus = () => setIsEditorFocused(true)
    const onBlur = () => setIsEditorFocused(false)
    editor.on("focus", onFocus)
    editor.on("blur", onBlur)
    return () => {
      editor.off("focus", onFocus)
      editor.off("blur", onBlur)
    }
  }, [editor])

  /* -------------------------------------------------------
     Slash-menyu klaviatura navigatsiyasi — window/capture.
     bosilganda holatni konsolga chiqaramiz, shu jumladan
     "return" bilan chiqib ketilgan hollarda ham — shunda
     aynan qaysi shartda to'xtab qolayotgani ko'rinadi.
  ------------------------------------------------------- */

  useEffect(() => {
    if (!editor) return

    const handler = (event: KeyboardEvent) => {
      if (!slashActiveRef.current) {
        return
      }
      if (!editor.isFocused) {
        return
      }

      const items = slashItemsRef.current
      if (items.length === 0) {
        return
      }

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault()
          event.stopPropagation()
          setSelectedIndex((i) => (i + 1) % items.length)
          break
        }
        case "ArrowUp": {
          event.preventDefault()
          event.stopPropagation()
          setSelectedIndex((i) => (i - 1 + items.length) % items.length)
          break
        }
        case "Enter":
        case "Tab": {
          event.preventDefault()
          event.stopPropagation()
          executeSlashRef.current(items[slashIndexRef.current])
          break
        }
        case "Escape": {
          event.preventDefault()
          event.stopPropagation()
          slashCloseRef.current()
          break
        }
        default:
          break
      }
    }

    window.addEventListener("keydown", handler, true)
    return () => window.removeEventListener("keydown", handler, true)
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const handler = () => {
      isInternalUpdate.current = true
      onChangeRef.current(editor.getHTML())
      requestAnimationFrame(() => { isInternalUpdate.current = false })
    }
    editor.on("update", handler)
    return () => { editor.off("update", handler) }
  }, [editor])

  useEffect(() => {
    if (!editor || isInternalUpdate.current) return
    const currentHTML = editor.getHTML()
    if (!content && currentHTML !== "<p></p>") {
      editor.commands.clearContent(false)
    } else if (content && content !== currentHTML) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as globalThis.Node)
      ) {
        slashCloseRef.current()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const insertVideo = useCallback((url: string) => {
    const editor = editorInstanceRef.current
    if (!editor) return
    const { embedUrl, provider } = parseVideoUrl(url)
    if (!embedUrl) {
      toast.error("Faqat YouTube va Vimeo havolalari qo'llab-quvvatlanadi.")
      return
    }
    editor
      .chain()
      .focus()
      .insertContent({ type: "inklyVideo", attrs: { src: embedUrl, provider } })
      .run()
    setShowVideoInput(false)
  }, [])

  const applyLink = useCallback((url: string) => {
    const editor = editorInstanceRef.current
    if (!editor) return
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
    setShowLinkPopover(false)
  }, [])

  const currentLinkUrl = editor?.isActive("link")
    ? (editor.getAttributes("link").href ?? "")
    : ""

  if (!editor) {
    return (
      <div className="inkly-editor-loading">
        <LoadingDots size="lg" />
      </div>
    )
  }

  return (
    <div ref={editorRef} className="inkly-novel-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (file) uploadImage(file)
        }}
      />

      {uploadingImage && (
        <div className="inkly-upload-toast">
          <LoadingDots size="md" />
          <span>Rasm yuklanmoqda...</span>
        </div>
      )}

      {showVideoInput && (
        <div
          className="inkly-video-overlay"
          style={
            isMobile
              ? {
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: keyboardInset,
                }
              : undefined
          }
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowVideoInput(false)
          }}
        >
          <VideoInputPopover
            onInsert={insertVideo}
            onClose={() => setShowVideoInput(false)}
          />
        </div>
      )}

      {!isMobile && (
        <FloatingToolbar
          editor={editor}
          showLinkPopover={showLinkPopover}
          setShowLinkPopover={setShowLinkPopover}
          currentLinkUrl={currentLinkUrl}
          applyLink={applyLink}
        />
      )}

      {!isMobile && slashState.active && filteredItems.length > 0 && (
        <div
          ref={menuRef}
          style={{ top: menuPos.top, left: menuPos.left }}
          className="inkly-slash-wrapper"
        >
          <SlashCommandMenu
            items={filteredItems}
            selectedIndex={selectedIndex}
            onSelect={executeSlashCommand}
          />
        </div>
      )}

      {isMobile && slashState.active && filteredItems.length > 0 && (
        <MobileSlashSheet
          items={filteredItems}
          selectedIndex={selectedIndex}
          bottom={keyboardInset}
          onSelect={executeSlashCommand}
        />
      )}

      {isMobile &&
        !showVideoInput &&
        !slashState.active &&
        (isEditorFocused || showLinkPopover) && (
          <MobileFormatBar
            editor={editor}
            bottom={keyboardInset}
            showLinkPopover={showLinkPopover}
            setShowLinkPopover={setShowLinkPopover}
            currentLinkUrl={currentLinkUrl}
            applyLink={applyLink}
            onImage={() => fileInputRef.current?.click()}
            onVideo={() => setShowVideoInput(true)}
          />
        )}

      <EditorContent editor={editor} />
    </div>
  )
}

/* =========================================================
   Export
========================================================= */

export function InklyEditorNovel(props: InklyEditorProps) {
  return (
    <EditorErrorBoundary>
      <_InklyEditorInner {...props} />
    </EditorErrorBoundary>
  )
}