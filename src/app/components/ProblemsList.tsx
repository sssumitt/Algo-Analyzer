// src/app/components/ProblemsList.tsx
'use client'

import { Box, Heading, VStack } from '@chakra-ui/react'
import ProblemRow from './ProblemRow'
import { ClickCard, INDENT_BORDER } from './repo-ui'

interface Problem {
  url: string
  time: string
  space: string
}

export default function ProblemsList({
  domainName,
  algoName,
  problems,
}: {
  domainName: string
  algoName: string
  problems: Problem[]
}) {
  return (
    <Box maxW="6xl" mx="auto" px={4} py={8}>
      <Heading size="lg" mb={6} color="white">
        {domainName} &rsaquo; {algoName}
      </Heading>

      <VStack align="stretch" spacing={4}>
        {problems.map((p, idx) => (
          <ProblemRow
            /* ------------ UNIQUE KEY ------------- */
            key={`${p.url || 'row'}-${idx}`}
            url={p.url}
            time={p.time}
            space={p.space}
          />
        ))}

        {problems.length === 0 && (
          <ClickCard
            borderStyle="dashed"
            borderColor={INDENT_BORDER}
            cursor="default"
          >
            <Heading size="sm" color="gray.500" textAlign="center">
              No problems saved yet
            </Heading>
          </ClickCard>
        )}
      </VStack>
    </Box>
  )
}
