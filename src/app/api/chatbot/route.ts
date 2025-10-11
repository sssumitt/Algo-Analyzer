import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import driver from "@/lib/neo4j";
import { Session as Neo4jSession } from "neo4j-driver";
import redis from "@/lib/redis"; // Assumes this is an @upstash/redis client
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';

// --- Model & Client Initializations ---
const embeddingsModel = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY!,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const CHAT_HISTORY_LENGTH = 20;
const CACHE_EXPIRATION_SECONDS = 3600;

// --- Helper Functions ---

async function generateTitle(message: string): Promise<string> {
  const titlePrompt = `Generate a concise, 5-word title for the following user query. Respond with only the title and nothing else: "${message}"`;
  try {
    const titleResult = await model.generateContent(titlePrompt);
    return titleResult.response.text().trim().replace(/"/g, '');
  } catch (e) {
    console.error("Title generation error:", e);
    return "New Chat";
  }
}

/**
 * ✅ FIXED: The cache key is now namespaced with the userId for security.
 */
async function getChatHistory(chatId: string, userId: string): Promise<Content[]> {
  // The cache key is now user-specific, preventing unauthorized access.
  const historyKey = `user:${userId}:chat:${chatId}:history`;
  const neo4jSession = driver.session();

  try {
    const cachedHistory = await redis.lrange(historyKey, 0, CHAT_HISTORY_LENGTH - 1);
    if (cachedHistory && cachedHistory.length > 0) {
      const messages = cachedHistory.map((item) => {
        if (typeof item === 'string') {
          try { return JSON.parse(item); } catch { return null; }
        }
        return item;
      });
      return messages.filter(Boolean) as Content[];
    }

    const historyResult = await neo4jSession.run(
      `MATCH (:User {userId: $userId})-[:STARTED]->(:ChatSession {id: $chatId})-[:HAS_MESSAGE]->(m:Message)
       RETURN m.role AS role, m.text AS text ORDER BY m.timestamp ASC LIMIT ${CHAT_HISTORY_LENGTH}`,
      { userId, chatId }
    );
    const dbHistory: Content[] = historyResult.records.map(record => {
      const role = record.get('role') === 'assistant' ? 'model' : 'user';
      return { role, parts: [{ text: record.get('text') }] };
    });

    if (dbHistory.length > 0) {
      const pipeline = redis.pipeline();
      dbHistory.forEach(item => pipeline.rpush(historyKey, JSON.stringify(item)));
      pipeline.expire(historyKey, CACHE_EXPIRATION_SECONDS);
      await pipeline.exec();
    }
    return dbHistory;
  } catch (e) {
    console.error("Chat history retrieval error:", e);
    return [];
  } finally {
    await neo4jSession.close();
  }
}

async function getRAGContext(message: string, userId: string): Promise<string> {
  const neo4jSession = driver.session();
  try {
    const queryEmbedding = await embeddingsModel.embedQuery(message);
    const ragResult = await neo4jSession.run(
      `
      CALL db.index.vector.queryNodes('problemEmbeddings', 10, $embedding) YIELD node AS p, score
      WHERE EXISTS((:User {userId: $userId})-[:SUBMITTED]->(p)) WITH p, score LIMIT 5
      RETURN "Problem" AS type, p.name AS name
      UNION
      CALL db.index.vector.queryNodes('approachEmbeddings', 10, $embedding) YIELD node AS a, score
      WHERE EXISTS((:User {userId: $userId})-[:SUBMITTED]->(:Problem)-[:SOLVED_WITH]->(a)) WITH a, score LIMIT 5
      RETURN "Approach" AS type, a.name AS name
      UNION
      CALL db.index.vector.queryNodes('conceptEmbeddings', 10, $embedding) YIELD node AS c, score
      WHERE EXISTS((:User {userId: $userId})-[:SUBMITTED]->(:Problem)-[:SOLVED_WITH]->(:Approach)-[:BELONGS_TO]->(c)) WITH c, score LIMIT 5
      RETURN "Concept" AS type, c.name AS name
      `,
      { embedding: queryEmbedding, userId: userId }
    );

    if (ragResult.records.length === 0) {
      return "No specific information found for this user in the knowledge graph.";
    }

    const grouped = ragResult.records.reduce((acc, record) => {
        const type = record.get('type');
        const name = record.get('name');
        if (!acc[type]) acc[type] = new Set();
        acc[type].add(name);
        return acc;
    }, {} as Record<string, Set<string>>);

    return Object.entries(grouped)
      .map(([type, names]) => `Relevant ${type}s:\n- ${[...names].join('\n- ')}`)
      .join('\n\n');
  } finally {
    await neo4jSession.close();
  }
}

/**
 * ✅ FIXED: The cache key is also namespaced here for write consistency.
 */
async function persistConversation(params: {
  userId: string;
  chatId: string;
  message: string;
  reply: string;
  isNewChat: boolean;
  title?: string;
}) {
    const { userId, chatId, message, reply, isNewChat, title } = params;
    const neo4jSession = driver.session();
    try {
        // The cache key is now user-specific, ensuring data is saved securely.
        const historyKey = `user:${userId}:chat:${chatId}:history`;
        const userMessageContent = { role: 'user', parts: [{ text: message }] };
        const modelMessageContent = { role: 'model', parts: [{ text: reply }] };
        let neo4jQuery, neo4jParams;
        if (isNewChat) {
            neo4jQuery = `
                MERGE (u:User {userId: $userId})
                CREATE (cs:ChatSession {id: $chatId, title: $title, createdAt: timestamp()})
                MERGE (u)-[:STARTED]->(cs)
                CREATE (user_msg:Message {role: 'user', text: $userMessage, timestamp: timestamp()})
                CREATE (cs)-[:HAS_MESSAGE]->(user_msg)
                CREATE (ai_reply:Message {role: 'assistant', text: $aiReply, timestamp: timestamp() + 1})
                CREATE (cs)-[:HAS_MESSAGE]->(ai_reply)`;
            neo4jParams = { userId, chatId, userMessage: message, aiReply: reply, title };
        } else {
            neo4jQuery = `
                MATCH (cs:ChatSession {id: $chatId})
                CREATE (user_msg:Message {role: 'user', text: $userMessage, timestamp: timestamp()})
                CREATE (cs)-[:HAS_MESSAGE]->(user_msg)
                CREATE (ai_reply:Message {role: 'assistant', text: $aiReply, timestamp: timestamp() + 1})
                CREATE (cs)-[:HAS_MESSAGE]->(ai_reply)`;
            neo4jParams = { chatId, userMessage: message, aiReply: reply };
        }
        await Promise.all([
            neo4jSession.run(neo4jQuery, neo4jParams),
            redis.pipeline()
                .rpush(historyKey, JSON.stringify(userMessageContent), JSON.stringify(modelMessageContent))
                .ltrim(historyKey, -CHAT_HISTORY_LENGTH, -1)
                .expire(historyKey, CACHE_EXPIRATION_SECONDS)
                .exec()
        ]);
    } finally {
        await neo4jSession.close();
    }
}

// === API ROUTE (POST) ===
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const userId = session.user.id;
    const { message, chatId: existingChatId } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "A non-empty 'message' is required." }, { status: 400 });
    }

    const currentChatId = existingChatId || uuidv4();
    const isNewChat = !existingChatId;

    const [chatHistory, retrievedContext] = await Promise.all([
      isNewChat ? Promise.resolve([]) : getChatHistory(currentChatId, userId),
      getRAGContext(message, userId)
    ]);

    const augmentedPrompt = `You are a helpful assistant for a computer science student. Your knowledge is augmented by the following information retrieved from the user's personal knowledge graph. Use this context to answer their question accurately. If the context doesn't contain the answer, state that you couldn't find relevant information from their history. CONTEXT FROM USER'S HISTORY:\n---\n${retrievedContext}\n---\nUSER'S CURRENT QUESTION:\n${message}`;
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(augmentedPrompt);
    const reply = result.response.text();
    
    const chatTitle = isNewChat ? await generateTitle(message) : undefined;

    persistConversation({
      userId,
      chatId: currentChatId,
      message,
      reply,
      isNewChat,
      title: chatTitle,
    }).catch(err => {
      console.error("Background persistence error:", err);
    });

    return NextResponse.json({ reply, chatId: currentChatId, title: chatTitle });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: `Failed to process chat: ${errorMessage}` }, { status: 500 });
  }
}