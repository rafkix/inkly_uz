# Inkly — frontend loyihasini ishga tushirish

## ⚠️ Muhim: agar sahifa ochilsa-yu, dizayn/stil bo'lmasa

Bu deyarli har doim bitta sababdan: **`npm install` ishga tushirilmagan yoki
to'liq muvaffaqiyatli tugamagan**. Bu zip fayl `node_modules/` papkasini
o'z ichiga OLMAYDI (fayl hajmini kichik saqlash uchun) — uni birinchi marta
ochganingizda albatta o'zingiz o'rnatishingiz kerak.

## To'g'ri ishga tushirish tartibi

```bash
# 1. Node versiyasini tekshiring — 20 yoki undan yuqori bo'lishi SHART
#    (Next.js 16 va Tailwind CSS v4 buni talab qiladi)
node -v

# 2. Bog'liqliklarni o'rnating (bu qadamni HECH QACHON o'tkazib yubormang)
npm install

# 3. .env.local faylini tekshiring — backend manzili to'g'ri bo'lishi kerak
cat .env.local
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1  (yoki sizning backend manzilingiz)

# 4. Development serverni ishga tushiring
npm run dev
```

`npm install` paytida terminal oxirida biror `npm error` yoki `ERESOLVE`
degan qizil xato chiqsa — bu Tailwind CSS'ning umuman yuklanmasligiga
(natijada "dizayn yo'q, sahifa yalang'och HTML ko'rinishida ochiladi"
holatiga) sabab bo'ladi. Shu xatoni menga to'liq matn sifatida yuborsangiz,
aniq tuzataman.

## Agar Node versiyangiz eski bo'lsa

```bash
# nvm orqali eng oson yo'l:
nvm install 20
nvm use 20
```

## Production build

```bash
npm run build
npm run start
```

## Muammo davom etsa

Terminal'dagi **to'liq** xato matnini (`npm install` yoki `npm run dev`
chiqargan) menga yuboring — shundagina aniq nima buzilganini topib bera olaman.
