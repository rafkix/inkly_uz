/**
 * ── Sayt konfiguratsiyasi ─────────────────────────────────────────
 *
 * SHOW_ANNOUNCEMENT  → true: navbar markazi da e'lon ko'rsatiladi
 *                      false: oddiy nav linklari ko'rsatiladi
 *
 * COMING_SOON        → true: barcha ichki sahifalar "Tez kunda" sahifasini ko'rsatadi
 *                      false: sahifalar odatdagidek ishlaydi
 */
export const siteConfig = {
  SHOW_ANNOUNCEMENT: false,
  COMING_SOON: false,
} as const
