'use client'

import { Container, Heading, Text, Button, VStack, Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export function FinalCTA() {
  const router = useRouter()
  return (
    <Box 
      as="section" 
      bg="black" 
      color="white" 
      py={24} 
      position="relative" 
      overflow="hidden"
    >
      {/* Subtle background pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgImage="radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)"
        bgSize="30px 30px"
        opacity={0.5}
        zIndex={0}
      />

      {/* More focused background glow */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="800px" // More contained width
        height="800px"
        bgGradient="radial(circle, purple.600 -10%, transparent 70%)"
        filter="blur(120px)"
        opacity={0.15} // More subtle opacity
        zIndex={0}
      />

      <Container maxW="800px" textAlign="center" position="relative" zIndex={1}>
        <VStack
          spacing={6} // Slightly reduced spacing
          p={{ base: 8, md: 12 }}
          bg="whiteAlpha.100" // A bit more opaque for readability
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="3xl"
          backdropFilter="blur(12px)"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)" // Subtle shadow for depth
        >
          <Heading size={{ base: 'xl', md: '2xl' }} fontWeight="bold">
            Begin Your Analysis
          </Heading>
          <Text color="gray.300" fontSize={{ base: 'md', md: 'lg' }} maxW="xl">
            Unlock a deeper understanding of your algorithms. Create your personal knowledge base for free.
          </Text>
          <Button
            size="lg"
            px={10}
            py={7}
            fontSize="lg"
            rounded="full"
            bgGradient="linear(to-r, purple.400, pink.400)"
            _hover={{ 
              bgGradient: 'linear(to-r, purple.500, pink.500)',
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            transition="all 0.2s"
            onClick={() => router.push('/signup')}
          >
            Create Your Account
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}
