// src/app/components/Feature.tsx
'use client';

import { Box, Flex, VStack, Heading, Text, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ElementType } from 'react';   // ← NEW

const MotionBox = motion(Box);

interface FeatureProps {
  icon: ElementType;      // ← was `any`
  title: string;
  desc: string;
  delay?: number;
}

export function Feature({ icon, title, desc, delay = 0 }: FeatureProps) {
  return (
    <MotionBox
      position="relative"
      pt={8}
      textAlign="center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay }}
    >
      <Flex
        position="absolute"
        top={0}
        left="50%"
        transform="translate(-50%, -50%)"
        w="56px"
        h="56px"
        rounded="full"
        align="center"
        justify="center"
        bgGradient="linear(to-r, rgba(139,92,246,0.55), rgba(236,72,153,0.55))"
        shadow="lg"
        border="3px solid"
        borderColor="rgba(255,255,255,0.18)"
      >
        {/* `icon` is now strongly-typed */}
        <Icon as={icon} boxSize={6} color="white" />
      </Flex>

      <VStack
        spacing={3}
        rounded="lg"
        px={8}
        py={10}
        bg="rgba(255,255,255,0.05)"
        _hover={{ bg: 'rgba(255,255,255,0.08)' }}
        transition="0.2s ease"
        backdropFilter="blur(6px)"
        border="1px solid"
        borderColor="whiteAlpha.200"
        shadow="xl"
        minH="220px"
      >
        <Heading size="md">{title}</Heading>
        <Text fontSize="sm" color="whiteAlpha.800" lineHeight="1.4">
          {desc}
        </Text>
      </VStack>
    </MotionBox>
  );
}
