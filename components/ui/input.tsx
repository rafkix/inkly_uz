import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const fieldBase =
  "w-full rounded-control border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-text-muted outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const fieldId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        {...props}
        className={cn(
          fieldBase,
          error
            ? "border-destructive focus:border-destructive focus-visible:ring-destructive/20"
            : "border-input",
          className,
        )}
      />
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props },
  ref,
) {
  const fieldId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        {...props}
        className={cn(
          fieldBase,
          "resize-y leading-relaxed",
          error
            ? "border-destructive focus:border-destructive focus-visible:ring-destructive/20"
            : "border-input",
          className,
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
})
