const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
]

/** "9 avgust 2026" */
export function formatDate(date: string): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getUTCDate()} ${UZ_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "3 kun oldin" */
export function timeAgo(date: string, now: Date = new Date()): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return "hozir"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} daqiqa oldin`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} kun oldin`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} oy oldin`
  return `${Math.floor(months / 12)} yil oldin`
}

/**
 * Markdown/HTML belgilarini olib tashlab, faqat o'qiladigan matnni qoldiradi.
 * Naiv `split(/\s+/)` kod bloklari, HTML teglar va markdown sintaksisini
 * ham so'z sifatida sanab, o'qish vaqtini noto'g'ri hisoblardi.
 */
function stripMarkupForWordCount(content: string): string {
  return content
    // fenced code bloklarini butunlay olib tashlaymiz (o'qilmaydi, faqat ko'riladi)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    // HTML teglar
    .replace(/<[^>]+>/g, " ")
    // markdown rasm/link sintaksisi: ![alt](url) va [text](url) — faqat matnni qoldiramiz
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // qolgan markdown belgilar: #, *, _, >, -, |
    .replace(/[#*_>|~]/g, " ")
    .replace(/^\s*[-+]\s+/gm, " ")
}

/** O'qish vaqti (taxminan) */
export function readingTime(content: string): string {
  const words = stripMarkupForWordCount(content).trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} daqiqa`
}

/** Raqamni qisqartirish: 1240 → "1.2k" */
export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/** Ism bo'yicha initsiallar: "Sardor Yo'ldoshev" → "SY" */
export function initials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/** Katta raqamlarni qisqacha ko'rsatish: 12400 → "12.4k", 2100000 → "2.1M" */
export function formatMetric(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

/**
 * PostListItem.reading_time field dan o'qish vaqti string qaytaradi.
 * Agar reading_time yo'q bo'lsa content bo'yicha hisoblaydi (fallback).
 */
export function readingTimeFromPost(
  readingTimeMinutes?: number | null,
  content?: string,
): string {
  if (readingTimeMinutes && readingTimeMinutes > 0) {
    return `${readingTimeMinutes} daqiqa`
  }
  if (content) return readingTime(content)
  return ""
}