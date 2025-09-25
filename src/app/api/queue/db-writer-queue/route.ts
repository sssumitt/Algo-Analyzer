import { NextRequest, NextResponse } from "next/server";
import { Receiver, Client } from "@upstash/qstash";
import { prisma } from "@/lib/prisma";
import { analysisPayloadSchema } from "@/types/analysisTypes";

const isError = (e: unknown): e is Error =>
  typeof e === "object" && e !== null && "message" in e;

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: NextRequest) {
  // --- 1. VERIFICATION & VALIDATION ---
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

  const validation = analysisPayloadSchema.safeParse(JSON.parse(body));
  if (!validation.success) {
    console.error("Invalid job payload:", validation.error.flatten());
    return NextResponse.json(
      { error: "Invalid payload structure." },
      { status: 400 }
    );
  }

  const { userId, userDetails, link, notes, analysisData } = validation.data;
  const { name, approachName, pseudoCode, time, space, tags, difficulty } =
    analysisData;
  const [domain, keyAlgorithm] = tags;

  try {
    // --- 2. PRIMARY DATABASE WRITE (PostgreSQL) ---
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        username: userDetails.name ?? userId,
        email: userDetails.email ?? `${userId}@placeholder.email`,
      },
      update: {},
    });

    const existingProblem = await prisma.problem.findUnique({
      where: { userId_url_approachName: { userId, url: link, approachName } },
    });

    const newAnalysisData = {
      pseudoCode, time, space, tags, notes: notes ?? ""
    };

    if (existingProblem) {
      await prisma.problem.update({
        where: { id: existingProblem.id },
        data: {
          name, domain, keyAlgorithm, difficulty,
          analyses: { create: [newAnalysisData] },
        },
      });
    } else {
      await prisma.problem.create({
        data: {
          url: link, name, domain, keyAlgorithm, difficulty,
          approachName, userId,
          analyses: { create: [newAnalysisData] },
        },
      });
    }
    console.log(`Successfully saved analysis to PostgreSQL for user: ${userId}`);


    // --- 3. FAN-OUT STEP (Trigger the Neo4j Worker) ---
    const qstashClient = new Client({ token: process.env.QSTASH_TOKEN! });

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? `https://${process.env.VERCEL_URL}` // e.g. https://your-app.vercel.app
        : "http://localhost:3000";

    const destinationUrl = `${baseUrl}/api/queue/neo4j-writer-queue`;


    await qstashClient.publishJSON({
      url: destinationUrl,
      // ✅ FIX: The payload now matches the simplified schema expected by the Neo4j worker.
      // This sends a clean, non-redundant data structure to the next step in the pipeline.
      body: {
        userId,
        problem: {
          url: link,
          name: name,
          domain: domain,
          approachName: approachName, // The single source of truth for the technique.
        },
      },
    });
    console.log(`Successfully enqueued job for Neo4j knowledge graph update.`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Database write or fan-out operation failed:", err);
    return NextResponse.json(
      { error: isError(err) ? err.message : "Worker processing error" },
      { status: 500 }
    );
  }
}
