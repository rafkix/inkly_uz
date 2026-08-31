import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const step1Schema = z.object({
  username: z
    .string()
    .min(3, "Kamida 3 ta belgi")
    .max(60, "60 ta belgidan oshmasin")
    .regex(/^[a-zA-Z0-9_]+$/, "Faqat harf, raqam va _"),
})

export const step2Schema = z.object({
  full_name: z.string().min(2, "Kamida 2 ta belgi").max(80, "80 ta belgidan oshmasin"),
})

export const step3Schema = z.object({
  email: z.string().email("Yaroqli email kiriting"),
  password: z
    .string()
    .min(8, "Kamida 8 ta belgi")
    .max(128, "Parol juda uzun"),
})

export const loginSchema = z.object({
  login: z
    .string()
    .min(1, "Email yoki foydalanuvchi nomini kiriting")
    .max(120, "Juda uzun"),
  password: z.string().min(1, "Parolni kiriting"),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type LoginData = z.infer<typeof loginSchema>

// ─────────────────────────────────────────────────────────────────────────────
// QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export const QUOTES = [
  {
    text: "Inkly mening yozish tarzimni butunlay o'zgartirdi. Endi har bir fikrim tartibli va ilhomli.",
    author: "Nilufar Rashidova",
    role: "Muallif · 340 ta maqola",
  },
  {
    text: "Oddiy blogerdan professional muallifga o'tish uchun menga aynan Inkly kerak edi.",
    author: "Jasur Toshmatov",
    role: "Texnologiya bloggeri",
  },
  {
    text: "Inklyda yozish — qog'ozga yozganday hissiyot, lekin dunyo bilan ulashish imkoniyati bilan.",
    author: "Zulfiya Mirzayeva",
    role: "Ijodkor yozuvchi",
  },
] as const

export const FEATURES = [
  {
    iconPath: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    text: "Qulay muharrir bilan yozish",
  },
  {
    iconPath: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z",
    text: "Dunyo bilan ulashish imkoni",
  },
  {
    iconPath: "M18 20V10M12 20V4M6 20v-6",
    text: "O'quvchilar tahlili va statistika",
  },
] as const

export const STATS = [
  { value: "12 000+", label: "Faol muallif" },
  { value: "340K+",   label: "O'quvchi" },
  { value: "98%",     label: "Mamnunlik" },
] as const

export const OTP_LENGTH = 6
export const RESEND_COUNTDOWN = 60