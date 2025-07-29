'use client'
import { Container, Heading, SimpleGrid } from '@chakra-ui/react'
import { AlgorithmCard } from '../components/AlgorithmCard'

export function RepositoryShowcase() {
  const sample = [
    {
      name: 'Depth‑First Search',
      description: 'Traverse all reachable vertices from a source using recursion.',
      tags: ['Graph', 'Traversal', 'Recursion'],
      time: 'O(V+E)',
      space: 'O(V)',
      pseudocode: [
        'DFS(u):',
        '  visited[u] = true',
        '  for v in adj[u]:',
        '    if !visited[v]: DFS(v)',
      ],
    },
    {
      name: 'Binary Search',
      description: 'Find target in sorted array via divide and conquer.',
      tags: ['Array', 'Divide & Conquer'],
      time: 'O(log n)',
      space: 'O(1)',
      pseudocode: [
        'while l <= r:',
        '  mid = (l+r)/2',
        '  if a[mid]==x return mid',
        '  if a[mid]<x l=mid+1 else r=mid-1',
      ],
    },
  ]

  return (
    <Container maxW="1200px" px={{ base: 6, md: 10 }} py={8}>
      <Heading size="lg" mb={6}>
        Your Algorithm Repository
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {sample.map(a => (
          <AlgorithmCard key={a.name} algo={a} />
        ))}
      </SimpleGrid>
    </Container>
  )
}
