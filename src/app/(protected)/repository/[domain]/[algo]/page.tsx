import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import ProblemCard from '@/app/components/ProblemCard';
import React from 'react';

/* helpers */
const toSlug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '-');
const toLabel = (slug: string) =>
  slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/* types */
type RouteParams = { domain: string; algo: string };
interface PageProps { params?: Promise<RouteParams>; }

export default async function CollectionPage({ params }: PageProps) {
  const p = params ? await params : undefined;
  if (!p) notFound();

  const domainLabel = toLabel(p.domain);
  const algoLabel = toLabel(p.algo);

  const problems = await prisma.problem.findMany({
    where: {
      domain: { equals: domainLabel, mode: 'insensitive' },
      keyAlgorithm: { equals: algoLabel, mode: 'insensitive' },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      analyses: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  return (
    <Box maxW="7xl" mx="auto" px={6} py={10}>
      <Heading size="2xl" color="white" mb={5}>
        Problems
      </Heading>

      <Text color="gray.400" mb={8}>
        {domainLabel} / {algoLabel}
      </Text>

      {problems.length === 0 ? (
        <Text color="gray.500">No problems analysed yet.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={8}>
          {problems.map((prob: typeof problems[number]) => {
            const a = prob.analyses[0];
            if (!a) return null;

            return (
              <ProblemCard
                key={prob.id}
                href={prob.url}
                title={prob.name}
                difficulty={prob.difficulty as 'Easy' | 'Medium' | 'Hard'}
                timeComplexity={a.time}
                spaceComplexity={a.space}
                pseudoCode={a.pseudoCode as string[]}
              />
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
