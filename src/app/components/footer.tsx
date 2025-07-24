// components/Footer.tsx
'use client'

import React from 'react'
import { Box, Container, Text } from '@chakra-ui/react'

export function Footer() {
  return (
    <Box
      as="footer"
      py={{ base: 4, md: 6 }}
      borderTop="1px solid"
      borderColor="whiteAlpha.200"
      bg="transparent"
    >
      <Container maxW="1200px">
        <Text fontSize="xs" textAlign="center" color="gray.400">
          © {new Date().getFullYear()}{' '}
          <Text as="span" fontWeight="semibold" color="white">
            AlgoAnalyzer
          </Text>
          . All rights reserved.
        </Text>
      </Container>
    </Box>
  )
}
