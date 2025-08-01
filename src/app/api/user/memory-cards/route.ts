import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'; // Ensure you have a prisma client instance here
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // Your NextAuth options

// --- Type Definitions ---
// This type should ideally be in a shared file (e.g., src/types/index.ts)
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

// ✅ FIX: Define a specific type for the JSON structure of pseudoCode
interface PseudoCodeJson {
    pseudoCode?: string[];
}


export async function GET(): Promise<NextResponse> {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Fetch all problems for the user, including their latest analysis
    const problems = await prisma.problem.findMany({
      where: { userId },
      include: {
        analyses: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get only the most recent analysis
        },
      },
    });

    // 3. Filter out problems that have no analysis and transform the data
    const memoryCards: MemoryCardData[] = problems
      .filter(problem => problem.analyses.length > 0)
      .map(problem => {
        const latestAnalysis = problem.analyses[0];
        
        const pseudoCodeJson = latestAnalysis.pseudoCode as PseudoCodeJson;
        const pseudoCode = pseudoCodeJson?.pseudoCode || ['No pseudocode available.'];

        return {
          id: problem.id,
          name: problem.name,
          difficulty: problem.difficulty as 'Easy' | 'Medium' | 'Hard',
          timeComplexity: latestAnalysis.time,
          spaceComplexity: latestAnalysis.space,
          keyAlgorithm: problem.keyAlgorithm,
          domain: problem.domain,
          // Ensure the final pseudoCode is always an array of strings
          pseudoCode: Array.isArray(pseudoCode) ? pseudoCode : [String(pseudoCode)],
        };
      });

    return NextResponse.json(memoryCards);

  } catch (error) {
    console.error("API Error fetching memory cards:", error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
