/**
 * Teletype'dan keladigan <document> formatidagi XML/HTML ni
 * bizning TipTap va tizimimiz tushunadigan standart HTML formatiga o'zgartiradi.
 * XSS himoya uchun DOMPurify bilan sanitizatsiya qilinadi.
 */
import DOMPurify from "isomorphic-dompurify"
import { getMediaUrl } from "@/lib/api/client"

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "code", "pre", "blockquote",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a", "img", "figure", "figcaption",
  "div", "span",
  "hr", "b", "i",
]

const ALLOWED_ATTR = [
  "href", "src", "alt", "title", "class", "id",
  "target", "rel",
]

export function parseTeletypeToHtml(text: string): string {
  if (!text) return ""

  let html = text

  // 1. <document> tagini tozalash
  html = html.replace(/<document>/g, '<div class="teletype-content">')
  html = html.replace(/<\/document>/g, '</div>')

  // 2. <image src="..."><caption>...</caption></image> ni <figure><img><figcaption></figure> ga o'tkazish
  html = html.replace(/<image([^>]*)>([\s\S]*?)<\/image>/g, (_match, attrs, content) => {
    const srcMatch = attrs.match(/src="([^"]+)"/)
    const src = srcMatch ? srcMatch[1] : ""

    let captionText = ""
    const captionMatch = content.match(/<caption>([\s\S]*?)<\/caption>/)
    if (captionMatch && captionMatch[1].trim()) {
      captionText = `<figcaption>${captionMatch[1].trim()}</figcaption>`
    }

    return `<figure><img src="${src}" alt="Image" />${captionText}</figure>`
  })

  // 3. <pre> ni <pre><code> formatiga o'tkazish
  html = html.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/g, (match, attrs, content) => {
    if (content.includes("<code")) {
      return match
    }
    return `<pre${attrs}><code>${content}</code></pre>`
  })

  // 4. Anchor attributlarini tozalash
  html = html.replace(/\sanchor="[^"]+"/g, '')

  // 5. XSS himoya: DOMPurify bilan sanitizatsiya
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  })

  // Uploaded media is stored as a relative path. Resolve image sources only
  // after sanitization so user-controlled markup never bypasses DOMPurify.
  return sanitized.replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi, (_match, prefix, src, suffix) => {
    return `${prefix}${getMediaUrl(src) ?? src}${suffix}`
  })
}
