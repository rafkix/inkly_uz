"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const SORT_OPTIONS = [
  { value: "latest", label: "So'nggi" },
  { value: "popular", label: "Mashhur" },
  { value: "oldest", label: "Eski" },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]["value"]

export function SortButton() {
  const [active, setActive] = useState<SortValue>("latest")
  const activeLabel = SORT_OPTIONS.find((o) => o.value === active)?.label ?? "So'nggi"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-[34px] items-center gap-2 rounded-md border border-border bg-surface px-3 text-[11px] font-medium text-foreground transition hover:border-primary hover:text-primary data-[popup-open]:border-primary data-[popup-open]:text-primary"
      >
        {activeLabel}
        <ChevronDown size={14} className="transition-transform duration-200 group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[130px]">
        <DropdownMenuRadioGroup value={active} onValueChange={(value) => setActive(value as SortValue)}>
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-[11px]">
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
