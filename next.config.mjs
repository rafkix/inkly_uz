/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    // Local backend (localhost:8000) dan rasmlar yuklanadi — faqat dev muhitida.
    // Production'da NEXT_PUBLIC_MEDIA_CDN_URL https CDN URL ga o'rnatiladi,
    // shuning uchun bu flag production build'da false bo'ladi.
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      // Production CDN — SSRF xavfini kamaytirish uchun production'da
      // "**" o'rniga aniq hostname ishlatilsin: hostname: "cdn.inkly.uz"
      {
        protocol: "https",
        hostname: "**",
      },
      // Local development backend
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return [
      // /@username → /username (ichki rewrite, URL o'zgarmaydi)
      {
        source: "/@:username",
        destination: "/:username",
      },
      // /@username/slug → /username/slug
      {
        source: "/@:username/:slug",
        destination: "/:username/:slug",
      },
    ]
  },
  async headers() {
    return [
      // Statik ikonkalarni brauzer keshida uzoqroq saqlash — har bir
      // navigatsiyada qayta so'ralib, dev konsolini shovqin bilan
      // to'ldirmasligi uchun (production'da eng katta foyda beradi).
      {
        source: "/icon.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/icon-light-32x32.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/icon-dark-32x32.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/apple-icon.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
    ]
  },
}
export default nextConfig
