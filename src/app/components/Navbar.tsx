'use client'
import { Box, Flex, Heading, Text, Container, HStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Logo } from './Logo'

export function Navbar() {
  return (
    <Box as="nav" borderBottom="1px solid" borderColor="whiteAlpha.200">
      <Container maxW="1200px" px={{ base: 6, md: 10 }} py={5}>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Logo />
            <Heading
              as={NextLink}
              href="/dashboard"
              size="lg"
              fontWeight="bold"
              bgGradient="linear(to-r, purple.300, pink.400)"
              bgClip="text"
              letterSpacing="tight"
            >
              Algo Analyzer
            </Heading>
          </HStack>

          <HStack
            spacing={8}
            display={{ base: 'none', md: 'flex' }}
            fontSize="sm"
            color="gray.300"
          >
            <Text as={NextLink} href="/repository" _hover={{ color: 'purple.300' }} fontSize={{  lg: 'lg' }}>
              Repository
            </Text>
            <Text as={NextLink} href="/analysis" _hover={{ color: 'purple.300' }} fontSize={{  lg: 'lg' }}>
              Analysis
            </Text>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
