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
• name                 – human-readable title (e.g. "Two Sum")
• approachName         – CHOOSE the BEST-FITTING name from the "Canonical Approaches" list below.
• approachDescription  – (OPTIONAL) If approachName is "Other", provide a short, specific description here (e.g., "Kadane's Algorithm").
• pseudoCode           – 3-10 ultra-concise English lines (first = signature)
• time                 – ONE Big-O term. Be extremely precise. Distinguish between variables (e.g., N, M, K). For DSU, include the Inverse Ackermann function α(N). MUST NOT contain markdown.
• space                – ONE Big-O term. Be extremely precise. MUST NOT contain markdown.
• tags                 – ARRAY [Data Structure, KeyAlgorithm]. KeyAlgorithm MUST be UpperCamelCase (e.g. ["Graph", "Dijkstra"], ["Tree", "DepthFirstSearch"]).
• difficulty           – "Easy" | "Medium" | "Hard"

Canonical Approaches (for the 'approachName' field)
────────────────────
- Brute Force, Two Pointers, Sliding Window, Hash Map / Hash Set, Stack, Queue, Priority Queue / Heap, Recursion, Backtracking, Dynamic Programming (Memoization), Dynamic Programming (Tabulation), Binary Search, Greedy Approach, Bit Manipulation, Trie, Graph Traversal (BFS), Graph Traversal (DFS), Union Find / DSU, Other

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
  approachName: string;
  approachDescription?: string;
  pseudoCode: string[];
  time: string;
  space: string;
  tags: string[];
  difficulty: Difficulty;
}

const isError = (e: unknown): e is Error =>
  typeof e === 'object' && e !== null && 'message' in e;

// ✅ New helper to convert UpperCamelCase to a space-separated string.
const splitCamelCase = (str: string): string => {
    if (!str) return '';
    // Inserts a space before each uppercase letter and trims the result.
    // e.g., "DepthFirstSearch" -> "Depth First Search"
    return str.replace(/([A-Z])/g, ' $1').trim();
};

const cleanBigOString = (str: string) => {
    if (!str) return '';
    return str.replace(/(\s?\*?\s?)\"?\[Alpha\]\(([^)]+)\)\)?/g, '$1α($2)');
};


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

    await prisma.user.upsert({ where: { id: userId }, create: { id: userId, username: session.user.name ?? userId, email: session.user.email ?? null, passwordHash: '' }, update: {} });

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
              name:                { type: Type.STRING },
              approachName:        { type: Type.STRING },
              approachDescription: { type: Type.STRING, nullable: true },
              pseudoCode:          { type: Type.ARRAY, items: { type: Type.STRING } },
              time:                { type: Type.STRING },
              space:               { type: Type.STRING },
              tags:                { type: Type.ARRAY, items: { type: Type.STRING } },
              difficulty:          { type: Type.STRING },
            },
            required: ['name', 'approachName', 'pseudoCode', 'time', 'space', 'tags', 'difficulty'],
          },
        },
      });

    let response: Awaited<ReturnType<typeof callOnce>> | null = null;
    for (let i = 0; i <= MAX_RETRIES_MS.length; i++) {
        try {
            response = await callOnce();
            break;
        } catch (e) {
            const msg = isError(e) ? e.message.toLowerCase() : '';
            const retry = msg.includes('unavailable') || msg.includes('overloaded') || msg.includes('internal error');
            if (!retry || i === MAX_RETRIES_MS.length) throw e;
            await new Promise(r => setTimeout(r, MAX_RETRIES_MS[i]));
        }
    }
    
    /* 3-E. Parse and Validate */
    const parsed = JSON.parse((response!.text ?? '').trim()) as AnalysisJSON;
    if (!parsed.approachName || typeof parsed.approachName !== 'string') {
        return NextResponse.json( { error: "Analysis failed: The AI did not provide a valid 'approachName'. Please try again." }, { status: 502 });
    }

    /* 3-F. Extract and Format data */
    const [rawDomain, rawKeyAlgorithm] = parsed.tags;
    if (!rawDomain || !rawKeyAlgorithm) return NextResponse.json({ error: 'Gemini did not return tags in [domain, keyAlgorithm] format.' }, { status: 502 });

    // ✅ Use the new helper to get the final, human-readable format.
    const keyAlgorithm = splitCamelCase(rawKeyAlgorithm);
    const domain = splitCamelCase(rawDomain);

    let finalApproachName = parsed.approachName;
    if (finalApproachName === 'Other' && parsed.approachDescription) {
        finalApproachName = parsed.approachDescription;
    }
    
    const timeComplexity = cleanBigOString(parsed.time);
    const spaceComplexity = cleanBigOString(parsed.space);

    /* 3-G. Persist Data */
    const existingProblem = await prisma.problem.findUnique({
      where: { userId_url_approachName: { userId: userId, url: link, approachName: finalApproachName } },
    });

    const analysisData = {
        pseudoCode: parsed.pseudoCode,
        time: timeComplexity,
        space: spaceComplexity,
        tags: [domain, keyAlgorithm], // Save the human-readable version
    };

    if (existingProblem) {
      await prisma.problem.update({ where: { id: existingProblem.id }, data: { name: parsed.name, domain: domain, keyAlgorithm: keyAlgorithm, difficulty: parsed.difficulty, analyses: { create: [analysisData] } } });
    } else {
      await prisma.problem.create({ data: { url: link, name: parsed.name, domain: domain, keyAlgorithm: keyAlgorithm, difficulty: parsed.difficulty, approachName: finalApproachName, userId: userId, analyses: { create: [analysisData] } } });
    }

    /* 3-H. Return */
    return NextResponse.json({ 
        ...parsed, 
        domain, 
        keyAlgorithm, 
        approachName: finalApproachName,
        time: timeComplexity,
        space: spaceComplexity,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: isError(err) ? err.message : 'Internal server error' }, { status: 500 });
  }
}
