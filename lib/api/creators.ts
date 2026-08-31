// ESLATMA: Backend /creators endpointi mavjud emas.
// Bu fayl faqat type compatibility uchun saqlanadi.
// Ijodkorlar ro'yxati /posts endpointi orqali olinadi — lib/api/posts.ts ga qarang.

import type { CreatorPublicResponse, Page } from "@/types/api"

// Stub — hech qayerda to'g'ridan-to'g'ri chaqirilmaydi
export const creatorsApi = {
  list: (_params?: object): Promise<Page<CreatorPublicResponse>> => {
    return Promise.resolve({ items: [], total: 0, page: 1, page_size: 12, total_pages: 0 })
  },
}

export async function listCreatorsSafe(): Promise<Page<CreatorPublicResponse>> {
  return { items: [], total: 0, page: 1, page_size: 12, total_pages: 0 }
}
