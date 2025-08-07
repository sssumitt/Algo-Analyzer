// src/app/(protected)/repository/views/filtered-view.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Box,
  Flex,
  Heading,
  VStack,
  Text,
  Spinner,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Icon,
  HStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { getFilteredProblems, FilteredProblem, ProblemFilters } from '../actions';
import ProblemCard from '@/app/components/ProblemCard';
import { FaThLarge, FaCodeBranch } from 'react-icons/fa'; // Example icons

interface FilteredViewProps {
  allDomains: string[];
  allAlgorithms: string[];
}

// A custom, clickable "pill" for selecting a filter option.
const FilterPill = ({
  label,
  isSelected,
  onClick,
  colorScheme = 'gray',
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  colorScheme?: string;
}) => (
  <Button
    size="sm"
    variant="outline"
    borderRadius="full"
    onClick={onClick}
    bg={isSelected ? `${colorScheme}.900` : 'gray.800'}
    borderColor={isSelected ? `${colorScheme}.500` : 'whiteAlpha.200'}
    color={isSelected ? `${colorScheme}.200` : 'whiteAlpha.800'}
    _hover={{
      bg: isSelected ? `${colorScheme}.800` : 'gray.700',
      borderColor: isSelected ? `${colorScheme}.400` : 'whiteAlpha.300',
    }}
    transition="all 0.2s ease-in-out"
  >
    {label}
  </Button>
);

export default function FilteredView({ allDomains, allAlgorithms }: FilteredViewProps) {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([]);
  const [results, setResults] = useState<FilteredProblem[]>([]);
  const [isPending, startTransition] = useTransition();

  // This effect runs initially and whenever filters change
  useEffect(() => {
    const filters: ProblemFilters = {
      domains: selectedDomains,
      algorithms: selectedAlgos,
    };
    startTransition(async () => {
      const problems = await getFilteredProblems(filters);
      setResults(problems);
    });
  }, [selectedDomains, selectedAlgos]);

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleAlgoToggle = (algo: string) => {
    setSelectedAlgos(prev =>
      prev.includes(algo) ? prev.filter(a => a !== algo) : [...prev, algo]
    );
  };

  const clearFilters = () => {
    setSelectedDomains([]);
    setSelectedAlgos([]);
  };

  return (
    <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
      {/* Stylish Sidebar Widget */}
      <Box
        as="aside"
        w={{ base: '100%', md: '300px' }}
        alignSelf="flex-start"
        // --- THIS IS THE FIX ---
        // Be sticky on desktop, but a normal block on mobile
        position={{ base: 'static', md: 'sticky' }}
        top="80px"
        p={2}
      >
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" px={4} pt={2}>
            <Heading size="md">Filters</Heading>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearFilters}
              isDisabled={selectedDomains.length === 0 && selectedAlgos.length === 0}
            >
              Clear All
            </Button>
          </HStack>

          {/* Domains Filter Card */}
          <Card bg="gray.900" variant="outline" borderColor="whiteAlpha.100">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Icon as={FaThLarge} color="blue.400" />
                  <Heading size="sm">Domains</Heading>
                </HStack>
                <Wrap spacing={2} overflowY="auto"  maxHeight={'200px'} className="scrollbar-hidden">
                  {allDomains.map(domain => (
                    <WrapItem key={domain}>
                      <FilterPill
                        label={domain}
                        isSelected={selectedDomains.includes(domain)}
                        onClick={() => handleDomainToggle(domain)}
                        colorScheme="blue"
                      />
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            </CardBody>
          </Card>

          {/* Algorithms Filter Card */}
          <Card bg="gray.900" variant="outline" borderColor="whiteAlpha.100"  >
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Icon as={FaCodeBranch} color="green.400" />
                  <Heading size="sm">Algorithms</Heading>
                </HStack>
                <Wrap spacing={2} overflowY="auto"  maxHeight={'200px'} className="scrollbar-hidden">
                  {allAlgorithms.map(algo => (
                    <WrapItem key={algo} >
                      <FilterPill
                        label={algo}
                        isSelected={selectedAlgos.includes(algo)}
                        onClick={() => handleAlgoToggle(algo)}
                        colorScheme="green"
                      />
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>

      {/* Main Content Area */}
      <Box flex="1" minW={0}>
        <Heading size="lg" mb={6}>Results ({isPending ? '...' : results.length})</Heading>
        {isPending ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : results.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6} overflowY={'auto'} >
            {results.map((prob) => <ProblemCard
                            key={prob.id}
                            href={prob.url}
                            title={prob.title}
                            difficulty={prob.difficulty as 'Easy' | 'Medium' | 'Hard'}
                            timeComplexity={prob.timeComplexity}
                            spaceComplexity={prob.spaceComplexity}
                            pseudoCode={prob.pseudoCode as string[]}
                            notes={prob.notes}
                          />)}
          </SimpleGrid>
        ) : (
          <Box bg="gray.800" p={8} borderRadius="lg" textAlign="center">
            <Heading size="md" mb={2}>No Problems Found</Heading>
            <Text color="whiteAlpha.600">Try adjusting your filters or adding a new problem.</Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
}
