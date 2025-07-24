'use client'
import { Box, Heading, Text, HStack, Tag, VStack, Divider } from '@chakra-ui/react'

export interface Algorithm {
  name: string
  description: string
  tags: string[]
  time: string
  space: string
  pseudocode: string[]
}

export function AlgorithmCard({ algo }: { algo: Algorithm }) {
  return (
    <Box
      p={5}
      rounded="lg"
      bg="rgba(255,255,255,0.04)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(4px)"
      w="100%"
    >
      <HStack justify="space-between" align="flex-start" mb={2}>
        <Heading size="sm">{algo.name}</Heading>
        <HStack spacing={2}>
          <Tag size="sm" colorScheme="purple" variant="subtle">{algo.time}</Tag>
          <Tag size="sm" colorScheme="pink" variant="subtle">{algo.space}</Tag>
        </HStack>
      </HStack>
      <Text fontSize="xs" color="gray.300" mb={2}>{algo.description}</Text>
      <HStack spacing={2} flexWrap="wrap" mb={3}>
        {algo.tags.map(t => (
          <Tag key={t} size="sm" variant="outline" colorScheme="purple">
            {t}
          </Tag>
        ))}
      </HStack>
      <Divider borderColor="whiteAlpha.300" mb={2} />
      <VStack align="stretch" spacing={0} fontFamily="mono" fontSize="10px">
        {algo.pseudocode.map((l,i) => (
          <Text key={i}>{l}</Text>
        ))}
      </VStack>
    </Box>
  )
}
