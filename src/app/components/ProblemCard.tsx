'use client';

import { useState } from 'react';
import {
  Box,
  Badge,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  IconButton
} from '@chakra-ui/react';
import { Clock, Zap, Code, ExternalLink, MemoryStick } from 'lucide-react';
import { CodeWindow } from './CodeWindow'; // Import CodeWindow component

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface ProblemCardProps {
  href: string;
  title: string;
  difficulty: Difficulty;
  timeComplexity: string;
  spaceComplexity: string;
  pseudoCode: string[]; // pseudoCode coming from the database
}

const diffMap: Record<Difficulty, { bg: string; color: string }> = {
  Easy: { bg: 'green.900', color: 'green.300' },
  Medium: { bg: 'yellow.900', color: 'yellow.300' },
  Hard: { bg: 'red.900', color: 'red.300' },
};

export default function ProblemCard({
  href,
  title,
  difficulty,
  timeComplexity,
  spaceComplexity,
  pseudoCode, // using the pseudoCode passed down from the parent component
}: ProblemCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = '#0e0f14';
  const cardHoverBg = '#16181d';
  const sectionBg = 'gray.800';
  const accent = 'purple.300';

  return (
    <Box
      rel="noopener noreferrer"
      bg={cardBg}
      rounded="2xl"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      shadow="lg"
      transition=".2s ease"
      _hover={{ bg: cardHoverBg, transform: 'translateY(-4px)' }}
      p={6}
      textDecor="none"
    >
      {/* Title + difficulty */}
      <Flex justify="space-between" align="start" mb={4}>
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

       {/* Buttons for opening problem and showing pseudo code */}
     <Flex gap={1} align="center" mb={3}>
      <IconButton
        variant="ghost"
        size="sm"
        colorScheme="purple"
        icon={<Code size={"25"}/>}
        onClick={onOpen}
        aria-label="Show Pseudo Code"
      />

      <IconButton
        variant="ghost"
        size="sm"
        colorScheme="purple"
        icon={<ExternalLink 
          size={"23"}
        />}
        onClick={() => window.open(href, '_blank')}
        aria-label="Open Problem"
      />
    </Flex>

      {/* TC / SC boxes with Icons above them */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={6}>
        {/* TC */}
        <Flex direction="column" bg={sectionBg} rounded="md" p={4} align="center">
          <Icon as={Clock} w={6} h={6} color={accent} />
          <Text fontSize="xs" color="gray.400" mt={1}>
            TC
          </Text>
          <Text fontFamily="mono" color={accent} fontSize="sm">
            {timeComplexity}
          </Text>
        </Flex>

        {/* SC */}
        <Flex direction="column" bg={sectionBg} rounded="md" p={4} align="center">
          <Icon as={MemoryStick} w={6} h={6} color={accent} />
          <Text fontSize="xs" color="gray.400" mt={1}>
            SC
          </Text>
          <Text fontFamily="mono" color={accent} fontSize="sm">
            {spaceComplexity}
          </Text>
        </Flex>
      </Grid>

     

      {/* Modal for pseudo code */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.900" borderColor="whiteAlpha.200">
          <ModalHeader color="white">Pseudo Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Use CodeWindow for displaying the pseudo code */}
            <CodeWindow lines={pseudoCode} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
