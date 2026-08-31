"use client"

import type { ComponentProps } from "react"
import { Menu } from "@base-ui/react/menu"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Shared dropdown / menu system — replaces one-off "open state + fixed
// backdrop + absolute panel" implementations scattered across pages.
export const DropdownMenu = Menu.Root
export const DropdownMenuTrigger = Menu.Trigger

export function DropdownMenuContent({ className, sideOffset = 6, ...props }: ComponentProps<typeof Menu.Popup> & { sideOffset?: number }) {
  return (
    <Menu.Portal>
      <Menu.Positioner sideOffset={sideOffset} align="end">
        <Menu.Popup
          {...props}
          className={cn(
            "z-50 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-md",
            "transition-all duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
        />
      </Menu.Positioner>
    </Menu.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      {...props}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground outline-none transition-colors",
        "data-[highlighted]:bg-accent data-[highlighted]:text-primary",
        className,
      )}
    />
  )
}

export function DropdownMenuRadioItem({ className, children, ...props }: ComponentProps<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem
      {...props}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-foreground outline-none transition-colors",
        "data-[highlighted]:bg-accent data-[highlighted]:text-primary",
        className,
      )}
    >
      {children}
      <Menu.RadioItemIndicator>
        <Check size={14} className="text-primary" />
      </Menu.RadioItemIndicator>
    </Menu.RadioItem>
  )
}

export function DropdownMenuRadioGroup(props: ComponentProps<typeof Menu.RadioGroup>) {
  return <Menu.RadioGroup {...props} />
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<"div">) {
  return <div role="separator" className={cn("my-1 h-px bg-border", className)} {...props} />
}
