import { Suspense } from "react"

import { Hero } from "@/components/landing/hero"
import { FeaturesSection } from "@/components/landing/features-section"
import { BlogShowcase } from "@/components/landing/blog-showcase"
import { BlogShowcasePosts, BlogShowcaseFallback } from "@/components/landing/blog-showcase-posts"
import { HowItWorks } from "@/components/ui/how-it-works"
import { ValueStatement } from "@/components/landing/value-statement"
import { CtaSection } from "@/components/landing/cta-section"

// Not async: the page itself has no data dependency, so it renders
// immediately. Only BlogShowcasePosts (real published posts) is
// wrapped in Suspense — a slow/unreachable backend stalls just that
// one section instead of the whole homepage.
export default function HomePage() {
  return (
    <main>
      <Hero />

      <ValueStatement />

      <FeaturesSection />

      <BlogShowcase>
        <Suspense fallback={<BlogShowcaseFallback />}>
          <BlogShowcasePosts />
        </Suspense>
      </BlogShowcase>

      <HowItWorks />

      <CtaSection />
    </main>
  )
}
