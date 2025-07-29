// src/app/sections/HowItWorksSection.tsx
'use client'

import { Container, Heading, SimpleGrid, Text, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface StepProps {
  number: string
  title: string
  desc: string
}

function Step({ number, title, desc }: StepProps) {
  return (
    <MotionBox
      pos="relative" 
      p={6}
      rounded="lg"
      bg="rgba(255,255,255,0.04)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Box
        position="absolute"
        top="-12px"
        left="16px"
        bgGradient="linear(to-r, purple.400, pink.400)"
        color="white"
        fontSize="xs"
        fontWeight="bold"
        rounded="full"
        px={3}
        py={1}
      >
        {number}
      </Box>
      <Heading size="md" mt={4}>
        {title}
      </Heading>
      <Text fontSize="sm" color="gray.300" mt={2}>
        {desc}
      </Text>
    </MotionBox>
  )
}

export function HowItWorksSection() {
  return (
    <Container maxW="1200px" px={{ base: 6, md: 10 }} py={20}>
      <Heading size="lg" mb={8}>
        How It Works
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} position="relative">
        <Step
          number="1"
          title="Upload"
          desc="Paste or drag your function. We parse the AST and tag it automatically."
        />
        <Step
          number="2"
          title="Analyze"
          desc="Infer time & space complexity and generate English pseudocode."
        />
        <Step
          number="3"
          title="Review"
          desc="Explore memory cards and your knowledge graph to solidify concepts."
        />
      </SimpleGrid>
    </Container>
  )
}
