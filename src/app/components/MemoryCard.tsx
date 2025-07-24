'use client'
import { Box, Text } from '@chakra-ui/react'

export function MemoryCard({ title, tip }: { title: string; tip: string }) {
  return (
    <Box
      p={4}
      rounded="md"
      bg="rgba(139,92,246,0.15)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      w="full"
    >
      <Text fontWeight="semibold" mb={1}>{title}</Text>
      <Text fontSize="xs" color="gray.200">{tip}</Text>
    </Box>
  )
}
