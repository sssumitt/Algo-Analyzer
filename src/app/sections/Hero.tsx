// app/sections/Hero.tsx
'use client'
import { Container, Flex, Stack, Box, Heading, Text, Button, Input, HStack } from '@chakra-ui/react'
import { CodeWindow } from '../components/CodeWindow'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Hero() {
  const router = useRouter()
  const [snippet, setSnippet] = useState('')

  return (
    <Container maxW="1200px" px={{ base: 6, md: 10 }} pb={16} pt={{ base: 4, md: 8 }}>
      <Flex gap={{ base: 10, lg: 20 }} direction={{ base: 'column', lg: 'row' }}>
        <Stack spacing={6} flex="1">
          <Box
            bg="purple.700"
            px={3}
            py={1}
            rounded="full"
            fontSize="xs"
            fontWeight="semibold"
            w="fit-content"
            letterSpacing="wide"
          >
            We&apos;re in Beta!
          </Box>
          <Heading
            size="2xl"
            lineHeight="1.1"
            bgGradient="linear(to-r, purple.300, pink.300)"
            bgClip="text"
          >
            Store & Analyze Algorithms
          </Heading>
          <Text fontSize="md" color="gray.300" maxW="lg">
            Upload code, auto‑extract time/space complexity & human‑readable steps. Tag algorithms
            by technique and build a connected knowledge base.
          </Text>

          <HStack
            spacing={3}
            bg="rgba(255,255,255,0.05)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            rounded="md"
            p={3}
            w="100%"
            maxW="440px"
          >
            <Input
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="Paste a function..."
              fontSize="xs"
              variant="unstyled"
            />
            <Button
              size="sm"
              bgGradient="linear(to-r, purple.400, pink.400)"
              _hover={{ bgGradient: 'linear(to-r, purple.500, pink.500)' }}
              onClick={() => router.push('/repository')}
            >
              Analyze
            </Button>
          </HStack>

          <Button
            mt={2}
            alignSelf="flex-start"
            size="lg"
            rounded="full"
            bgGradient="linear(to-r, purple.400, pink.300)"
            _hover={{ bgGradient: 'linear(to-r, purple.500, pink.400)' }}
            onClick={() => router.push('/signup')}
          >
            Get Started Free
          </Button>
        </Stack>

        <Flex flex="1" justify="center" position="relative" h="360px">
          <Box position="absolute" top="0" left={{ base: 0, md: '40px' }}>
            <CodeWindow
              lines={[
                'analyze(upload){',
                '  parseAST();',
                '  inferComplexity();',
                '  generateEnglish();',
                '}',
              ]}
            />
          </Box>
          <Box position="absolute" bottom="0" right={{ base: 0, md: '40px' }}>
            <CodeWindow
              lines={[
                'Result:',
                'Time: O(V + E)',
                'Space: O(V)',
                'Tags: Graph, DFS',
              ]}
            />
          </Box>
        </Flex>
      </Flex>
    </Container>
  )
}
