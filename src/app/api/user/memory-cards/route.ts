import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

// --- Type Definition for Frontend ---
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

// --- Zod Schema for Runtime Validation ---
const pseudoCodeSchema = z.object({
  pseudoCode: z.array(z.string()).optional(),
});


export async function GET(): Promise<NextResponse> {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Fetch all problems for the user
    const problems = await prisma.problem.findMany({
      where: { userId },
      include: {
        analyses: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // 3. Filter problems and transform data with robust parsing
    const memoryCards: MemoryCardData[] = problems
      .filter(problem => problem.analyses.length > 0)
      .map(problem => {
        const latestAnalysis = problem.analyses[0];
        const rawPseudoCode = latestAnalysis.pseudoCode;
        
        let finalPseudoCode: string[];

        // Attempt to parse against the expected object schema first.
        const parsedObject = pseudoCodeSchema.safeParse(rawPseudoCode);

        if (parsedObject.success) {
          // Case A: Data is in the expected { pseudoCode: [...] } format.
          finalPseudoCode = parsedObject.data.pseudoCode ?? ['No pseudocode available.'];
        } else if (Array.isArray(rawPseudoCode) && rawPseudoCode.every(item => typeof item === 'string')) {
          // Case B: Data is a simple array of strings: [...]
          finalPseudoCode = rawPseudoCode;
        } else {
          // Case C: The format is unknown or invalid.
          finalPseudoCode = ['Invalid pseudocode format.'];
          // Log a warning for easier debugging of malformed data.
          console.warn(`Unrecognized pseudocode structure for problem "${problem.name}":`, rawPseudoCode);
        }

        return {
          id: problem.id,
          name: problem.name,
          difficulty: problem.difficulty as 'Easy' | 'Medium' | 'Hard',
          timeComplexity: latestAnalysis.time,
          spaceComplexity: latestAnalysis.space,
          keyAlgorithm: problem.keyAlgorithm,
          domain: problem.domain,
          pseudoCode: finalPseudoCode,
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
