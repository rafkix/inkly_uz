// app/(write)/layout.tsx
export default function WriteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-white)" }}>
      {children}
    </div>
  )
}