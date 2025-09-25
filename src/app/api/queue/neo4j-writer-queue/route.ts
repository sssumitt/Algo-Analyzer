import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import driver from "@/lib/neo4j";
import { z } from "zod";

const isError = (e: unknown): e is Error =>
  typeof e === "object" && e !== null && "message" in e;

// --- 1. ZOD SCHEMA (UPDATED) ---
// This schema now perfectly matches the data structure defined by your Prisma models.
// 'approachName' is the single source of truth for the technique used.
const neo4jPayloadSchema = z.object({
  userId: z.string(),
  problem: z.object({
    url: z.string().url(),
    name: z.string(),
    domain: z.string(),         // The broad topic, e.g., "Array"
    approachName: z.string(), // The specific technique, e.g., "Two Pointers"
  }),
});

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// --- 3. THE MAIN HANDLER (UPDATED) ---
export async function POST(req: NextRequest) {
  // --- Verification & Validation ---
  const body = await req.clone().text();
  try {
    const isValid = await receiver.verify({
      signature: req.headers.get("upstash-signature")!,
      body,
    });
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch (error) {
     return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  const validation = neo4jPayloadSchema.safeParse(JSON.parse(body));
  if (!validation.success) {
    console.error("Invalid payload for Neo4j worker:", validation.error.flatten());
    return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
  }

  const { userId, problem } = validation.data;

  // ✅ BEST PRACTICE: Sanitize all string inputs to prevent duplicates from whitespace.
  const sanitizedPayload = {
    userId,
    problem: {
      url: problem.url,
      name: problem.name.trim(),
      domain: problem.domain.trim(),
      approachName: problem.approachName.trim(),
    },
  };

  const session = driver.session();
  try {
    // ✅ CYPHER QUERY (UPDATED & SIMPLIFIED)
    // This query is non-redundant and accurately models your data relationships.
    await session.run(
      `
      // 1. Find or create the four core, independent entities.
      MERGE (u:User {userId: $userId})
      MERGE (p:Problem {url: $problem.url})
        ON CREATE SET p.name = $problem.name

      // The 'approachName' is the single source of truth for the technique.
      MERGE (a:Approach {name: $problem.approachName})

      // The 'domain' represents the broader topic or concept.
      MERGE (c:Concept {name: $problem.domain})

      // 2. Create the relationships that connect them for this specific submission.
      MERGE (u)-[:SUBMITTED]->(p)
      MERGE (p)-[:SOLVED_WITH]->(a)
      MERGE (a)-[:BELONGS_TO]->(c) // e.g., (Two Pointers)-[:BELONGS_TO]->(Array)
      `,
      sanitizedPayload // Pass the sanitized payload as parameters
    );

    console.log(`Successfully updated knowledge graph for problem: ${problem.name}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Neo4j write operation failed:", error);
    return NextResponse.json(
        { error: `Failed to update graph: ${isError(error) ? error.message : 'Unknown error'}` }, 
        { status: 500 }
    );
  } finally {
    await session.close();
  }
}
