import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import driver from "@/lib/neo4j";
import { z } from "zod";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const embeddingsModel = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY!,
  model: "sentence-transformers/all-MiniLM-L6-v2"
});

const isError = (e: unknown): e is Error =>
  typeof e === "object" && e !== null && "message" in e;

const neo4jPayloadSchema = z.object({
  userId: z.string(),
  problem: z.object({
    url: z.string().url(),
    name: z.string(),
    domain: z.string(),         
    approachName: z.string(), 
  }),
});

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

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
    const textsToEmbed = [
      sanitizedPayload.problem.name,
      sanitizedPayload.problem.approachName,
      sanitizedPayload.problem.domain,
    ];

    const embeddings = await embeddingsModel.embedDocuments(textsToEmbed);
    const [problemEmbedding, approachEmbedding, conceptEmbedding] = embeddings;

    const finalPayload = {
        userId: sanitizedPayload.userId,
        problem: {
            ...sanitizedPayload.problem,
            embedding: problemEmbedding,
        },
        approachEmbedding,
        conceptEmbedding,
    }

    await session.run(
      `
      // 1. Find or create the core entities and set their embeddings.
      MERGE (u:User {userId: $userId})

      MERGE (p:Problem {url: $problem.url})
        ON CREATE SET p.name = $problem.name
      SET p.embedding = $problem.embedding

      MERGE (a:Approach {name: $problem.approachName})
      SET a.embedding = $approachEmbedding

      MERGE (c:Concept {name: $problem.domain})
      SET c.embedding = $conceptEmbedding

      // 2. Create the relationships that connect them for this specific submission.
      MERGE (u)-[:SUBMITTED]->(p)
      MERGE (p)-[:SOLVED_WITH]->(a)
      MERGE (a)-[:BELONGS_TO]->(c)
      `,
      finalPayload
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
