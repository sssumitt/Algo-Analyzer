import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { prisma } from "@/lib/prisma";
import { analysisPayloadSchema } from "@/types/analysisTypes";

const isError = (e: unknown): e is Error =>
  typeof e === "object" && e !== null && "message" in e;

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: NextRequest) {
  const body = await req.clone().text();

  const isValid = await receiver.verify({
    signature: req.headers.get("upstash-signature")!,
    body,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const jsonBody = JSON.parse(body);
  const validation = analysisPayloadSchema.safeParse(jsonBody);

  if (!validation.success) {
    console.error("Invalid job payload:", validation.error.flatten());
    return NextResponse.json(
      { error: "Invalid payload structure." },
      { status: 400 }
    );
  }

  // ✅ DESTRUCTURED: The new `userDetails` object is now available.
  const { userId, userDetails, link, notes, analysisData } = validation.data;
  const { name, approachName, pseudoCode, time, space, tags, difficulty } =
    analysisData;
  const [domain, keyAlgorithm] = tags;

  try {
    // ✅ ADDED: First, ensure the user exists in the database.
    // This operation is now handled here, in the background.
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        username: userDetails.name ?? userId,
        // ✅ FIXED: Provide a unique placeholder if the email is null.
        // This satisfies the database schema's non-nullable and unique constraints.
        email: userDetails.email ?? `${userId}@placeholder.email`,
      },
      update: {}, // No need to update user details on subsequent analyses
    });

    // Your existing business logic now runs second.
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Database write operation failed:", err);
    return NextResponse.json(
      { error: isError(err) ? err.message : "Worker processing error" },
      { status: 500 }
    );
  }
}

