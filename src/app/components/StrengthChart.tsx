'use client'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'

/**
 * Simple bar chart mock (replace later with a real chart lib).
 */
export function StrengthChart({
  data,
}: {
  data: { label: string; value: number }[]
}) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <VStack
      align="stretch"
      p={5}
      rounded="lg"
      bg="rgba(255,255,255,0.04)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(4px)"
      spacing={3}
    >
      <Text fontWeight="semibold">Your Mastery Strength</Text>
      {data.map(d => (
        <HStack key={d.label} spacing={3}>
          <Text w="110px" fontSize="xs">
            {d.label}
          </Text>
          <Box flex="1" bg="whiteAlpha.200" rounded="full" h="6px" position="relative">
            <Box
              position="absolute"
              top={0}
              left={0}
              h="6px"
              rounded="full"
              bgGradient="linear(to-r, purple.400, pink.400)"
              w={`${(d.value / max) * 100}%`}
              transition="0.3s"
            />
          </Box>
          <Text fontSize="xs">{d.value}</Text>
        </HStack>
      ))}
    </VStack>
  )
}
