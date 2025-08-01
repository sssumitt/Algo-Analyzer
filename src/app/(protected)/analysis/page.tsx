'use client'

import PerformanceCard from '@/app/components/analysis/PerformanceCard'
import AnalyticsCard  from '@/app/components/analysis/AnalyticsSection'
import MemoryCard from '@/app/components/analysis/MemoryCard'
// import KnowledgeGraphSection from '@/app/components/analysis/KnowledgeGraph'


export default function LandingPage() {
  return (
    <>
        <PerformanceCard/>
        <AnalyticsCard/>
        <MemoryCard />
        {/* <KnowledgeGraphSection /> */}
    </>
  )
}
