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
      <Heading size="lg" mb={6} color="white">
        Domains
      </Heading>

      {topics.length === 0 ? (
        <Text color="whiteAlpha.600">No problems saved yet.</Text>
      ) : (
        <Accordion allowMultiple>
          {topics.map(({ domain, algorithms }) => (
            <AccordionItem key={domain} border="none" mb={4}>
              {/* ── DOMAIN CARD ───────────────────────────────────── */}
              <AccordionButton
                px={5}
                py={4}                          /* bigger padding */
                bg="gray.800"
                _hover={{ bg: 'gray.700' }}
                _expanded={{ bg: 'gray.700' }}
                border="1px"
                borderColor="whiteAlpha.200"
                rounded="md"
              >
                <Flex flex="1" align="center" justify="space-between">
                  <Text fontSize="lg" color="white" fontWeight="medium">  {/* larger text */}
                    {domain}
                  </Text>
                  <HStack spacing={5}>
                    {/* <Text fontSize="sm" color="whiteAlpha.600">
                      {algorithms.length} algo{algorithms.length > 1 && 's'}
                    </Text> */}
                    {/* <Text fontSize="sm" color="whiteAlpha.600">
                      {algorithms.reduce((s, a) => s + a.count, 0)} solved
                    </Text> */}
                  </HStack>
                </Flex>
                <AccordionIcon color="whiteAlpha.600" />
              </AccordionButton>

              {/* ── ALGO LIST ─────────────────────────────────────── */}
              <AccordionPanel px={0} pt={3} pb={2}>
                <Box borderLeft="3px" borderColor="whiteAlpha.300" pl={10}> {/* thicker line + wider indent */}
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
                          bg="gray.800"
                          border="1px"
                          borderColor="whiteAlpha.200"
                          rounded="md"
                          px={4}
                          py={3}               /* smaller padding */
                          _hover={{ bg: 'gray.700' }}
                          transition="background 0.2s"
                        >
                          <Text color="white">{algo}</Text>
                          <Text fontSize="sm" color="whiteAlpha.600">
                            {count} Sovled
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
