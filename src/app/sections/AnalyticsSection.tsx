'use client'
import { Container, Heading, Flex } from '@chakra-ui/react'
import { StrengthChart } from '../components/StrengthChart'

export function AnalyticsSection() {
  const strength = [
    { label: 'Graph', value: 78 },
    { label: 'DP', value: 52 },
    { label: 'Greedy', value: 64 },
    { label: 'Sorting', value: 90 },
    { label: 'Strings', value: 40 },
  ]
  return (
    <Container maxW="1200px" px={{ base: 6, md: 10 }} py={8}>
      <Heading size="lg" mb={6}>
        Analysis & Progress
      </Heading>
      <Flex maxW="640px">
        <StrengthChart data={strength} />
      </Flex>
    </Container>
  )
}
