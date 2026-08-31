"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Send, CheckCircle2, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth/context"
import { telegramApi } from "@/lib/api/telegram"
import type { TelegramChannelResponse } from "@/lib/api/telegram"
import { postsApi } from "@/lib/api/posts"
import type { PostListItem } from "@/types/api"
import { toast } from "sonner"
import { LoadingDots } from "@/components/ui/loading-dots"

export default function TelegramChannelsPage() {
  const { state } = useAuth()
  const { token, loading: authLoading } = state
  const router = useRouter()

  const [channels, setChannels] = useState<TelegramChannelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newChannelUsername, setNewChannelUsername] = useState("")
  const [removing, setRemoving] = useState<string | null>(null)

  // Post tanlash dialogi
  const [publishChannel, setPublishChannel] = useState<TelegramChannelResponse | null>(null)
  const [publishPosts, setPublishPosts] = useState<PostListItem[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<PostListItem | null>(null)

  // Kanallarni yuklash
  useEffect(() => {
    if (!token) return
    setLoading(true)
    telegramApi.listChannels(token)
      .then((data) => setChannels(data.items))
      .catch((err) => {
        console.error("Failed to load channels:", err)
        toast.error("Kanallar yuklanmadi")
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleAddChannel = async () => {
    if (!token || !newChannelUsername.trim()) return
    const username = newChannelUsername.trim().replace("@", "")
    setAdding(true)
    try {
      const channel = await telegramApi.addChannel(token, username)
      setChannels((prev) => [...prev, channel])
      setNewChannelUsername("")
      toast.success(`"${channel.title}" kanali qo'shildi`)
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string }
      if (error.code === "CHANNEL_NOT_ADMIN") {
        toast.error("Siz bu kanalning admini emassiz. Avval botni kanalga admin qiling.")
      } else if (error.code === "CHANNEL_NOT_FOUND") {
        toast.error("Kanal topilmadi. Username ni tekshiring.")
      } else {
        toast.error(error.message ?? "Kanal qo'shishda xatolik")
      }
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveChannel = async (channelUuid: string, channelTitle: string) => {
    if (!token) return
    const ok = window.confirm(`"${channelTitle}" kanalini o'chirishni tasdiqlaysizmi?`)
    if (!ok) return

    setRemoving(channelUuid)
    try {
      await telegramApi.removeChannel(token, channelUuid)
      setChannels((prev) => prev.filter((c) => c.uuid !== channelUuid))
      toast.success("Kanal o'chirildi")
    } catch (err) {
      console.error("Remove channel failed:", err)
      toast.error("Kanalni o'chirishda xatolik")
    } finally {
      setRemoving(null)
    }
  }

  const handlePublishToChannel = async (channelUuid: string, postUuid: string) => {
    if (!token) return

    setPublishing(channelUuid)
    try {
      await telegramApi.publishToChannel(token, channelUuid, postUuid)
      toast.success("Maqola kanalda yuborildi")
      setPublishChannel(null)
      setSelectedPost(null)
    } catch (err) {
      console.error("Publish failed:", err)
      toast.error("Maqolani yuborishda xatolik")
    } finally {
      setPublishing(null)
    }
  }

  // "Maqolani yuborish" tugmasi bosilganda: agar kanal hali tasdiqlanmagan bo'lsa,
  // publish so'rovi backendda rad etiladi — shuning uchun bevosita verification
  // oqimiga yo'naltiramiz. Tasdiqlangan bo'lsa, maqola tanlash modalini ochamiz
  // va o'z published maqolalarini yuklaymiz (avval bu qadam butunlay tashlab
  // ketilgan edi — tugma hech narsa qilmasdi).
  const openPublishModal = async (channel: TelegramChannelResponse) => {
    if (!channel.is_verified) {
      toast.error("Avval kanalni tasdiqlang")
      router.push("/dashboard/telegram/verify")
      return
    }
    setPublishChannel(channel)
    setSelectedPost(null)
    setPostsLoading(true)
    try {
      if (!token) return
      const page = await postsApi.myList(token, { page_size: 50 })
      setPublishPosts((page?.items ?? []).filter((p) => p.status === "published"))
    } catch (err) {
      console.error("Failed to load posts:", err)
      toast.error("Maqolalar ro'yxatini yuklashda xatolik")
    } finally {
      setPostsLoading(false)
    }
  }

  const handleOpenPublications = (channelUuid: string) => { router.push(`/dashboard/telegram/channels/${channelUuid}/publications`) }

  const handleOpenChannel = (username: string) => {
    window.open(`https://t.me/${username}`, "_blank")
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingDots size="lg" className="text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Telegram kanallar</h1>
        <p className="text-sm text-text-muted mt-1">
          Kanallarni qo'shing, boshqaring va maqolalarni ularning orqali yuboring.
        </p>
      </div>

      {/* Add Channel Form */}
      <div className="rounded-2xl border border-border-default bg-white p-6">
        <h3 className="font-semibold text-text-primary mb-4">Yangi kanal qo'shish</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">@</span>
            <Input
              type="text"
              value={newChannelUsername}
              onChange={(e) => setNewChannelUsername(e.target.value)}
              placeholder="kanal_username (masalan: my_channel)"
              className="pl-8"
              onKeyDown={(e) => e.key === "Enter" && handleAddChannel()}
            />
          </div>
          <Button
            onClick={handleAddChannel}
            disabled={adding || !newChannelUsername.trim()}
            className="rounded-full bg-primary px-5 font-semibold text-white hover:bg-inkly-hover disabled:opacity-50 whitespace-nowrap"
          >
            {adding ? (
              <>
                <LoadingDots size="sm" className="mr-2" />
                Qo'shilmoqda...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Qo'shish
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Eslatma: Bot kanalga admin sifatida qo'shilgan bo'lishi kerak. Kanal username'ini @ belgisisiz kiriting.
        </p>
      </div>

      {/* Channels List */}
      <div className="rounded-2xl border border-border-default bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingDots size="lg" className="text-primary" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-bg-muted flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <path d="M4 22h16" />
                <path d="M12 15v7" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary">Kanallar yo'q</h3>
            <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto">
              Avval kanal qo'shing. Botni kanalga admin qiling va username ni yukoridagi maydonga kiriting.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {channels.map((channel) => (
              <div
                key={channel.uuid}
                className="flex items-center justify-between gap-4 p-5 hover:bg-bg-muted transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-inkly-orange-light flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary truncate">{channel.title}</p>
                      {channel.is_verified && (
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" aria-label="Tasdiqlangan" />
                      )}
                    </div>
                    <p className="text-sm text-text-muted truncate">@{channel.username}</p>
                    <p className="text-xs text-text-muted mt-0.5">Qo'shilgan: {new Date(channel.created_at).toLocaleDateString("uz-UZ")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenPublications(channel.uuid)}
                    className="text-text-muted hover:text-text-primary hover:bg-bg-muted"
                    title="Nashrlar"
                  >
                    <Send size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => channel.username && handleOpenChannel(channel.username)}
                    className="text-text-muted hover:text-text-primary hover:bg-bg-muted"
                    title="Kanalni ochish"
                  >
                    <ExternalLink size={16} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void openPublishModal(channel)}
                    disabled={publishing === channel.uuid}
                    className="text-primary hover:bg-inkly-orange-light hover:text-inkly-hover disabled:opacity-50"
                    title="Maqolani yuborish"
                  >
                    {publishing === channel.uuid ? (
                      <LoadingDots size="md" />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveChannel(channel.uuid, channel.title)}
                    disabled={removing === channel.uuid}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Kanalni o'chirish"
                  >
                    {removing === channel.uuid ? (
                      <LoadingDots size="md" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help */}
      <div className="rounded-2xl bg-inkly-orange-light border border-inkly-peach p-6">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          Qo'llanma
        </h3>
        <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
          <li>Telegramda kanal yarating yoki mavjud kanalga kiring</li>
          <li>Botni (@inkly_uz_bot) kanalga admin qiling (Xabar yuborish huquqi bilan)</li>
          <li>Kanal username'ini (masalan: <code className="bg-inkly-peach px-1 rounded font-mono text-xs">my_channel</code>) yukoridagi maydonga kiriting</li>
          <li>"Qo'shish" tugmasini bosing — kanal tasdiqlanadi</li>
          <li>Maqola yozganda "Telegramga yuborish" tugmasi orqali tanlangan kanalda yuboring</li>
        </ol>
      </div>

      {/* Publish modal — kanal tanlangandan keyin qaysi maqolani yuborishni tanlash */}
      {publishChannel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPublishChannel(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">
                "{publishChannel.title}" ga yuborish
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setPublishChannel(null)}>
                <X size={16} />
              </Button>
            </div>

            {postsLoading ? (
              <div className="flex items-center justify-center py-10">
                <LoadingDots size="lg" className="text-primary" />
              </div>
            ) : publishPosts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-text-muted">
                  Nashr qilingan maqolalaringiz yo'q. Avval maqola nashr qiling.
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 -mx-1 px-1 space-y-1">
                {publishPosts.map((post) => (
                  <button
                    key={post.uuid}
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                      selectedPost?.uuid === post.uuid
                        ? "border-primary bg-inkly-orange-light"
                        : "border-border-default hover:bg-bg-muted"
                    }`}
                  >
                    <p className="font-medium text-text-primary truncate">{post.title}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPublishChannel(null)}>
                Bekor qilish
              </Button>
              <Button
                disabled={!selectedPost || publishing === publishChannel.uuid}
                onClick={() => void handlePublishToChannel(publishChannel.uuid, selectedPost!.uuid)}
                className="bg-primary text-white hover:bg-inkly-hover disabled:opacity-50"
              >
                {publishing === publishChannel.uuid ? <LoadingDots size="sm" /> : "Yuborish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}