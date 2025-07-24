'use client'
import { Container, Heading, SimpleGrid, VStack } from '@chakra-ui/react'
import { MemoryCard } from '../components/MemoryCard'
import { GraphPreview } from '../components/GraphPreview'

export function MemoryGraphSection() {
  return (
    <Container maxW="1200px" px={{ base: 6, md: 10 }} py={8}>
      <Heading size="lg" mb={6}>
        Memory Cards & Knowledge Graph
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <VStack align="stretch" spacing={3}>
          <MemoryCard
            title="DFS Core Idea"
            tip="Use recursion/stack to dive deep; mark visited to avoid cycles."
          />
          <MemoryCard
            title="Binary Search Rule"
            tip="Always shrink half the search space by comparing mid."
          />
          <MemoryCard
            title="Topological Sort"
            tip="Only DAGs have linear ordering where all edges go forward."
          />
        </VStack>
        <GraphPreview />
      </SimpleGrid>
    </Container>
  )
}
