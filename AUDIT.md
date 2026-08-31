# Inkly Frontend — Dizayn va API Audit

Loyihaning to'liq kod bazasi ko'rib chiqildi (`app/`, `components/`, `lib/api/`). Quyida aniq fayl/son ko'rsatkichlari bilan tasdiqlangan topilmalar va tavsiyalar keltirilgan — bu taxmin emas, kod bo'ylab qidiruv natijalari.

---

## 1. DIZAYN — muvofiqlik muammolari

### 1.1 Ikki xil rang tizimi parallel ishlatilmoqda
`app/globals.css`da ikkita mustaqil token to'plami bor:
- Inkly brend tokenlari: `--color-inkly-orange`, `--color-text-primary`, `--color-border-default` va h.k.
- shadcn semantik tokenlari: `--primary`, `--foreground`, `--border`, `--destructive` va h.k. (deyarli bir xil qiymatlarga map qilingan)

Natijada komponentlar tasodifiy ravishda ikkalasidan birini tanlaydi:
- `border-border-default` — **118** joyda
- `border-border` — **59** joyda
- **24 ta fayl** dizayn tokenlarini butunlay chetlab o'tib, xom hex ranglar ishlatadi (`components/auth/auth-methods.tsx`, `components/editor/publish-modal.tsx`, `components/settings/appearance-*.tsx`, `app/(marketing)/creators/page.tsx` va h.k.)

**Tavsiya:** ikkita tizimdan bittasini tanlab, ikkinchisini olib tashlash (yoki bittasini ikkinchisiga alias qilish), so'ng xom hex ranglarni token klasslariga almashtirish.

### 1.2 Border-radius — 8 ta turli shkala
`rounded-full` (129), `rounded-lg` (79), `rounded-xl` (70), `rounded-2xl` (47), `rounded-md` (27), `rounded-control` (22), `rounded-panel` (19), `rounded-card` (4), `rounded-3xl` (4), `rounded-4xl` (1) — bir xil vazifadagi elementlar (kartalar, tugmalar, modal) turlicha radius bilan chizilgan. Masalan `AuthShell` `rounded-panel` ishlatadi, lekin `dashboard/telegram/*` sahifalari xuddi shunday kartalar uchun `rounded-2xl` ishlatadi.

**Tavsiya:** 3 ta shkalaga tushirish — `rounded-control` (tugma/input), `rounded-card` (kichik kartalar), `rounded-panel` (sahifa darajasidagi konteynerlar).

### 1.3 Tugmalar: markaziy `<Button>` komponenti yarim ishlatilmoqda
Loyihada to'liq ishlaydigan `components/ui/button.tsx` bor (variant, loading, disabled, focus-ring holatlari bilan) — lekin:
- `<Button>` — **17** joyda ishlatilgan
- xom `<button>` — **40** joyda, ko'pi inline `style={{}}` va qo'lda yozilgan `onMouseEnter`/`onMouseLeave` hover effektlari bilan (`auth-methods.tsx`da 4 ta shunday hover handler)

Bu holatlarda fokus-ring, disabled uslub, loading spinner har safar qo'lda qayta yoziladi — ba'zilarida esa umuman yo'q (accessibility bo'shlig'i).

**Tavsiya:** barcha CTA/action tugmalarni `<Button>`ga o'tkazish, ayniqsa auth oqimidagi Google/Telegram tugmalari (hozir butunlay inline style bilan yozilgan, ilovaning qolgan qismidan vizual uslubi farq qiladi).

### 1.4 Loading/Empty/Error holatlar uchun umumiy komponent deyarli ishlatilmayapti
`components/ui/route-states.tsx`da tayyor `<LoadingState>`, `<EmptyState>`, `<ErrorState>` bor — lekin faqat **6** joyda ishlatilgan. Boshqa joylarda:
- **7** ta fayl o'z ichida qo'lda `animate-spin` spinner chizadi
- **26** ta fayl `<LoadingDots>`ni to'g'ridan-to'g'ri, har xil markup bilan joylaydi

Natijada bir xil "yuklanmoqda" holati sahifadan sahifaga boshqacha ko'rinadi (masalan `telegram/verify/page.tsx`dagi qo'lda yozilgan `RefreshCw`+spin bilan `route-states.tsx`dagi standart holat farqlanadi).

**Tavsiya:** yangi sahifalarda va imkon qadar eskilarida ham `route-states.tsx`dagi umumiy komponentlarni ishlatish.

### 1.5 Mobil moslashuvchanlik notekis
Responsive prefikslar (`sm:`/`md:`/`lg:`/`xl:`) taqsimoti: `sm` — 143, `lg` — 76, `md` — 36, `xl` — 9. Bu o'zi muammo emas, lekin ayrim yirik sahifalarda (`dashboard`, `settings/appearance-*`) `md:`/`lg:` breakpointlar deyarli ishlatilmagan — ya'ni bu sahifalar planshet o'lchamida sinovdan o'tmagan bo'lishi mumkin.

---

## 2. API QATLAMI — ko'rib chiqish

