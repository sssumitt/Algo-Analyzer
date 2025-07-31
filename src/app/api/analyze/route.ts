import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

/* ───────────────────────── 1. Prompt template ───────────────────────── */
const buildPrompt = (link: string, code: string) => `
You are an expert algorithm tutor. For every problem return ONE JSON object.

Field rules
───────────
• name         – human-readable title (e.g. "Two Sum")
• pseudoCode   – 3-10 ultra-concise English lines (first = signature)
• time         – ONE Big-O term (e.g. "O(n)")
• space        – ONE Big-O term (e.g. "O(1)")
• tags         – ARRAY **[Data Structure, keyAlgorithm]**  (e.g. ["Graph", "Dijkstra"], ["Array", "Two Pointers], ["Tree", "Binary Search"])
• difficulty   – "Easy" | "Medium" | "Hard"

Problem URL: ${link}

Solution code:
${code}
`;

/* Gemini config */
const MODEL_ID = 'gemini-2.5-pro';
const MAX_RETRIES_MS = [250, 500, 1000] as const;

/* ───────────────────────── 2. Helpers ──────────────────────────────── */
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface AnalysisJSON {
  name: string;
  pseudoCode: string[];
  time: string;
  space: string;
  tags: string[];
  difficulty: Difficulty;
}

const isError = (e: unknown): e is Error =>
  typeof e === 'object' && e !== null && 'message' in e;

/* ───────────────────────── 3. API Route ─────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    /* 3-A. Validate body */
    const { link, code } = (await req.json()) as { link: string; code: string };
    if (!link || !code)
      return NextResponse.json({ error: 'Both link and code are required.' }, { status: 400 });

    /* 3-B. Auth */
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    const userId = session.user.id;

    // Note: The user upsert logic here is fine for ensuring a user record exists.
    // No changes needed for this part.
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        username: session.user.name ?? userId,
        email: session.user.email ?? null,
        passwordHash: '',
      },
      update: {},
    });

    /* 3-C. Init Gemini */
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY env variable is missing');
    const ai = new GoogleGenAI({ apiKey });

    /* 3-D. Call Gemini (with retries) */
    const callOnce = () =>
      ai.models.generateContent({
        model: MODEL_ID,
        contents: buildPrompt(link, code),
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name:       { type: Type.STRING },
              pseudoCode: { type: Type.ARRAY, items: { type: Type.STRING } },
              time:       { type: Type.STRING },
              space:      { type: Type.STRING },
              tags:       { type: Type.ARRAY, items: { type: Type.STRING } },
              difficulty: { type: Type.STRING },
            },
            required: ['name', 'pseudoCode', 'time', 'space', 'tags', 'difficulty'],
          },
        },
      });

    let response: Awaited<ReturnType<typeof callOnce>> | null = null;
    for (let i = 0; i <= MAX_RETRIES_MS.length; i++) {
      try {
        response = await callOnce();
        break;
      } catch (e) {
        const msg = isError(e) ? e.message : '';
        const retry = msg.includes('UNAVAILABLE') || msg.includes('overloaded');
        if (!retry || i === MAX_RETRIES_MS.length) throw e;
        await new Promise(r => setTimeout(r, MAX_RETRIES_MS[i]));
      }
    }

    /* 3-E. Parse */
    const parsed = JSON.parse((response!.text ?? '').trim()) as AnalysisJSON;

    /* 3-F. Extract domain / algo */
    const [domain, keyAlgorithm] = parsed.tags;
    if (!domain || !keyAlgorithm)
      return NextResponse.json(
        { error: 'Gemini did not return tags in [domain, keyAlgorithm] format.' },
        { status: 502 },
      );

    /* 3-G. Persist (REVISED LOGIC) */
    // Find if this specific user has already saved this specific problem URL.
    const existingProblem = await prisma.problem.findUnique({
      where: {
        userId_url: {
          userId: userId,
          url: link,
        },
      },
    });

    const analysisData = {
        pseudoCode: parsed.pseudoCode,
        time: parsed.time,
        space: parsed.space,
        tags: parsed.tags,
    };

    if (existingProblem) {
      // If it exists, UPDATE it and add a new analysis.
      // This happens if a user re-submits the same problem.
      await prisma.problem.update({
        where: {
          id: existingProblem.id, // Update using the specific problem ID
        },
        data: {
          name: parsed.name,
          domain: domain,
          keyAlgorithm: keyAlgorithm,
          difficulty: parsed.difficulty,
          analyses: {
            create: [analysisData],
          },
        },
      });
    } else {
      // If it does not exist, CREATE a new problem for this user.
      await prisma.problem.create({
        data: {
          url: link,
          name: parsed.name,
          domain: domain,
          keyAlgorithm: keyAlgorithm,
          difficulty: parsed.difficulty,
          userId: userId, // Explicitly link to the user
          analyses: {
            create: [analysisData],
          },
        },
      });
    }

    /* 3-H. Return */
    return NextResponse.json({ ...parsed, domain, keyAlgorithm });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: isError(err) ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
