'use client';

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
  chakra,
  Select,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';

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
};

// --- Single Card Component with Flip Animation ---
interface CardProps {
    data: MemoryCardData;
    isFlipped: boolean;
    onClick: () => void;
}

function FlippableCard({ data, isFlipped, onClick }: CardProps) {
    const difficultyColor = {
        Easy: 'green.400',
        Medium: 'yellow.400',
        Hard: 'red.400',
    };

    return (
        <Box
            w="100%"
            h="350px"
            onClick={onClick}
            cursor="pointer"
            style={{ perspective: '1000px' }}
        >
            <Box
                position="relative"
                w="100%"
                h="100%"
                style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
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
                    <Tag size="lg" colorScheme={difficultyColor[data.difficulty].split('.')[0]} variant="subtle">
                        <TagLabel>{data.difficulty}</TagLabel>
                    </Tag>
                    <Heading textAlign="center" size="lg" color="whiteAlpha.900">{data.name}</Heading>
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
                    <Box 
                        flex="1" 
                        overflowY="auto" 
                        p={3} 
                        bg="gray.900" 
                        borderRadius="md"
                        fontFamily="mono"
                        fontSize="sm"
                        color="gray.300"
                    >
                        <chakra.pre whiteSpace="pre-wrap" wordBreak="break-word">
                            {data.pseudoCode.join('\n')}
                        </chakra.pre>
                    </Box>
                    <HStack justify="space-around" pt={4}>
                        <VStack spacing={0} align="center">
                            <Text color="gray.400" fontSize="xs">Time</Text>
                            <Text color="whiteAlpha.900" fontWeight="bold">{data.timeComplexity}</Text>
                        </VStack>
                         <VStack spacing={0} align="center">
                            <Text color="gray.400" fontSize="xs">Space</Text>
                            <Text color="whiteAlpha.900" fontWeight="bold">{data.spaceComplexity}</Text>
                        </VStack>
                         <VStack spacing={0} align="center">
                            <Text color="gray.400" fontSize="xs">Algorithm</Text>
                            <Text color="whiteAlpha.900" fontWeight="bold">{data.keyAlgorithm}</Text>
                        </VStack>
                    </HStack>
                </Flex>
            </Box>
        </Box>
    );
}


// --- Main Memory Card Section Component ---
export default function MemoryCardSection() {
  const [allCards, setAllCards] = useState<MemoryCardData[]>([]);
  const [filteredCards, setFilteredCards] = useState<MemoryCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [animation, setAnimation] = useState<'next' | 'prev' | 'none'>('none');
  const [selectedDomain, setSelectedDomain] = useState('All');

  // --- MODIFIED DATA FETCHING LOGIC ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/user/memory-cards');
        if (!response.ok) {
          throw new Error('Failed to fetch memory cards');
        }
        const fetchedCards: MemoryCardData[] = await response.json();
        setAllCards(fetchedCards);
        setFilteredCards(fetchedCards);
      } catch (error) {
        console.error("Error fetching memory cards:", error);
        setAllCards([]);
        setFilteredCards([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const domains = useMemo(() => {
    const uniqueDomains = new Set(allCards.map(card => card.domain));
    return ['All', ...Array.from(uniqueDomains)];
  }, [allCards]);

  useEffect(() => {
    setIsFlipped(false);
    if (selectedDomain === 'All') {
        setFilteredCards(allCards);
    } else {
        setFilteredCards(allCards.filter(card => card.domain === selectedDomain));
    }
    setCurrentIndex(0);
  }, [selectedDomain, allCards]);

  const changeCard = (direction: 'next' | 'prev' | 'shuffle') => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setAnimation(direction === 'shuffle' ? 'next' : direction);

    setTimeout(() => {
        if (direction === 'next') {
            setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
        } else if (direction === 'prev') {
            setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
        } else {
            setFilteredCards(prev => [...prev].sort(() => Math.random() - 0.5));
            setCurrentIndex(0);
        }
        setAnimation('none');
    }, 200);
  };

  const currentCard = useMemo(() => filteredCards[currentIndex], [filteredCards, currentIndex]);

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
                >
                    {domains.map(domain => <option key={domain} value={domain}>{domain}</option>)}
                </Select>
                <Text color="gray.400" fontSize="sm" flexShrink={0}>
                    {isLoading ? '...' : `${filteredCards.length > 0 ? currentIndex + 1 : 0} / ${filteredCards.length}`}
                </Text>
            </HStack>
        </HStack>
        
        <Box h="350px" position="relative">
          {isLoading ? (
            <Center h="100%">
              <Spinner color="purple.400" />
            </Center>
          ) : filteredCards.length > 0 ? (
            filteredCards.map((card, index) => {
                const offset = (index - currentIndex + filteredCards.length) % filteredCards.length;
                const isCurrent = index === currentIndex;

                if (offset > 2) return null;

                return (
                    <Box
                        key={card.id}
                        position="absolute"
                        w="100%"
                        h="100%"
                        transition="all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)"
                        transform={`
                            translateX(${animation === 'next' && isCurrent ? '-150%' : animation === 'prev' && isCurrent ? '150%' : '0%'})
                            scale(${1 - offset * 0.05})
                            translateY(${offset * -10}px)
                        `}
                        zIndex={filteredCards.length - offset}
                        opacity={offset > 1 ? 0 : 1}
                    >
                        <FlippableCard 
                            data={card} 
                            isFlipped={isCurrent && isFlipped}
                            onClick={() => isCurrent && setIsFlipped(!isFlipped)}
                        />
                    </Box>
                )
            })
          ) : (
            <Center h="100%">
              <Text color="gray.500">No cards found for this topic.</Text>
            </Center>
          )}
        </Box>

        <HStack justify="center" spacing={4}>
            <IconButton
                aria-label="Previous card"
                icon={<ArrowLeft />}
                isRound
                size="lg"
                onClick={() => changeCard('prev')}
                isDisabled={isLoading || animation !== 'none' || filteredCards.length < 2}
            />
            <IconButton
                aria-label="Shuffle deck"
                icon={<Shuffle />}
                isRound
                size="lg"
                onClick={() => changeCard('shuffle')}
                isDisabled={isLoading || animation !== 'none' || filteredCards.length < 2}
                colorScheme="purple"
            />
            <IconButton
                aria-label="Next card"
                icon={<ArrowRight />}
                isRound
                size="lg"
                onClick={() => changeCard('next')}
                isDisabled={isLoading || animation !== 'none' || filteredCards.length < 2}
            />
        </HStack>
      </VStack>
    </Box>
  );
}
