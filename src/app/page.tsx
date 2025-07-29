// app/page.tsx
'use client'
import { Hero } from './sections/Hero'
import { FeaturesSection } from './sections/FeatureSection'
import { HowItWorksSection } from './sections/HowItWorksSection'

import { FinalCTA } from './sections/FinalCTA'
// import Footer from './components/Footer'
import { Navbar } from './components/Navbar'


export default function LandingPage() {
  return (
    <>
      <Navbar/>
      <Hero />
      <HowItWorksSection />
      <FeaturesSection />
      <FinalCTA />
      {/* <Footer /> */}
    </>
  )
}
