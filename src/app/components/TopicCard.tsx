// src/app/components/TopicCard.tsx
'use client'

import Link from 'next/link'
import { Box, Heading, Text } from '@chakra-ui/react'

export default function TopicCard({
  domain,
  algo,
  count,
}: {
  domain: string
  algo: string
  count: number
}) {
  return (
    <Link href={`/repository/${domain}/${algo}`}>
      <Box
        bg="gray.800"
        border="1px solid"
        borderColor="whiteAlpha.100"
        rounded="lg"
        p={4}
        _hover={{ borderColor: 'purple.400', cursor: 'pointer' }}
      >
        <Heading size="sm" color="purple.300">
          {domain} › {algo}
        </Heading>
        <Text mt={2} color="gray.400">
          {count} problem{count !== 1 && 's'}
        </Text>
      </Box>
    </Link>
  )
}
