import { NextResponse, type NextRequest } from "next/server";
import { prisma } from '@/lib/prisma'; // Ensure you have a prisma client instance here
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // Your NextAuth options

/**
 * Type definition for daily problem submission counts.
 */
type DailyProblemCount = {
  date: string; // Format: YYYY-MM-DD
  count: number;
};

// The GET function now accepts the 'request' object
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const userId = session.user.id;

    const userTimezone = request.headers.get('x-timezone') || 'UTC'; // Fallback to UTC

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result: { date: Date, count: bigint }[] = await prisma.$queryRaw`
      SELECT
        DATE("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${userTimezone}) as date,
        COUNT(id) as count
      FROM
        "Problem"
      WHERE
        "userId" = ${userId} AND "createdAt" >= ${oneYearAgo}
      GROUP BY
        date
      ORDER BY
        date ASC;
    `;

    const formattedData: DailyProblemCount[] = result.map(item => ({
      date: item.date.toISOString().split('T')[0],
      count: Number(item.count),
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error("API Error fetching performance data:", error);
    if (error instanceof Error && error.message.includes("invalid time zone")) {
        return NextResponse.json({ message: 'Invalid timezone provided' }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
