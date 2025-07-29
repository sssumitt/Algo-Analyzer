// src/app/sections/SubmissionSection.tsx
'use client'

import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
} from '@chakra-ui/react'

interface SubmissionSectionProps {
  problemLink: string
  solution: string
  onChangeProblem: (v: string) => void
  onChangeSolution: (v: string) => void
  onAnalyse: () => void
}

export default function SubmissionSection({
  problemLink,
  solution,
  onChangeProblem,
  onChangeSolution,
  onAnalyse,
}: SubmissionSectionProps) {
  return (
    <Box
      bg="gray.800"
      rounded="2xl"
      p={8}
      maxW="720px"
      w="full"
      boxShadow="md"
    >
      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel color="white">Problem URL</FormLabel>
          <Input
            value={problemLink}
            onChange={(e) => onChangeProblem(e.target.value)}
            placeholder="Paste problem URL…"
            size="lg"
            bg="whiteAlpha.100"
            borderColor="gray.600"
            _placeholder={{ color: 'gray.400' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel color="white">Your Solution</FormLabel>
          <Textarea
            value={solution}
            onChange={(e) => onChangeSolution(e.target.value)}
            placeholder="Paste your solution code…"
            size="lg"
            minH="240px"
            bg="whiteAlpha.100"
            borderColor="gray.600"
            _placeholder={{ color: 'gray.400' }}
          />
        </FormControl>

        <Button
          onClick={onAnalyse}
          isDisabled={!problemLink.trim() || !solution.trim()}
          size="lg"
          bgGradient="linear(to-r, purple.400, pink.400)"
          _hover={{ bgGradient: 'linear(to-r, purple.500, pink.500)' }}
        >
          Analyse 
        </Button>
      </VStack>
    </Box>
  )
}
