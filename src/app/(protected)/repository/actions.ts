// src/app/(protected)/repository/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
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
  analysisId: string; // <-- Added analysisId
  url: string;
  title: string;
  difficulty: string;
  timeComplexity: string;
  spaceComplexity: string;
  pseudoCode: Prisma.JsonValue | null;
  notes: string;
};

/**
 * Fetches problems from the database based on selected filters.
 */
export async function getFilteredProblems(filters: ProblemFilters): Promise<FilteredProblem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
  }
  const whereClause: Prisma.ProblemWhereInput = {
    userId: session.user.id,
  };
  if (filters.domains && filters.domains.length > 0) {
    whereClause.domain = { in: filters.domains };
  }
  if (filters.algorithms && filters.algorithms.length > 0) {
    whereClause.keyAlgorithm = { in: filters.algorithms };
  }

  const problemsWithAnalyses = await prisma.problem.findMany({
    where: whereClause,
    select: {
      id: true,
      url: true,
      name: true,
      difficulty: true,
      analyses: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, // <-- Select the analysis ID
          time: true,
          space: true,
          pseudoCode: true,
          notes: true,
        },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return problemsWithAnalyses.map(problem => {
    const latestAnalysis = problem.analyses[0];
    return {
      id: problem.id,
      analysisId: latestAnalysis?.id ?? '', // <-- Return the analysis ID
      url: problem.url,
      title: problem.name,
      difficulty: problem.difficulty,
      timeComplexity: latestAnalysis?.time ?? 'N/A',
      spaceComplexity: latestAnalysis?.space ?? 'N/A',
      pseudoCode: latestAnalysis?.pseudoCode ?? null,
      notes: latestAnalysis?.notes ?? '',
    };
  });
}

/**
 * Fetches all unique domains and algorithms for the currently logged-in user.
 */
export async function getFilterOptions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { domainOptions: [], algorithmOptions: [] };
  }
  const userId = session.user.id;
  const domainOptions = await prisma.problem.findMany({
    where: { userId },
    distinct: ['domain'],
    select: { domain: true },
    orderBy: { domain: 'asc' },
  }).then(items => items.map(item => item.domain).filter(Boolean) as string[]);
  const algorithmOptions = await prisma.problem.findMany({
    where: { userId },
    distinct: ['keyAlgorithm'],
    select: { keyAlgorithm: true },
    orderBy: { keyAlgorithm: 'asc' },
  }).then(items => items.map(item => item.keyAlgorithm).filter(Boolean) as string[]);
  return { domainOptions, algorithmOptions };
}

/**
 * Updates the notes for a specific analysis.
 * Ensures that only the owner of the problem can update the notes.
 * @param analysisId - The ID of the analysis record to update.
 * @param newNotes - The new content for the notes.
 * @returns An object indicating success or failure.
 */
export async function updateAnalysisNotes({
  analysisId,
  newNotes,
}: {
  analysisId: string;
  newNotes: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }
  const userId = session.user.id;

  try {
    // First, verify that the analysis belongs to the user to prevent unauthorized edits.
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { problem: { select: { userId: true } } },
    });

    if (!analysis || analysis.problem.userId !== userId) {
      return { error: 'Unauthorized' };
    }

    // If authorized, update the notes.
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { notes: newNotes },
    });

    // Revalidate the repository path to show the updated data immediately.
    revalidatePath('/repository');

    return { success: true };
  } catch (error) {
    console.error('Error updating notes:', error);
    return { error: 'Could not update notes.' };
  }
}
