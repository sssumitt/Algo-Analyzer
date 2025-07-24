// app/sections/FinalCTA.tsx
'use client'
import { Container, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export function FinalCTA() {
  const router = useRouter()
  return (
    <Container maxW="800px" textAlign="center" py={24}>
      <VStack spacing={4}>
        <Heading size="lg">Ready to map your algorithm brain?</Heading>
        <Text color="gray.300" maxW="lg">
          Start free today and build a knowledge graph of everything you’ve learned.
        </Text>
        <Button
          size="lg"
          bgGradient="linear(to-r, purple.400, pink.400)"
          _hover={{ bgGradient: 'linear(to-r, purple.500, pink.500)' }}
          onClick={() => router.push('/signup')}
        >
          Create Your Account
        </Button>
      </VStack>
    </Container>
  )
}
