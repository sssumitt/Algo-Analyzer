// src/app/components/Panel.tsx
'use client'

import { Box, BoxProps } from '@chakra-ui/react'

export function Panel(props: BoxProps) {
  return (
    <Box
      bg="gray.800"
      border="1px solid"
      borderColor="whiteAlpha.100"
      rounded="lg"
      p={{ base: 4, md: 6 }}
      minH="400px"
      w="full"
      {...props}
    />
  )
}
