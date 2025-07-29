// app/sections/DashboardPreview.tsx
'use client'
import { Container, Heading, Box, Text } from '@chakra-ui/react'

export function DashboardPreview() {
  return (
    <Container maxW="1200px" px={{ base: 6, md: 10 }} py={10}>
      <Heading size="lg" mb={6}>
        A Glimpse of Your Dashboard
      </Heading>
      <Box
        h="260px"
        rounded="lg"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg="linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="sm"
        color="gray.300"
      >
        (Screenshot / live widget goes here)
      </Box>
      <Text mt={3} fontSize="xs" color="gray.500">
        Replace this container with a real screenshot once the dashboard is ready.
      </Text>
    </Container>
  )
}
