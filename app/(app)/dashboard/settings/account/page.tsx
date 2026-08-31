"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Monitor, Smartphone, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth/context"
import { usersApi } from "@/lib/api/users"
import { authApi } from "@/lib/api/auth"
import type { SessionOut } from "@/types/api"
import { formatDate } from "@/lib/utils/format"
import { toast } from "sonner"
import { LoadingDots } from "@/components/ui/loading-dots"

export default function AccountSettingsPage() {
  const { state, logout } = useAuth()
  const { user, token } = state
  const router = useRouter()

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const [sessions, setSessions] = useState<SessionOut[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Sessiyalarni yuklash
  useEffect(() => {
    if (!token) return
    setSessionsLoading(true)
    authApi.getSessions(token)
      .then(setSessions)
      .catch(() => {})
      .finally(() => setSessionsLoading(false))
  }, [token])

  const handlePasswordChange = async () => {
    if (!token) return
    if (passwords.next !== passwords.confirm) {
      setPwError("Yangi parollar mos kelmadi")
      return
    }
    if (passwords.next.length < 8) {
      setPwError("Parol kamida 8 ta belgidan iborat bo'lishi kerak")
      return
    }
    setPwSaving(true)
    setPwError(null)
    try {
      await usersApi.changePassword(token, passwords.current, passwords.next)
      setPwSuccess(true)
      setPasswords({ current: "", next: "", confirm: "" })
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Xatolik yuz berdi")
    } finally {
      setPwSaving(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!token) return
    try {
      await authApi.deleteSession(token, sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (err) {
      console.error("Session delete error:", err)
    }
  }

  const handleDeleteOtherSessions = async () => {
    if (!token) return
    const ok = window.confirm("Barcha boshqa qurilmalardan chiqishni tasdiqlaysizmi?")
    if (!ok) return
    try {
      await authApi.deleteOtherSessions(token)
      setSessions((prev) => prev.filter((s) => s.is_current))
    } catch (err) {
      console.error("Delete other sessions error:", err)
    }
  }

  const handleDeleteAccount = async () => {
    if (!token) return
    const ok = window.confirm("Hisobingizni butunlay o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.")
    if (!ok) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await usersApi.deleteMe(token, { confirmation: "" })
      await logout()
      router.replace("/")
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Hisobni o'chirishda xatolik")
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Parolni o'zgartirish */}
      <section className="space-y-5 rounded-2xl border border-border-default bg-white p-6">
        <h2 className="font-semibold text-text-primary">Parolni o'zgartirish</h2>

        <div className="space-y-3">
          <Field label="Joriy parol">
            <Input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Yangi parol">
            <Input
              type="password"
              value={passwords.next}
              onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Yangi parolni tasdiqlash">
            <Input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="••••••••"
            />
          </Field>
        </div>

        <div className="flex items-center justify-between">
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-600">Parol yangilandi ✓</p>}
          {!pwError && !pwSuccess && <span />}
          <Button
            onClick={handlePasswordChange}
            disabled={pwSaving || !passwords.current || !passwords.next}
            className="rounded-full bg-primary px-5 font-semibold text-white hover:bg-inkly-hover disabled:opacity-50"
          >
            {pwSaving ? <LoadingDots size="sm" /> : "Saqlash"}
          </Button>
        </div>
      </section>

      {/* Sessiyalar */}
      <section className="space-y-4 rounded-2xl border border-border-default bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Aktiv sessiyalar</h2>
          {sessions.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteOtherSessions}
              className="text-xs text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
            >
              Boshqalarini o'chirish
            </Button>
          )}
        </div>

        {sessionsLoading ? (
          <div className="flex justify-center py-4">
            <LoadingDots size="lg" className="text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-text-muted">Sessiyalar topilmadi</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                  session.is_current ? "border-primary/30 bg-inkly-orange-light" : "border-border-default bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  {session.device_name?.toLowerCase().includes("mobile") ? (
                    <Smartphone size={16} className="text-text-muted" />
                  ) : (
                    <Monitor size={16} className="text-text-muted" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {session.device_name ?? "Noma'lum qurilma"}
                      {session.is_current && (
                        <span className="ml-2 text-xs font-normal text-primary">• joriy</span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted">
                      {session.ip_address ?? "—"}
                      {session.last_seen_at && ` · ${formatDate(session.last_seen_at)}`}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Sessiyani o'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          onClick={logout}
          className="gap-2 rounded-full text-text-secondary hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        >
          Joriy qurilmadan chiqish
        </Button>
      </section>

      {/* Xavfli zona */}
      <section className="space-y-4 rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="font-semibold text-red-700">Xavfli zona</h2>
        </div>
        <p className="text-sm text-red-600">
          Hisobni o'chirish qaytarib bo'lmaydigan amal. Barcha maqolalaringiz, izohlaringiz va
          ma'lumotlaringiz butunlay o'chiriladi.
        </p>
        {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
        <Button
          variant="ghost"
          disabled={deleting}
          className="rounded-full border-red-200 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50"
          onClick={handleDeleteAccount}
        >
          {deleting ? <LoadingDots size="sm" /> : "Hisobni o'chirish"}
        </Button>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      {children}
    </div>
  )
}