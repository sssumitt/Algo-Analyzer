// src/app/components/CodeWindow.tsx
'use client'

import { Box, chakra } from '@chakra-ui/react'

/** Displays pre-formatted lines with both-axis scrolling */
export function CodeWindow({ lines }: { lines: string[] }) {
  return (
    <Box
      rounded="lg"
      px={4}
      py={3}
      fontSize="xs"
      fontFamily="mono"
      color="gray.200"
      bg="gray.900"
      shadow="xl"
      /* ✱ scroll on both axes */
      overflow="auto"
      /* optional caps so the panel never grows unbounded */
      maxH="280px"
      maxW="100%"
      whiteSpace="pre"          /* keep indentation */
      sx={{
                '&::-webkit-scrollbar': {
                  display: 'none', // For Chrome, Safari, and Opera
                },
                msOverflowStyle: 'none', // For Internet Explorer and Edge
                scrollbarWidth: 'none', // For Firefox
              }}
    >
      <chakra.pre m={0}>{lines.join('\n')}</chakra.pre>
    </Box>
  )
}
