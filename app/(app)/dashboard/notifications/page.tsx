"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Heart,
  MessageCircle,
  MessageCircleReply,
  RefreshCw,
  UserPlus,
} from "lucide-react"

import { useAuth } from "@/lib/auth/context"
import { notificationsApi, type NotificationItem } from "@/lib/api/notifications"
import type { Page } from "@/types/api"
import { LoadingDots } from "@/components/ui/loading-dots"

type NotificationResponse = Page<NotificationItem>

function formatDate(date: string) {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

function getNotificationIcon(type: string) {
  switch (type.toLowerCase()) {
    case "like":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Heart size={18} fill="currentColor" />
        </div>
      )

    case "comment":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <MessageCircle size={18} />
        </div>
      )

    case "comment_reply":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-500">
          <MessageCircleReply size={18} />
        </div>
      )

    case "follow":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
          <UserPlus size={18} />
        </div>
      )

    default:
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-primary">
          <Bell size={18} />
        </div>
      )
  }
}

function getNotificationMessage(item: NotificationItem) {
  const actor =
    item.actor?.full_name ||
    item.actor?.username ||
    "Foydalanuvchi"

  switch (item.type.toLowerCase()) {
    case "like":
      return (
        <>
          <span className="font-semibold text-text-primary">
            {actor}
          </span>{" "}
          maqolangizni yoqtirdi
        </>
      )

    case "comment":
      return (
        <>
          <span className="font-semibold text-text-primary">
            {actor}
          </span>{" "}
          maqolangizga izoh qoldirdi
        </>
      )

    case "comment_reply":
      return (
        <>
          <span className="font-semibold text-text-primary">
            {actor}
          </span>{" "}
          izohingizga javob yozdi
        </>
      )

    case "follow":
      return (
        <>
          <span className="font-semibold text-text-primary">
            {actor}
          </span>{" "}
          sizga obuna bo‘ldi
        </>
      )

    default:
      return (
        <>
          <span className="font-semibold text-text-primary">
            {actor}
          </span>{" "}
          yangi faoliyatni amalga oshirdi
        </>
      )
  }
}

export default function NotificationsPage() {
  const { state } = useAuth()

  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadNotifications = useCallback(
    async (refresh = false) => {
      if (!state.token) {
        setItems([])
        setLoading(false)
        return
      }

      try {
        setError(null)

        if (refresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        const data = (await notificationsApi.list(
          state.token,
          {
            page: 1,
            page_size: 20,
          },
        )) as NotificationResponse

        setItems(Array.isArray(data.items) ? data.items : [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Bildirishnomalar yuklanmadi",
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [state.token],
  )

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const markRead = async (notification: NotificationItem) => {
    if (
      !state.token ||
      notification.is_read ||
      markingId
    ) {
      return
    }

    try {
      setMarkingId(notification.uuid)

      await notificationsApi.markRead(
        state.token,
        notification.uuid,
      )

      setItems((current) =>
        current.map((item) =>
          item.uuid === notification.uuid
            ? {
              ...item,
              is_read: true,
              read_at: new Date().toISOString(),
            }
            : item,
        ),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bildirishnomani o‘qilgan qilib bo‘lmadi",
      )
    } finally {
      setMarkingId(null)
    }
  }

  const markAll = async () => {
    if (
      !state.token ||
      markingAll ||
      items.length === 0
    ) {
      return
    }

    try {
      setMarkingAll(true)
      setError(null)

      await notificationsApi.markAllRead(state.token)

      const now = new Date().toISOString()

      setItems((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at ?? now,
        })),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bildirishnomalarni o‘qilgan qilib bo‘lmadi",
      )
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = items.filter(
    (item) => !item.is_read,
  ).length

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">
              Bildirishnomalar
            </h1>

            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-text-muted mp-4">
            Hisobingizdagi so‘nggi faoliyat.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => void loadNotifications(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 rounded-xl border border-border-default bg-white px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            <span className="hidden sm:inline">
              Yangilash
            </span>
          </button>

          <button
            type="button"
            onClick={() => void markAll()}
            disabled={
              markingAll ||
              loading ||
              unreadCount === 0
            }
            className="flex items-center gap-2 rounded-xl border border-border-default bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markingAll ? (
              <LoadingDots size="md" />
            ) : (
              <CheckCheck size={15} />
            )}

            Barchasini o‘qilgan qilish
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => void loadNotifications()}
            className="font-medium underline underline-offset-2"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-border-default bg-white mt-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingDots size="lg" className="text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-muted">
              <Bell
                size={24}
                className="text-text-muted"
              />
            </div>

            <p className="mt-3 font-medium text-text-primary">
              Bildirishnomalar yo‘q
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Yangi faoliyat paydo bo‘lganda shu yerda
              ko‘rinadi.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {items.map((item) => (
              <div
                key={item.uuid}
                className={`relative p-5 transition sm:p-6 ${item.is_read
                    ? "bg-white"
                    : "bg-orange-50/60"
                  }`}
              >
                {!item.is_read && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-primary" />
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  {getNotificationIcon(item.type)}

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm leading-6 text-text-secondary">
                          {getNotificationMessage(item)}
                        </p>

                        {/* Post */}
                        {/* Bu bildirishnomalar doim joriy foydalanuvchining o'z posti haqida
                            (kimdir unga like/comment bosgan), shuning uchun post URL uchun
                            author sifatida joriy foydalanuvchi slug'i ishlatiladi — bu
                            /[username]/[slug] route'iga mos keladi (/posts/[slug] mavjud emas). */}
                        {item.post && state.user?.slug && (
                          <Link
                            href={`/${state.user.slug}/${item.post.slug}`}
                            onClick={() => {
                              if (!item.is_read) {
                                void markRead(item)
                              }
                            }}
                            className="group mt-1 inline-flex max-w-full items-center gap-1.5"
                          >
                            <span className="truncate text-sm font-semibold text-text-primary group-hover:text-primary">
                              {item.post.title}
                            </span>

                            <ExternalLink
                              size={13}
                              className="shrink-0 text-text-muted group-hover:text-primary"
                            />
                          </Link>
                        )}

                        {/* Comment */}
                        {item.comment && (
                          <div className="mt-3 rounded-xl border border-border-default bg-bg-muted px-4 py-3">
                            <p className="text-sm leading-5 text-text-muted">
                              “{item.comment.content}”
                            </p>
                          </div>
                        )}

                        {/* Meta */}
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                          <span>
                            {formatDate(item.created_at)}
                          </span>

                          {item.actor?.username && (
                            <>
                              <span>•</span>

                              <Link
                                href={`/${item.actor.slug}`}
                                className="transition hover:text-primary"
                              >
                                @{item.actor.username}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Mark read */}
                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={() =>
                            void markRead(item)
                          }
                          disabled={
                            markingId === item.uuid
                          }
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 py-2 text-xs font-medium text-text-secondary transition hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {markingId === item.uuid ? (
                            <LoadingDots size="sm" />
                          ) : (
                            <Check size={13} />
                          )}

                          O‘qilgan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}