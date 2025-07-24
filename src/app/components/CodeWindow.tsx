'use client'
import { Box, chakra } from '@chakra-ui/react'

export function CodeWindow({ lines }: { lines: string[] }) {
  return (
    <Box
      bg="rgba(255,255,255,0.05)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(6px)"
      rounded="lg"
      px={4}
      py={3}
      fontSize="xs"
      fontFamily="mono"
      color="gray.200"
      shadow="xl"
      w="260px"
    >
      {lines.map((l, i) => (
        <chakra.pre key={i} m={0} whiteSpace="pre">
          {l}
        </chakra.pre>
      ))}
    </Box>
  )
}
