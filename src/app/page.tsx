'use client'

// Make sure to import your actual components. These are placeholders for structure.
import { HeroContent } from './components/landingPage/HeroContent' 
import { FeaturesSection } from './components/landingPage/FeatureSection'
import { FinalCTA } from './components/landingPage/FinalCTA'
import { Hero3D } from './components/landingPage/Hero3D'

import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'

export default function LandingPage() {
  return (
    <div className="bg-black">
      <Hero3D />
      <div className="relative z-10">
        <Navbar />
        <section className="h-screen flex items-center justify-center">
          <HeroContent />
        </section>
        <FeaturesSection />
        <FinalCTA />
        <Footer /> 
      </div>
    </div>
  )
}
