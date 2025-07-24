// app/page.tsx
'use client'
import { Hero } from './sections/Hero'
import { FeaturesSection } from './sections/FeatureSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { DashboardPreview } from './sections/DashboardPreview'
import { FinalCTA } from './sections/FinalCTA'
import { Footer } from './components/footer'

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <FeaturesSection />
      <DashboardPreview />
      <FinalCTA />
    </>
  )
}
