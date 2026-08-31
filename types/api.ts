// ─── Umumiy ───────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
}

export interface ApiErrorDetail {
  code: string
  message: string
  details?: Record<string, unknown> | null
}

export interface ApiError {
  success: false
  error: ApiErrorDetail
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface Page<T> {
  items: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

// ─── Enumlar ──────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin"
export type UserStatus = "active" | "blocked"
export type PostStatus = "draft" | "published" | "archived"
export type PostVisibility = "public" | "hidden" | "private"
export type PostReactionType = "like" | "dislike"
export type TelegramPublicationStatus = "pending" | "published" | "failed" | "cancelled"
export type UploadType = "avatar" | "cover" | "post_image" | "temp"

// ─── Auth ─────────────────────────────────────────────────────────────────

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: "bearer"
  expires_in: number
}

export interface SessionOut {
  id: string
  device_name: string | null
  ip_address: string | null
  auth_method: string | null
  created_at: string
  last_seen_at: string | null
  expires_at: string
  is_active: boolean
  is_current: boolean
}

// ─── User ─────────────────────────────────────────────────────────────────

export interface SocialLinks {
  telegram: string | null
  instagram: string | null
  youtube: string | null
  github: string | null
  twitter: string | null
}

export interface UserBase {
  full_name: string
  username: string
  slug: string
  bio: string | null
  avatar: string | null
  cover: string | null
  website: string | null
  location: string | null
  socials: SocialLinks
  is_verified: boolean
}

export interface UserPublicResponse extends UserBase {
  posts_count?: number
  followers_count?: number
  following_count?: number
  is_following?: boolean
  created_at?: string
}

/** Legacy UI shape retained for the unsupported creators stub. */
export interface CreatorPublicResponse {
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  is_verified: boolean
}

export interface LinkedProvider {
  provider: "google" | "telegram"
  provider_email: string | null
  connected_at: string
}

export interface UserMeResponse extends UserBase {
  id?: number  // Backend DB primary key (exposed by backend, used internally)
  // Use uuid as the stable public identifier everywhere.
  uuid: string
  email: string | null
  email_verified?: boolean
  role: UserRole
  status: UserStatus
  posts_count: number
  followers_count: number
  following_count: number
  created_at: string
  updated_at: string
  linked_providers: LinkedProvider[]
  telegram_username?: string | null
  instagram_username?: string | null
  youtube_username?: string | null
  github_username?: string | null
  twitter_username?: string | null
}

// ─── Profile theme (Ko'rinish sozlamalari) ─────────────────────────────────

export type ThemeHeaderLayout = "classic" | "hero" | "banner" | "cutout" | "shape"
export type ThemeHeaderShape = "loop" | "flower" | "oval" | "rounded" | "burst"
export type ThemeWallpaperStyle = "fill" | "gradient" | "blur" | "pattern" | "image" | "video"
export type ThemeWallpaperEffect = "none" | "mono" | "blur" | "halftone" | "tint" | "noise"
export type ThemeButtonStyle = "solid" | "glass" | "outline"
export type ThemeButtonCorner = "square" | "round" | "rounder" | "full"
export type ThemeButtonShadow = "none" | "soft" | "strong" | "hard"
export type ThemeTitleStyle = "text" | "logo"
export type ThemeMode = "custom" | "curated"

// UI'da radiusni piksellarga aylantirish uchun (preview/render qatlamida ishlatiladi)
export const BUTTON_CORNER_RADIUS: Record<ThemeButtonCorner, number> = {
  square: 4,
  round: 10,
  rounder: 18,
  full: 9999,
}

export const BUTTON_SHADOW_CSS: Record<ThemeButtonShadow, string> = {
  none: "none",
  soft: "0 2px 8px rgba(0,0,0,0.08)",
  strong: "0 6px 16px rgba(0,0,0,0.18)",
  hard: "3px 3px 0 rgba(0,0,0,0.9)",
}

// Kuratsiya qilingan tayyor temalar — "Curated" tabida ko'rsatiladi.
// `pro` — Pro obunasiz tanlab bo'lmaydi (UI'da lightning-badge bilan qulflangan).
export interface CuratedThemePreset {
  id: string
  label: string
  pro: boolean
  preview_color: string
}

export const CURATED_THEME_PRESETS: CuratedThemePreset[] = [
  { id: "agate", label: "Agate", pro: false, preview_color: "#2E2A26" },
  { id: "air", label: "Air", pro: true, preview_color: "#EAF2FF" },
  { id: "astrid", label: "Astrid", pro: true, preview_color: "#F5E6D3" },
  { id: "aura", label: "Aura", pro: true, preview_color: "#7C5CFC" },
  { id: "bliss", label: "Bliss", pro: false, preview_color: "#FFE1EC" },
  { id: "blocks", label: "Blocks", pro: true, preview_color: "#171412" },
  { id: "bloom", label: "Bloom", pro: true, preview_color: "#FF8FB1" },
  { id: "breeze", label: "Breeze", pro: true, preview_color: "#BEE7E8" },
  { id: "encore", label: "Encore", pro: false, preview_color: "#111111" },
  { id: "grid", label: "Grid", pro: true, preview_color: "#F2F2F2" },
  { id: "groove", label: "Groove", pro: true, preview_color: "#D9A441" },
  { id: "haven", label: "Haven", pro: false, preview_color: "#DDE5DA" },
  { id: "lake", label: "Lake", pro: false, preview_color: "#3A5D65" },
  { id: "mineral", label: "Mineral", pro: true, preview_color: "#8A8D91" },
  { id: "nourish", label: "Nourish", pro: false, preview_color: "#E8DCC8" },
  { id: "rise", label: "Rise", pro: true, preview_color: "#FF6A00" },
  { id: "sweat", label: "Sweat", pro: true, preview_color: "#101820" },
  { id: "tress", label: "Tress", pro: false, preview_color: "#4C3B2E" },
  { id: "twilight", label: "Twilight", pro: true, preview_color: "#2B2A5C" },
  { id: "vox", label: "Vox", pro: false, preview_color: "#FFD400" },
]

export interface ProfileThemeResponse {
  // Theme (yuqori daraja)
  theme_mode: ThemeMode
  theme_preset: string | null // CURATED_THEME_PRESETS[].id, faqat theme_mode === "curated" bo'lsa