### 2.1 Kuchli tomonlar (o'zgartirish shart emas)
- `lib/api/client.ts` — markazlashtirilgan `apiRequest()`, avtomatik 401 → refresh-token → qayta urinish oqimi to'g'ri yozilgan (race-condition oldini oluvchi `refreshPromise` bilan).
- Access token faqat `sessionStorage`da (localStorage emas — to'g'ri tanlov), refresh token httpOnly cookie orqali — bu yaxshi xavfsizlik amaliyoti. Kodda buni yanada kuchaytirish (access tokenni ham to'liq httpOnly cookie'ga o'tkazish) haqida TODO izoh bor.
- `zod` orqali javoblarni runtime validatsiya qilish (`schemas.ts`, 319 qator) — backend kontraktidan chetlanishni erta ushlaydi.
- Xatoliklarni bitta joyda (`extractError`) backend formatiga moslab normalizatsiya qilish — yaxshi.

### 2.2 Ishlatilmayotgan infratuzilma
`lib/api/use-safe-api.ts` — to'liq yozilgan, JSDoc misoli bilan hujjatlashtirilgan React hook (`useSafeApi`) — lekin butun loyihada **birorta ham** komponent uni chaqirmaydi. Buning o'rniga har bir sahifa (**23 ta fayl**) o'zining qo'lda `useState`+`try/catch`+`useEffect` kombinatsiyasini yozgan (masalan `telegram/verify/page.tsx`, yangi yaratilgan callback sahifalari va boshqalar — hammasi bir xil naqshni qayta-qayta takrorlaydi).

**Tavsiya:** yoki (a) `useSafeApi`ni asosiy fetch-hook sifatida qabul qilib, sahifalarni bosqichma-bosqich shunga o'tkazish (loading/error holatlar avtomatik bir xil bo'ladi), yoki (b) agar ishlatilmasa — o'lik kodni olib tashlash.

### 2.3 "Safe wrapper" qamrovi to'liq emas
`createSafeItemWrapper`/`createSafePageWrapper` faqat 9 ta API modulida (`admin`, `auth`, `categories`, `follows`, `notifications`, `posts`, `public`, `telegram`, `users`) eksport qilingan; `creators.ts`, `uploads.ts`, `follows.ts`dagi ba'zi metodlar, `theme.ts` bunday wrapperga ega emas — komponentlar bu yerda xatoni har doim qo'lda ushlashi kerak.

### 2.4 Telegram bot callback route yo'q edi (tuzatildi)
`lib/api/auth.ts`da `telegramBotCallback(token)` funksiyasi tayyor edi va backend `GET /auth/telegram/bot/callback?token=...`ga aynan shu route orqali qaytarayotgan edi, lekin frontendda `app/auth/telegram/bot/callback/page.tsx` sahifasi mavjud emas edi — bot orqali kirish oqimi haqiqatda ishlamas edi. **Bu sahifa shu suhbatda yaratildi** (quyida ilova qilingan zipda).

---

## 3. Ustuvorlik bo'yicha tartib (nima bilan boshlash tavsiya etiladi)

1. **Auth oqimi UI** (`auth-methods.tsx`, `telegram-login-widget.tsx`) — inline style'larni Tailwind token klasslariga, xom `<button>`larni `<Button>`ga o'tkazish. Eng ko'p ko'rinadigan va eng ko'p nomuvofiq joy.
2. Ikkita rang tizimidan bittasini tanlash va qolganini bosqichma-bosqich almashtirish.
3. `route-states.tsx`ni standart qilib, yangi/eski sahifalarda joriy qilish.
4. `useSafeApi` bo'yicha qaror qabul qilish (qabul qilish yoki o'chirish).
5. Border-radius shkalasini 3 ta qiymatga tushirish.

---

*Eslatma: bu audit statik kod ko'rib chiqishga asoslangan (loyihada `node_modules` yo'q edi, shuning uchun `next build`/vizual render orqali tekshirilmadi). Runtime/vizual tasdiqlash uchun loyihani `pnpm install && pnpm dev` bilan ishga tushirib ko'rish tavsiya etiladi.*

---

## 4. Cleanup execution — 2026-08-31

### SAFE TO DELETE (completed)
- `lib/api/use-safe-api.ts` — deleted. Repository-wide search found no production, route, test, config, or package reference; the only matches were its own JSDoc and a note in `safe-wrapper.ts`.
- `response.txt` — deleted. Generated HTML response artifact; no application, route, config, test, or deployment reference was found.

### HUMAN REVIEW / KEEP
- `public/demo/cover-*.png`, `public/header.png` — retained because runtime string references exist.
- `lib/api/*`, auth, route, config, lockfile, and framework files — retained; no safe deletion proof.
- `AUDIT.md`, `README.md`, `CLAUDE.md` — retained as project documentation.

### Baseline health
- `npm run lint` failed before cleanup because ESLint 10 could not find `eslint.config.*`.
- `npm run build` compiled, then failed TypeScript checks in `app/(app)/dashboard/settings/profile/page.tsx` for `SocialLinks.linkedin` and `linkedin_username`.

### Post-cleanup expectations
- No dependency, lockfile, API, UI, or business-logic changes were made.
- Re-run repository reference scans, lint, build, and Git statistics after deletion; pre-existing lint/build failures should remain documented rather than silently changed.
