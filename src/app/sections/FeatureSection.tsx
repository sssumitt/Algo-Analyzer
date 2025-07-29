'use client'
import { Box, Container, SimpleGrid, Heading } from '@chakra-ui/react'
import { Feature } from '../components/Feature'
import { Bug, Database, Share2, LineChart } from 'lucide-react'

export function FeaturesSection() {
  return (
    <Box as="section" pb={24}>
      <Container maxW="1200px" px={{ base: 6, md: 10 }}>
        <Heading size="lg" mb={10}>Core Capabilities</Heading>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 8, md: 10 }}>
          <Feature
            icon={Database}
            title="Store & Tag"
            desc="Central repository with searchable tags by paradigm or pattern."
          />
          <Feature
            icon={Bug}
            title="Auto Complexity"
            desc="Static analysis extracts time/space and English pseudocode."
          />
          <Feature
            icon={LineChart}
            title="Skill Insights"
            desc="Track strengths across topics with visual progress metrics."
          />
          <Feature
            icon={Share2}
            title="Knowledge Graph"
            desc="Interconnect algorithms to discover prerequisite gaps."
          />
        </SimpleGrid>
      </Container>
    </Box>
  )
}
