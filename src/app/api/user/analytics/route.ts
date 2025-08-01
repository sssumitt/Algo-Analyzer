import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'; // Make sure you have a prisma client instance here
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // Your NextAuth options

// Define the expected response types
type TopicStats = {
  domain: string;
  total: number;
};

type DifficultyCounts = {
  easy: number;
  medium: number;
  hard: number;
};

export async function GET(): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const userId = session.user.id;

    // 1. Get Topic Statistics using Prisma groupBy
    const topicData = await prisma.problem.groupBy({
      by: ['domain'],
      where: { userId },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 15, // We'll show the top 7 topics
    });

    const topics: TopicStats[] = topicData.map(item => ({
      domain: item.domain,
      total: item._count.id,
    }));

    // 2. Get Difficulty Statistics using Prisma groupBy
    const difficultyData = await prisma.problem.groupBy({
      by: ['difficulty'],
      where: { userId },
      _count: {
        id: true,
      },
    });

    // Transform the array into the {easy, medium, hard} object format
    const difficulties: DifficultyCounts = { easy: 0, medium: 0, hard: 0 };
    difficultyData.forEach(item => {
      const difficulty = item.difficulty.toLowerCase();
      if (difficulty in difficulties) {
        difficulties[difficulty as keyof DifficultyCounts] = item._count.id;
      }
    });

    // 3. Combine and return the analytics data
    const analyticsData = { topics, difficulties };
    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("API Error fetching analytics data:", error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
