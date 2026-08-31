"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Users } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { followsApi } from "@/lib/api/follows"
import {  } from "@/lib/api/client"
import type { UserPublicResponse } from "@/types/api"
import { LoadingDots } from "@/components/ui/loading-dots"

export default function FollowingPage() {
  const { username } = useParams<{ username: string }>()
  const [users, setUsers] = useState<UserPublicResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    followsApi
      .following(username, { page: 1, page_size: 30 })
      .then((d) => setUsers(d.items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [username])

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href={`/@${username}`}
        className="text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        ← Profilga qaytish
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">@{username} — kuzatayotganlar</h1>
        <p className="mt-1 text-sm text-text-muted">
          Siz kuzatayotgan foydalanuvchilar.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border-default bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingDots size="lg" className="text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">
            <Users className="mx-auto mb-3" />
            Hali kuzatayotganlar yo'q.
          </div>
        ) : (
          users.map((u) => (
            <Link
              href={`/@${u.slug ?? u.username}`}
              key={u.slug ?? u.username}
              className="flex items-center gap-4 border-b border-border-default p-4 last:border-0 hover:bg-bg-muted transition-colors"
            >
              <Avatar src={u.avatar} name={u.full_name} size={44} />
              <div>
                <p className="font-medium text-text-primary">{u.full_name}</p>
                <p className="text-sm text-text-muted">@{u.username}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}