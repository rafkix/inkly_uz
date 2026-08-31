import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const containerVariants = {
  marketing: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
  dashboard: "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8",
  auth: "mx-auto w-full max-w-md px-4 sm:px-6",
  article: "mx-auto w-full max-w-3xl px-4 sm:px-6",
  editor: "mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8",
} as const

export type ContainerVariant = keyof typeof containerVariants

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ContainerVariant
}

export function Container({ variant = "marketing", className, ...props }: ContainerProps) {
  return <div className={cn(containerVariants[variant], className)} {...props} />
}

export function MarketingContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="marketing" {...props} />
}

export function DashboardContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="dashboard" {...props} />
}

export function AuthContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="auth" {...props} />
}

export function ArticleContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="article" {...props} />
}

export function EditorContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="editor" {...props} />
}

export { containerVariants }

// Vertical rhythm primitive — controls the space between page sections
// so no page has to invent its own py-* value. Wraps Container by
// default; pass asChild to control the inner width yourself.
const sectionSpacing = {
  sm: "py-8 sm:py-10",
  md: "py-12 sm:py-16",
  lg: "py-16 sm:py-24",
  xl: "py-20 sm:py-32",
} as const

interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: keyof typeof sectionSpacing
  containerVariant?: ContainerVariant
  /** Render children directly, without the inner Container wrapper. */
  asChild?: boolean
}

export function Section({
  spacing = "md",
  containerVariant = "marketing",
  asChild = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(sectionSpacing[spacing], className)} {...props}>
      {asChild ? children : <Container variant={containerVariant}>{children}</Container>}
    </section>
  )
}
