'use client';

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
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { Clock, Code, ExternalLink, MemoryStick, NotebookText } from 'lucide-react';
import { CodeWindow } from './CodeWindow'; // Import CodeWindow component


type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface ProblemCardProps {
  href: string;
  title: string;
  difficulty: Difficulty;
  timeComplexity: string;
  spaceComplexity: string;
  pseudoCode: string[]; // pseudoCode coming from the database
  notes: string; 
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
  notes,
}: ProblemCardProps) {
  // A separate disclosure hook for each modal
  const { isOpen: isPseudoCodeOpen, onOpen: onPseudoCodeOpen, onClose: onPseudoCodeClose } = useDisclosure();
  const { isOpen: isNotesOpen, onOpen: onNotesOpen, onClose: onNotesClose } = useDisclosure();

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

       {/* Buttons for opening problem, pseudo code, and notes */}
      <Flex gap={1} align="center" mb={3}>
        <Tooltip label="Show Pseudo Code" placement="top" hasArrow>
          <IconButton
            variant="ghost"
            size="sm"
            colorScheme="purple"
            icon={<Code size={"25"}/>}
            onClick={onPseudoCodeOpen}
            aria-label="Show Pseudo Code"
          />
        </Tooltip>

        {/* --- NEW NOTES BUTTON --- */}
        <Tooltip label="Show Notes" placement="top" hasArrow isDisabled={!notes}>
          <IconButton
            variant="ghost"
            size="sm"
            colorScheme="purple"
            icon={<NotebookText size={"25"}/>}
            onClick={onNotesOpen}
            aria-label="Show Notes"
            isDisabled={!notes}
          />
        </Tooltip>

        <Tooltip label="Open Problem Link" placement="top" hasArrow>
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
        </Tooltip>
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
      <Modal isOpen={isPseudoCodeOpen} onClose={onPseudoCodeClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.900" borderColor="whiteAlpha.200">
          <ModalHeader color="white">Pseudo Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CodeWindow lines={pseudoCode} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onPseudoCodeClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- NEW MODAL FOR NOTES --- */}
      <Modal isOpen={isNotesOpen} onClose={onNotesClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.900" borderColor="whiteAlpha.200">
          <ModalHeader color="white">Notes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text whiteSpace="pre-wrap" color="gray.300">
              {notes}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onNotesClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