  // Header
  header_layout: ThemeHeaderLayout
  header_shape: ThemeHeaderShape | null // faqat header_layout === "shape" bo'lsa ishlatiladi
  banner_image: string | null // faqat header_layout === "banner" bo'lsa ishlatiladi (relative path)
  title_style: ThemeTitleStyle
  alternative_title_font: boolean
  title_font: string | null // alternative_title_font === true bo'lsagina ishlatiladi

  // Wallpaper
  wallpaper_style: ThemeWallpaperStyle
  wallpaper_color: string
  wallpaper_pattern: string | null
  wallpaper_image: string | null
  wallpaper_effect: ThemeWallpaperEffect

  // Buttons
  button_style: ThemeButtonStyle
  button_corner: ThemeButtonCorner
  button_shadow: ThemeButtonShadow
  button_color: string
  button_text_color: string

  // Text
  page_font: string
  page_text_color: string
  title_color: string

  updated_at: string
}

// Har bir panel faqat o'zgargan bo'limni yuboradi (PATCH semantics — usersApi.updateMe bilan bir xil)
export type ProfileThemeUpdate = Partial<Omit<ProfileThemeResponse, "updated_at">>

export const DEFAULT_PROFILE_THEME: ProfileThemeUpdate = {
  theme_mode: "custom",
  theme_preset: null,
  header_layout: "classic",
  header_shape: null,
  banner_image: null,
  title_style: "text",
  alternative_title_font: false,
  title_font: null,
  wallpaper_style: "fill",
  wallpaper_color: "#FF6A00",
  wallpaper_pattern: null,
  wallpaper_image: null,
  wallpaper_effect: "none",
  button_style: "outline",
  button_corner: "rounder",
  button_shadow: "none",
  button_color: "#FFFFFF",
  button_text_color: "#171412",
  page_font: "Link Sans",
  page_text_color: "#171412",
  title_color: "#171412",
}

// ─── Post ─────────────────────────────────────────────────────────────────

export interface PostAuthor {
  username: string
  slug: string
  full_name: string
  avatar: string | null
  is_verified: boolean
}

export interface PostCategory {
  uuid: string
  name: string
  slug: string
  icon: string | null
}

export interface SharingImage {
  id: string
  format: string
  size: number
  type: string
  url: string
}

export interface PostResponse {
  allow_reposts: boolean
  uuid: string
  slug: string
  url?: string
  title: string
  excerpt: string | null
  content: string
  cover: string | null
  status: PostStatus
  visibility: PostVisibility
  published_at: string | null
  created_at: string
  updated_at: string
  author: PostAuthor
  likes_count: number
  dislikes_count: number
  comments_count: number
  views_count: number
  reacted: PostReactionType | null
  categories: PostCategory[]
  sharing_image: SharingImage | null
  is_pinned: boolean
  allow_comments: boolean
  allow_reactions: boolean
  seo_indexable: boolean
  scheduled_at: string | null
}

export interface PostListItem {
  // reading_time is NOT returned by backend — computed client-side via readingTimeFromPost()
  reading_time?: number | null
  uuid: string
  slug: string
  title: string
  excerpt: string | null
  cover: string | null
  status: PostStatus
  visibility: PostVisibility
  published_at: string | null
  created_at: string
  updated_at: string
  author: PostAuthor
  likes_count: number
  dislikes_count: number
  comments_count: number
  views_count: number
  categories: PostCategory[]
  is_pinned: boolean
  allow_comments: boolean
  allow_reactions: boolean
  scheduled_at: string | null
}

export interface PostReactionResponse {
  reacted: PostReactionType | null
  likes_count: number
  dislikes_count: number
}

export interface CommentResponse {
  uuid: string
  content: string
  created_at: string
  updated_at: string
  author: PostAuthor
}

export interface PostStatsResponse {
  uuid: string
  slug: string
  title: string
  status: PostStatus
  visibility: PostVisibility
  published_at: string | null
  created_at: string
  updated_at: string
  likes_count: number
  dislikes_count: number
  comments_count: number
  views_count: number
}

// ─── Category ─────────────────────────────────────────────────────────────

export interface CategoryPublicResponse {
  uuid: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  posts_count: number   // backend "posts_count" (singular emas, plural)
}

// ─── Upload ───────────────────────────────────────────────────────────────

/**
 * Backend upload endpointlari faqat path string qaytaradi (Swagger: "string").
 * uploads.ts ichidagi uploadRaw() uni UploadResult formatiga wrap qiladi.
 *
 * ISHLATISH:
 *   const upload = await uploadsApi.cover(token, file)
 *   post.cover  = upload.path  // DB'ga saqlanadi
 *   <img src={upload.url} />   // ko'rsatish uchun
 */
export interface UploadResult {
  path: string   // relative path: "covers/abc.webp"  → DB'ga shu saqlanadi
  url: string    // to'liq URL: "https://cdn.../covers/abc.webp" → <img src>
}

/**
 * @deprecated UploadResult ishlatilsin.
 * Eski kod bilan muvofiqlik uchun alias saqlanmoqda.
 */
export type UploadResponse = UploadResult