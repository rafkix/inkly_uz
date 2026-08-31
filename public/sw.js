// Inkly Service Worker — Web Push Handler
// Bu fayl backend VAPID push yuborganda ishlaydi.
// Hozircha faqat local notification ko'rsatadi.

const CACHE_NAME = "inkly-v1"
const NOTIFICATION_ICON = "/icons/notification-icon.png"
const NOTIFICATION_BADGE = "/icons/notification-badge.png"

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...")
  event.waitUntil(clients.claim())
})

// Push xabar qabul qilganda
self.addEventListener("push", (event) => {
  console.log("[SW] Push received")

  let data = {}
  try {
    data = event.data?.json() ?? {}
  } catch {
    data = { title: "Inkly", body: event.data?.text() ?? "Yangi xabar" }
  }

  const title = data.title ?? "Inkly"
  const options = {
    body: data.body ?? "Yangi xabar keldi",
    icon: data.icon ?? NOTIFICATION_ICON,
    badge: data.badge ?? NOTIFICATION_BADGE,
    image: data.image,
    tag: data.tag ?? "inkly-notification",
    data: data.data ?? {},
    actions: data.actions ?? [],
    requireInteraction: data.requireInteraction ?? false,
    silent: data.silent ?? false,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification bosilganda
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag)

  event.notification.close()

  const data = event.notification.data ?? {}
  const url = data.url ?? "/"

  // Agar action bosilsa
  if (event.action) {
    console.log("[SW] Action:", event.action)
    // Actionga qarab maxsus harakatlar qo'shilishi mumkin
    return
  }

  // Asosiy notification bosilganda sahifani ochish
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Mavjud oyna borligini tekshirish
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus()
        }
      }
      // Yangi oyna ochish
      return clients.openWindow(url)
    })
  )
})

// Notification yopilganda
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag)
  // Analytics uchun log yuborish mumkin
})

// Fetch event (optional - caching uchun)
self.addEventListener("fetch", (event) => {
  // Faqat GET so'rovlarini cache qilish
  if (event.request.method !== "GET") return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((response) => {
        // Faqat muvaffaqiyatli javoblarni cache qilish
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})