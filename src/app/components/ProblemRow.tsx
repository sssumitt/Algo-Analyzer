// src/app/components/ProblemRow.tsx
'use client'

import Link from 'next/link'
import { HStack, Tag, Text, Box } from '@chakra-ui/react'
import {
  CARD_BG,
  CARD_HOVER_BG,
  CARD_BORDER,
} from './repo-ui'

interface Props {
  url?:  string          // ⬅ made optional
  time: string
  space: string
}

function RowShell({ children }: { children: React.ReactNode }) {
  return (
    <HStack
      justify="space-between"
      px={4}
      py={3}
      rounded="lg"
      borderWidth="1px"
      borderColor={CARD_BORDER}
      bg={CARD_BG}
      _hover={{ bg: CARD_HOVER_BG }}
      transition="background 0.2s"
    >
      {children}
    </HStack>
  )
}

export default function ProblemRow({ url, time, space }: Props) {
  const body = (
    <>
      <Text color="purple.300" fontSize="sm" noOfLines={1}>
        {url || 'Untitled problem'}
      </Text>

      <HStack>
        <Tag size="sm" colorScheme={url ? 'purple' : 'gray'}>
          {url ? time  : '–'}
        </Tag>
        <Tag size="sm" colorScheme={url ? 'pink'   : 'gray'}>
          {url ? space : '–'}
        </Tag>
      </HStack>
    </>
  )

  return url ? (
    <Link href={url} target="_blank" style={{ display: 'block', width: '100%' }}>
      <RowShell>{body}</RowShell>
    </Link>
  ) : (
    <Box width="100%">
      <RowShell>{body}</RowShell>
    </Box>
  )
}
