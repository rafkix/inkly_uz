// Web Push utility — Service Worker + Push Manager
// Backend VAPID qo'llab-quvvatlaganda ishlaydi. Hozircha localStorage ga saqlanadi.

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
const SW_PATH = "/sw.js"
const SUBSCRIPTION_STORAGE_KEY = "inkly_push_subscription"

export type PermissionState = "default" | "granted" | "denied" | "unsupported"

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export function getPermissionState(): PermissionState {
  if (!isPushSupported()) return "unsupported"
  return Notification.permission as PermissionState
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH)
    console.log("[Push] Service worker registered:", registration.scope)
    return registration
  } catch (error) {
    console.error("[Push] Service worker registration failed:", error)
    return null
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return "denied"

  try {
    const permission = await Notification.requestPermission()
    console.log("[Push] Notification permission:", permission)
    return permission
  } catch (error) {
    console.error("[Push] Permission request failed:", error)
    return "denied"
  }
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn("[Push] Push not supported in this browser")
    return null
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn("[Push] VAPID public key not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY")
    return null
  }

  try {
    const registration = await registerServiceWorker()
    if (!registration) return null

    // Mavjud obuna borligini tekshirish
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      console.log("[Push] New subscription created")
    } else {
      console.log("[Push] Existing subscription found")
    }

    // localStorage ga saqlash (backend tayyor bo'lganda API ga yuboriladi)
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription))
    return subscription
  } catch (error) {
    console.error("[Push] Subscribe failed:", error)
    return null
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return false

    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
    }

    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
    console.log("[Push] Unsubscribed")
    return true
  } catch (error) {
    console.error("[Push] Unsubscribe failed:", error)
    return false
  }
}

export function getStoredSubscription(): PushSubscription | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as PushSubscription
  } catch {
    return null
  }
}

export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if (!isPushSupported() || Notification.permission !== "granted") return

  try {
    new Notification(title, {
      icon: "/icons/notification-icon.png",
      badge: "/icons/notification-badge.png",
      ...options,
    })
  } catch (error) {
    console.error("[Push] Local notification failed:", error)
  }
}

// VAPID kalitni base64 → Uint8Array ga o'tkazish
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/")

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
