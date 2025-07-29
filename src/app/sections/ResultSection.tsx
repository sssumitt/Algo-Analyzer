// src/app/sections/ResultSection.tsx
'use client'

import { Panel } from '@/app/components/Panel'
import {
  Heading,
  VStack,
  HStack,
  Text,
  Tag,
  useToken,
  Box
} from '@chakra-ui/react'
import { CodeWindow } from '@/app/components/CodeWindow'

interface ResultSectionProps {
  pseudoCode: string[]
  results: { label: string; value: string }[]
}

export default function ResultSection({
  pseudoCode,
  results,
}: ResultSectionProps) {
  const [accent] = useToken('colors', ['purple.400'])

  return (
    <Panel>
      <Heading size="md" color="whiteAlpha.900" mb={4}>
        Analysis Results
      </Heading>

      {/* Pseudo-code */}
      <Text color="gray.300" mb={2} fontWeight="medium">
        Pseudo‑code
      </Text>
      <Box
        bg="gray.900"
        border="1px solid"
        borderColor="whiteAlpha.200"
        rounded="md"
        p={4}
        mb={6}
      >
        <CodeWindow lines={pseudoCode} />
      </Box>

      {/* Key → value */}
      <VStack align="start" spacing={3}>
        {results.map(({ label, value }) => (
          <HStack key={label} spacing={3}>
            <Text minW="100px" color="gray.300" fontWeight="medium">
              {label}:
            </Text>
            <Tag px={3} py={1} rounded="full" bg={accent} color="white" fontSize="sm">
              {value}
            </Tag>
          </HStack>
        ))}
      </VStack>
    </Panel>
  )
}
