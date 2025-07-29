'use client';

import {
  Box,
  Badge,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react';
import { Clock, Zap } from 'lucide-react';
import NextLink from 'next/link';
import React from 'react';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface ProblemCardProps {
  /** The external (or internal) URL to open on click */
  href: string;
  title: string;
  difficulty: Difficulty;
  timeComplexity: string;
  spaceComplexity: string;
  notes: string[];           // still here if you need later
  tags: string[];            // "
}

const diffMap: Record<Difficulty, { bg: string; color: string }> = {
  Easy:   { bg: 'green.900',  color: 'green.300'  },
  Medium: { bg: 'yellow.900', color: 'yellow.300' },
  Hard:   { bg: 'red.900',    color: 'red.300'    },
};

export default function ProblemCard({
  href,
  title,
  difficulty,
  timeComplexity,
  spaceComplexity,
}: ProblemCardProps) {
  const cardBg   = '#0e0f14';
  const cardHoverBg = '#16181d';
  const sectionBg   = 'gray.800';
  const accent      = 'purple.300';

  return (
    <Box
      as={NextLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      bg={cardBg}
      rounded="2xl"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      shadow="lg"
      transition=".2s ease"
      _hover={{ bg: cardHoverBg, transform: 'translateY(-4px)' }}
      p={6}
      textDecor="none"      /* remove default link underline */
    >
      {/* Title + difficulty */}
      <Flex justify="space-between" align="start" mb={6}>
        <Heading size="md" color="gray.100" pr={4} noOfLines={2}>
          {title}
        </Heading>

        <Badge
          px={3}
          py={0.5}
          rounded="full"
          fontSize="xs"
          bg={diffMap[difficulty].bg}
          color={diffMap[difficulty].color}
        >
          {difficulty}
        </Badge>
      </Flex>

      {/* TC / SC boxes */}
      <Grid templateColumns="repeat(2,1fr)" gap={4}>
        {/* TC */}
        <Flex direction="column" bg={sectionBg} rounded="md" p={4}>
          <Icon as={Clock} w={4} h={4} color={accent} />
          <Text fontSize="xs" color="gray.400" mt={1}>
            TC
          </Text>
          <Text fontFamily="mono" color={accent} fontSize="sm">
            {timeComplexity}
          </Text>
        </Flex>

        {/* SC */}
        <Flex direction="column" bg={sectionBg} rounded="md" p={4}>
          <Icon as={Zap} w={4} h={4} color={accent} />
          <Text fontSize="xs" color="gray.400" mt={1}>
            SC
          </Text>
          <Text fontFamily="mono" color={accent} fontSize="sm">
            {spaceComplexity}
          </Text>
        </Flex>
      </Grid>
    </Box>
  );
}
