/**
 * uploads.ts — /api/v1/uploads/* endpointlari
 *
 * API HAQIQATI (API_TOLIQ_MALUMOTNOMA.md — Pydantic schema'lardan avtomatik
 * generatsiya qilingan, eng ishonchli manba):
 *   POST /uploads/avatar      → { id, uuid, path, url, type, mime_type, size, created_at }
 *   POST /uploads/cover       → shu kabi object
 *   POST /uploads/post-image  → shu kabi object
 *   POST /uploads/temp        → shu kabi object
 *
 * (Eski izoh bu yerda "OBJECT EMAS, string" deb yozilgan edi — bu noto'g'ri
 * ekan, aniq hujjat asosida tuzatildi. Quyidagi uploadRaw() funksiyasi baribir
 * bir nechta mumkin bo'lgan shakl — string, {data:string}, {data:{path,url}},
 * {path}, {url} — ni qamrab oladigan qilib yozilgan, shuning uchun haqiqiy
 * (object) javob bilan ham to'g'ri ishlaydi.)
 */

import { apiRequest, getMediaUrl, BASE_URL } from "./client"

// ─── Normalized upload result ─────────────────────────────────────────────────
// Backend faqat relative path string qaytaradi ("covers/abc.webp").
// Biz uni UI uchun qulay ob'ektga aylantiramiz.
export interface UploadResult {
  path: string   // relative path — DB'ga shu saqlanadi: post.cover = path
  url: string    // to'liq URL   — <img src={url}> uchun (getMediaUrl(path))
}

// ─── Raw file upload helper ───────────────────────────────────────────────────
async function uploadRaw(endpoint: string, file: File, token: string): Promise<UploadResult> {
  const form = new FormData()
  form.append("file", file)

  // apiRequest ni ishlatmaymiz — u JSON parse qiladi,
  // lekin bu endpoint plain string qaytaradi.
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    credentials: "include",
  })

  if (!res.ok) {
    const json = await res.json().catch(() => null)
    const detail =
      json && typeof json === "object" && "detail" in json
        ? String((json as Record<string, unknown>).detail)
        : `HTTP ${res.status}`
    throw new Error(detail)
  }

  // Backend { success: true, data: "covers/abc.webp" } yoki to'g'ridan "covers/abc.webp" qaytaradi
  const raw = await res.json().catch(() => null)

  // Debug: backend haqiqiy javobini ko'rish uchun (dev only)
  if (process.env.NODE_ENV !== "production") {
    console.log("[uploadRaw] raw response:", JSON.stringify(raw))
  }

  let path: string
  if (typeof raw === "string") {
    // To'g'ridan string: "covers/abc.webp"
    path = raw
  } else if (raw && typeof raw === "object") {
    const wrapped = raw as Record<string, unknown>

    // { success: true, data: "covers/abc.webp" }
    if (typeof wrapped.data === "string") {
      path = wrapped.data
    // { success: true, data: { path: "covers/abc.webp", url: "..." } }
    } else if (wrapped.data && typeof wrapped.data === "object") {
      const inner = wrapped.data as Record<string, unknown>
      if (typeof inner.path === "string") {
        path = inner.path
      } else if (typeof inner.url === "string") {
        path = inner.url
      } else {
        throw new Error(`Upload javobi noto'g'ri formatda: ${JSON.stringify(raw)}`)
      }
    // { path: "covers/abc.webp" }
    } else if (typeof wrapped.path === "string") {
      path = wrapped.path
    // { url: "covers/abc.webp" }
    } else if (typeof wrapped.url === "string") {
      path = wrapped.url
    } else {
      throw new Error(`Upload javobi noto'g'ri formatda: ${JSON.stringify(raw)}`)
    }
  } else {
    throw new Error("Upload javobi bo'sh yoki noto'g'ri")
  }

  return {
    path,
    url: getMediaUrl(path) ?? path,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const uploadsApi = {
  /**
   * Avatar yuklash.
   * → upload.path → PATCH /users/me da { avatar: upload.path }
   * → upload.url  → <img src> uchun
   */
  avatar: (token: string, file: File): Promise<UploadResult> =>
    uploadRaw("/uploads/avatar", file, token),

  /**
   * Cover (post muqovasi) yuklash.
   * → upload.path → post.cover ga saqlanadi
   * → upload.url  → preview uchun
   */
  cover: (token: string, file: File): Promise<UploadResult> =>
    uploadRaw("/uploads/cover", file, token),

  /**
   * Post ichidagi rasm yuklash (editor blok rasmlari).
   * → upload.url  → <img src> to'g'ridan
   */
  postImage: (token: string, file: File): Promise<UploadResult> =>
    uploadRaw("/uploads/post-image", file, token),

  /**
   * Vaqtinchalik fayl yuklash (keyinchalik boshqa endpointga bog'lanadi).
   */
  temp: (token: string, file: File): Promise<UploadResult> =>
    uploadRaw("/uploads/temp", file, token),

  /**
   * Yuklangan faylni o'chirish.
   * path — relative path: "avatars/x.webp" (upload.path dan olinadi)
   *
   * API: DELETE /api/v1/uploads?path=avatars/x.webp
   *      Body:  { "path": "avatars/x.webp" }
   */
  remove: (token: string, path: string): Promise<void> =>
    apiRequest<void>(`/uploads?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
      body: { path },
      token,
    }),
}