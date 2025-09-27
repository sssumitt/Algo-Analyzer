import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // 👈 Import your auth options
import driver from "@/lib/neo4j";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { GoogleGenerativeAI } from "@google/generative-ai";

const embeddingsModel = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY!,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const userId = session.user.id;

    // ✅ 3. Get only the message from the body
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "A non-empty 'message' is required." }, { status: 400 });
    }

    const queryEmbedding = await embeddingsModel.embedQuery(message);

    const neo4jSession = driver.session();
    let retrievedContext = "";
    try {
      // The Cypher query now uses the secure, server-side userId
      const result = await neo4jSession.run(
        `
        CALL db.index.vector.queryNodes('problemEmbeddings', 10, $embedding) YIELD node AS p, score
        WHERE EXISTS((:User {userId: $userId})-[:SUBMITTED]->(p))
        WITH p, score LIMIT 5
        RETURN "Problem" AS type, p.name AS name, score
        UNION
        CALL db.index.vector.queryNodes('approachEmbeddings', 10, $embedding) YIELD node AS a, score
        WHERE EXISTS((:User {userId: $userId})-[:SUBMITTED]->(:Problem)-[:SOLVED_WITH]->(a))
        WITH a, score LIMIT 5
        RETURN "Approach" AS type, a.name AS name, score
        UNION
        CALL db.index.vector.queryNodes('conceptEmbeddings', 10, $embedding) YIELD node AS c, score
        WHERE EXISTS((:User {userId: $userId})-[:SUBMITTED]->(:Problem)-[:SOLVED_WITH]->(:Approach)-[:BELONGS_TO]->(c))
        WITH c, score LIMIT 5
        RETURN "Concept" AS type, c.name AS name, score
        `,
        { embedding: queryEmbedding, userId: userId } // Pass the secure ID
      );

      if (result.records.length > 0) {
        const grouped = result.records.reduce((acc, record) => {
            const type = record.get('type');
            const name = record.get('name');
            if (!acc[type]) acc[type] = new Set();
            acc[type].add(name);
            return acc;
        }, {} as Record<string, Set<string>>);

        retrievedContext = Object.entries(grouped)
          .map(([type, names]) => `Relevant ${type}s:\n- ${[...names].join('\n- ')}`)
          .join('\n\n');
      } else {
        retrievedContext = "No specific information found for this user in the knowledge graph.";
      }
      
    } finally {
      await neo4jSession.close();
    }
    
    const augmentedPrompt = `
      You are a helpful assistant for a computer science student.
      Your knowledge is augmented by the following information retrieved from the user's personal knowledge graph. 
      Use this context, which is based on problems the user has solved, to answer their question accurately. If the context doesn't contain the answer, state that you couldn't find relevant information from their history.

      CONTEXT FROM USER'S HISTORY:
      ---
      ${retrievedContext}
      ---

      USER'S QUESTION:
      ${message}
    `;

    const result = await chatModel.generateContent(augmentedPrompt);
    const response = await result.response;
    const reply = response.text();
    
    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Error in RAG pipeline:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
        { error: `Failed to process chat: ${errorMessage}` }, 
        { status: 500 }
    );
  }
}