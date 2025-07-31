// src/app/(protected)/repository/page.tsx
import {
  Box, Heading, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, Flex, HStack, Text, VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { slugify } from '@/app/utils/slugify';

// ---------- helper type for the two selected fields ----------
type DomainAlgoRow = { domain: string; keyAlgorithm: string };

export default async function RepositoryHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  const rows = await prisma.problem.findMany({
    where: { userId },
    select: { domain: true, keyAlgorithm: true },
  });

  const map = new Map<string, Map<string, number>>();

  // ---------- annotate the param so TS knows the shape ----------
  rows.forEach(({ domain, keyAlgorithm }: DomainAlgoRow) => {
    if (!domain || !keyAlgorithm) return;
    if (!map.has(domain)) map.set(domain, new Map());
    const m = map.get(domain)!;
    m.set(keyAlgorithm, (m.get(keyAlgorithm) ?? 0) + 1);
  });

  const topics = Array.from(map.entries()).map(([domain, algos]) => ({
    domain,
    algorithms: Array.from(algos.entries()).map(([algo, count]) => ({
      algo,
      count,
    })),
  }));

  return (
    <Box px={{ base: 4, md: 8 }} py={8} maxW="6xl" mx="auto">
      <Heading size="xl" mb={8} color="whiteAlpha.900" fontWeight="extrabold">
        Your Repository
      </Heading>

      {topics.length === 0 ? (
        <Text color="whiteAlpha.600" fontSize="lg" mt={4}>
          No problems saved yet. Start solving and add them here!
        </Text>
      ) : (
        <Accordion allowMultiple>
          {topics.map(({ domain, algorithms }) => (
            <AccordionItem key={domain} border="none" mb={4}>
              {/* ── DOMAIN CARD ───────────────────────────────────── */}
              <AccordionButton
                px={6}
                py={5}
                bg="gray.900" // Darker background for subtlety
                _hover={{ bg: 'gray.800', transform: 'translateY(-2px)' }} // Subtle lift on hover
                _expanded={{ bg: 'gray.800', transform: 'translateY(-2px)' }}
                border="1px"
                borderColor="whiteAlpha.100" // Very subtle border
                rounded="lg"
                transition="all 0.2s ease-in-out" // Smooth transition for hover effects
              >
                <Flex flex="1" align="center" justify="space-between">
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    // Apply gradient if possible, otherwise use a suitable color
                    // For a true gradient on text, you'd typically need a custom component or more CSS
                    color="whiteAlpha.900"
                  >
                    {domain}
                  </Text>
    
                </Flex>
                <AccordionIcon color="whiteAlpha.500" boxSize={6} />
              </AccordionButton>

              {/* ── ALGO LIST ─────────────────────────────────────── */}
              <AccordionPanel px={0} pt={4} pb={2}>
                <Box
                  borderLeft="3px"
                  borderColor="linear-gradient(to bottom, #8A2BE2, #00CED1)" // Attempting gradient border, but might need custom CSS
                  pl={10} // Slightly less indent for minimalism
                >
                  <VStack spacing={3} align="stretch">
                    {algorithms.map(({ algo, count }) => (
                      <Box
                        as={Link}
                        key={algo}
                        href={`/repository/${slugify(domain)}/${slugify(algo)}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Flex
                          align="center"
                          justify="space-between"
                          bg="gray.800" // Slightly lighter than domain card for distinction
                          border="1px"
                          borderColor="whiteAlpha.50" // Even more subtle border
                          rounded="md"
                          px={4}
                          py={3}
                          _hover={{ bg: 'gray.700', transform: 'translateY(-1px)' }} // Subtle lift on hover
                          transition="all 0.2s ease-in-out"
                        >
                          <Text color="whiteAlpha.800" fontSize="md">{algo}</Text>
                          <Text fontSize="sm" color="whiteAlpha.400">
                            {count} Solved
                          </Text>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </Box>
  )
}