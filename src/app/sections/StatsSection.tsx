// src/app/sections/StatsSection.tsx
'use client'

import { Box, VStack, Heading, Text, HStack, Badge } from '@chakra-ui/react'

interface StatsSectionProps {
  questionsSubmitted: number
  algorithmsAdded: number
  recentAlgorithms: string[]
}

export default function StatsSection({
  questionsSubmitted,
  algorithmsAdded,
  recentAlgorithms,
}: StatsSectionProps) {
  return (
    <VStack spacing={6} align="stretch" flex="1">
      <Box bg="gray.800" rounded="lg" p={6} boxShadow="sm">
        <Heading size="md" color="white" mb={2}>
          Your Activity
        </Heading>
        <Text color="gray.300">Questions submitted: {questionsSubmitted}</Text>
        <Text color="gray.300">Algorithms added: {algorithmsAdded}</Text>
      </Box>

      <Box bg="gray.800" rounded="lg" p={6} boxShadow="sm">
        <Heading size="md" color="white" mb={2}>
          Recent Algorithms
        </Heading>
        <HStack spacing={2} wrap="wrap">
          {recentAlgorithms.map((algo) => (
            <Badge key={algo} colorScheme="purple" variant="solid">
              {algo}
            </Badge>
          ))}
        </HStack>
      </Box>
    </VStack>
  )
}
