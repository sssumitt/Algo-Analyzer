'use client'

import { Heading, Text, Button, Stack, Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export function HeroContent() {
  const router = useRouter()

  return (
    <Box 
      position="absolute" 
      top="50%" 
      left="2%" // Positioned towards the left
      transform="translateY(-50%)" // Only correct vertical alignment
      zIndex={10} // Ensure it's on top of the canvas
      p={{ base: 4, md: 8 }} // Add some padding
     
    >
      <Stack spacing={6} maxW="lg">
        <Heading
          size="2xl"
          lineHeight="1.1"
          bgGradient="linear(to-r, purple.300, pink.300)"
          bgClip="text"
        >
          Store & Analyze Algorithms
        </Heading>
        <Text fontSize="md" color="gray.300">
          Transform your code into an interconnected library
          of algorithms, visualized and understood
        </Text>
        <Button
          mt={2}
          alignSelf="flex-start"
          size="lg"
          rounded="full"
          bgGradient="linear(to-r, purple.400, pink.300)"
          _hover={{ bgGradient: 'linear(to-r, purple.500, pink.400)' }}
          onClick={() => router.push('/signup?mode=register')}
        >
          Get Started Free
        </Button>
      </Stack>
    </Box>
  )
}
