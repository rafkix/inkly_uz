"use client"

import { useState } from "react"

interface PrivacySetting {
  key: string
  label: string
  description: string
  options: { value: string; label: string }[]
  defaultValue: string
}

const privacySettings: PrivacySetting[] = [
  {
    key: "profile_visibility",
    label: "Profil ko'rinishi",
    description: "Profilingizni kimlar ko'ra oladi",
    options: [
      { value: "public",   label: "Hamma"         },
      { value: "private",  label: "Hech kim"       },
    ],
    defaultValue: "public",
  },
  {
    key: "show_email",
    label: "Emailni ko'rsatish",
    description: "Profilingizda email manzilini ko'rsatish",
    options: [
      { value: "yes",  label: "Ko'rsat" },
      { value: "no",   label: "Ko'rsatma" },
    ],
    defaultValue: "no",
  },
]

export default function PrivacySettingsPage() {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(privacySettings.map((s) => [s.key, s.defaultValue])),
  )
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Backendda profil ko'rinishi/email ko'rsatish uchun hech qanday field yoki endpoint
          yo'q (User modelida bunday ustunlar mavjud emas). Shu sababli bu sozlamalar hozircha
          faqat vizual holat — real ta'sir qilmaydi. Buni yashirmasdan ochiq ko'rsatamiz. */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Bu bo‘lim hali backendga ulanmagan — o‘zgarishlar hozircha profilingizga real ta'sir
        qilmaydi. Tez orada qo‘shiladi.
      </div>

      <div className="rounded-2xl border border-border-default bg-white">
        {privacySettings.map((s, i) => (
          <div
            key={s.key}
            className={`px-6 py-5 ${i < privacySettings.length - 1 ? "border-b border-border-default" : ""}`}
          >
            <p className="text-sm font-medium text-text-primary">{s.label}</p>
            <p className="mb-3 text-xs text-text-muted">{s.description}</p>

            <div className="flex gap-2">
              {s.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setValues((v) => ({ ...v, [s.key]: opt.value }))
                    setSaved(false)
                  }}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    values[s.key] === opt.value
                      ? "border-primary bg-inkly-orange-light text-primary"
                      : "border-border-default text-text-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {saved && <p className="text-sm text-green-600">Saqlandi ✓</p>}
        {!saved && <span />}
        <button
          onClick={handleSave}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-inkly-hover transition-colors"
        >
          Saqlash
        </button>
      </div>
    </div>
  )
}
