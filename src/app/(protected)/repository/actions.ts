// src/app/(protected)/repository/actions.ts
'use server'; // This is a Server Action

import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

// Define the shape of our filters
export interface ProblemFilters {
  domains?: string[];
  algorithms?: string[];
}

// Define the shape of the data we will return for the card component
export type FilteredProblem = {
  id: string;
  url: string;
  title: string;
  difficulty: string;
  timeComplexity: string;
  spaceComplexity: string;
  pseudoCode: Prisma.JsonValue | null;
  notes: string;
};

/**
 * Fetches problems from the database based on selected filters,
 * including data from the latest analysis for each problem.
 * This function runs only on the server.
 * @param filters - An object containing arrays of selected domains and algorithms.
 * @returns A promise that resolves to an array of problems formatted for the display card.
 */
export async function getFilteredProblems(filters: ProblemFilters): Promise<FilteredProblem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
  }

  // Construct the Prisma 'where' clause dynamically based on the filters
  const whereClause: Prisma.ProblemWhereInput = {
    userId: session.user.id,
  };

  if (filters.domains && filters.domains.length > 0) {
    whereClause.domain = { in: filters.domains };
  }

  if (filters.algorithms && filters.algorithms.length > 0) {
    whereClause.keyAlgorithm = { in: filters.algorithms };
  }

  // Fetch problems and include the LATEST analysis for each one
  const problemsWithAnalyses = await prisma.problem.findMany({
    where: whereClause,
    select: {
      id: true,
      url: true,
      name: true, // This corresponds to 'title'
      difficulty: true,
      analyses: {
        orderBy: {
          createdAt: 'desc', // Order analyses by date to get the most recent
        },
        select: {
          time: true,       // This is timeComplexity
          space: true,      // This is spaceComplexity
          pseudoCode: true,
          notes: true,
        },
        take: 1, // Crucially, only take the most recent one
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Map the nested data structure from Prisma to the flat structure our component expects
  return problemsWithAnalyses.map(problem => {
    const latestAnalysis = problem.analyses[0]; // We only took one, so it's the first in the array

    return {
      id: problem.id,
      url: problem.url,
      title: problem.name,
      difficulty: problem.difficulty,
      // Provide fallback values in case a problem somehow has no analysis
      timeComplexity: latestAnalysis?.time ?? 'N/A',
      spaceComplexity: latestAnalysis?.space ?? 'N/A',
      pseudoCode: latestAnalysis?.pseudoCode ?? null,
      notes: latestAnalysis?.notes ?? '',
    };
  });
}


/**
 * Fetches all unique domains and algorithms for the currently logged-in user.
 * This is used to populate the filter options in the UI.
 * @returns A promise that resolves to an object containing arrays of unique domains and algorithms.
 */
export async function getFilterOptions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { domains: [], algorithms: [] };
  }
  const userId = session.user.id;

  const domainOptions = await prisma.problem.findMany({
    where: { userId }, // Filter by the current user
    distinct: ['domain'],
    select: { domain: true },
    orderBy: { domain: 'asc' },
  }).then(items => items.map(item => item.domain).filter(Boolean) as string[]); // Ensure no null/empty values

  const algorithmOptions = await prisma.problem.findMany({
    where: { userId }, // Filter by the current user
    distinct: ['keyAlgorithm'],
    select: { keyAlgorithm: true },
    orderBy: { keyAlgorithm: 'asc' },
  }).then(items => items.map(item => item.keyAlgorithm).filter(Boolean) as string[]); // Ensure no null/empty values

  return { domainOptions, algorithmOptions };
}