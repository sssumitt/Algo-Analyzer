'use client';

// --- Imports ---
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  IconButton,
  Flex,
  Tag,
  TagLabel,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Shuffle, NotebookText } from 'lucide-react';
import { CodeWindow } from '@/app/components/CodeWindow';

// --- Type Definitions ---
type MemoryCardData = {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeComplexity: string;
  spaceComplexity: string;
  keyAlgorithm: string;
  pseudoCode: string[];
  domain: string;
  notes: string; // <-- Added notes field
};

interface CardProps {
  data: MemoryCardData;
  isFlipped: boolean;
  onClick: () => void;
}

// --- Single Card Component (with flip animation) ---
function FlippableCard({ data, isFlipped, onClick }: CardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const difficultyColor = {
    Easy: 'green.400',
    Medium: 'yellow.400',
    Hard: 'red.400',
  };

  // This function handles opening the notes modal and stops the card from flipping
  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    onOpen();
  };

  const NotesButton = () => (
    <Tooltip label="View Notes" hasArrow placement="top">
      <IconButton
        aria-label="View Notes"
        icon={<NotebookText />}
        isRound
        size="sm"
        variant="ghost"
        color="gray.400"
        position="absolute"
        top={4}
        right={4}
        onClick={handleNotesClick}
        isDisabled={!data.notes}
        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
      />
    </Tooltip>
  );

  return (
    <>
      <Box
        w="100%"
        h="100%"
        onClick={onClick}
        cursor="pointer"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {/* Front of the card */}
          <Flex
            position="absolute"
            w="100%"
            h="100%"
            p={6}
            bg="#2D2D2D"
            borderRadius="xl"
            direction="column"
            justify="space-between"
            align="center"
            border="1px"
            borderColor="rgba(255, 255, 255, 0.1)"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <NotesButton />
            <Tag
              size="lg"
              colorScheme={difficultyColor[data.difficulty]?.split('.')[0] || 'gray'}
              variant="subtle"
            >
              <TagLabel>{data.difficulty}</TagLabel>
            </Tag>
            <Heading textAlign="center" size="lg" color="whiteAlpha.900">
              {data.name}
            </Heading>
            <Text color="gray.500">Click to reveal</Text>
          </Flex>

          {/* Back of the card */}
          <Flex
            position="absolute"
            w="100%"
            h="100%"
            p={6}
            bg="#242424"
            borderRadius="xl"
            align="stretch"
            justify="space-between"
            direction="column"
            border="1px"
            borderColor="rgba(255, 255, 255, 0.1)"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <NotesButton />
            <Box
              flex="1"
              overflowY="auto"
              p={3}
              mt={8} // Add margin to avoid overlapping with the notes button
              bg="gray.900"
              borderRadius="md"
              fontFamily="mono"
              fontSize="sm"
              color="gray.300"
            >
              <CodeWindow lines={data.pseudoCode} />
            </Box>
            <HStack justify="space-around" pt={4}>
              <VStack spacing={0} align="center">
                <Text color="gray.400" fontSize="xs">Time</Text>
                <Text color="whiteAlpha.900" fontWeight="bold">
                  {data.timeComplexity}
                </Text>
              </VStack>
              <VStack spacing={0} align="center">
                <Text color="gray.400" fontSize="xs">Space</Text>
                <Text color="whiteAlpha.900" fontWeight="bold">
                  {data.spaceComplexity}
                </Text>
              </VStack>
              <VStack spacing={0} align="center">
                <Text color="gray.400" fontSize="xs">Algorithm</Text>
                <Text color="whiteAlpha.900" fontWeight="bold">
                  {data.keyAlgorithm}
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </motion.div>
      </Box>

      {/* Notes Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.900" color="white">
          <ModalHeader>Notes for {data.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text whiteSpace="pre-wrap">{data.notes}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// --- Motion-wrapped Box component ---
const MotionBox = motion(Box);


// --- Main Memory Card Section Component ---
export default function MemoryCardSection() {
  // --- State Declarations ---
  const [allCards, setAllCards] = useState<MemoryCardData[]>([]);
  const [filteredCards, setFilteredCards] = useState<MemoryCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState('All');

  // --- Data Fetching and Filtering ---
  useEffect(() => {
    const fetchMemoryCards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/user/memory-cards');
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        const data: MemoryCardData[] = await response.json();
        setAllCards(data);
        setFilteredCards(data);
      } catch (err: unknown) {
        let errorMessage = "Could not load cards.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        console.error("Failed to fetch memory cards:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemoryCards();
  }, []);

  const domains = useMemo(() => {
    const uniqueDomains = new Set(allCards.map((card) => card.domain));
    return ['All', ...Array.from(uniqueDomains)];
  }, [allCards]);

  useEffect(() => {
    setIsFlipped(false);
    if (selectedDomain === 'All') {
      setFilteredCards(allCards);
    } else {
      setFilteredCards(allCards.filter((card) => card.domain === selectedDomain));
    }
    setCurrentIndex(0);
  }, [selectedDomain, allCards]);


  // --- Animation and Navigation Logic ---
  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const changeCard = (newDirection: number) => {
    if (isLoading || !filteredCards.length) return;
    setIsFlipped(false);
    setDirection(newDirection);

    if (newDirection > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }
  };

  const shuffleCards = () => {
    if (isLoading || filteredCards.length < 2) return;
    setIsFlipped(false);
    setDirection(1);

    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    if (shuffled.length > 1 && shuffled[0].id === filteredCards[currentIndex]?.id) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    setFilteredCards(shuffled);
    setCurrentIndex(0);
  };


  // --- JSX Rendering ---
  return (
    <Box
      p={{ base: 5, md: 6 }}
      bg="#1C1C1E"
      borderRadius="xl"
      w="100%"
      border="1px"
      borderColor="whiteAlpha.100"
    >
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between" wrap="wrap" gap={2}>
          <Heading as="h3" size="md" color="whiteAlpha.900">
            Memory Cards
          </Heading>
          <HStack>
            <Select
              size="sm"
              borderRadius="md"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              bg="gray.800"
              borderColor="gray.700"
              _hover={{ borderColor: 'gray.600' }}
              _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #B794F4' }}
              isDisabled={isLoading || !!error}
            >
              {domains.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </Select>
            <Text
              color="gray.400"
              fontSize="sm"
              flexShrink={0}
              w="55px"
              textAlign="right"
            >
              {isLoading
                ? '...'
                : `${filteredCards.length > 0 ? currentIndex + 1 : 0} / ${filteredCards.length}`}
            </Text>
          </HStack>
        </HStack>
        
        <Box
          h="350px"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          {isLoading ? (
            <Spinner color="purple.400" />
          ) : error ? (
            <Text color="red.400">{error}</Text>
          ) : filteredCards.length > 0 ? (
            <AnimatePresence initial={false} custom={direction}>
              <MotionBox
                key={currentIndex}
                w="100%"
                h="100%"
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                position="absolute"
              >
                <FlippableCard
                  data={filteredCards[currentIndex]}
                  isFlipped={isFlipped}
                  onClick={() => setIsFlipped(!isFlipped)}
                />
              </MotionBox>
            </AnimatePresence>
          ) : (
            <Text color="gray.500">
              {allCards.length > 0 ? `No cards found for "${selectedDomain}".` : 'No memory cards available.'}
            </Text>
          )}
        </Box>

        <HStack justify="center" spacing={4}>
          <IconButton
            aria-label="Previous card"
            icon={<ArrowLeft />}
            isRound size="lg"
            onClick={() => changeCard(-1)}
            isDisabled={isLoading || !!error || filteredCards.length < 2}
          />
          <IconButton
            aria-label="Shuffle deck"
            icon={<Shuffle />}
            isRound size="lg"
            onClick={shuffleCards}
            isDisabled={isLoading || !!error || filteredCards.length < 2}
            colorScheme="purple"
          />
          <IconButton
            aria-label="Next card"
            icon={<ArrowRight />}
            isRound size="lg"
            onClick={() => changeCard(1)}
            isDisabled={isLoading || !!error || filteredCards.length < 2}
          />
        </HStack>
      </VStack>
    </Box>
  );
}
