import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import driver from "@/lib/neo4j";
import redis from "@/lib/redis";

export async function GET(
  _req: Request,
  { params }: any // <- use `any` here to avoid the TS mismatch error
) {
  const neo4jSession = driver.session();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const userId = session.user.id;
    const { chatId } = params;

    const result = await neo4jSession.run(
      `MATCH (u:User {userId: $userId})-[:STARTED]->(cs:ChatSession {id: $chatId})-[:HAS_MESSAGE]->(m:Message)
       WHERE u.userId = $userId AND cs.id = $chatId
       RETURN m.role AS role, m.text AS text, m.timestamp as createdAt
       ORDER BY m.timestamp ASC`,
      { userId, chatId }
    );

    const messages = result.records.map(record => ({
      id: `${record.get('role')}-${record.get('createdAt').toNumber()}`,
      role: record.get('role') === 'assistant' ? 'bot' : 'user',
      text: record.get('text'),
      createdAt: new Date(record.get('createdAt').toNumber()).getTime(),
    }));

    return NextResponse.json({ messages });

  } catch (error) {
    console.error(`Failed to fetch messages for chat ${params.chatId}:`, error);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  } finally {
    await neo4jSession.close();
  }
}

export async function DELETE(
  _req: Request,
  { params }: any // <- same here
) {
  const neo4jSession = driver.session();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const userId = session.user.id;
    const { chatId } = params;

    const result = await neo4jSession.run(
      `MATCH (u:User {userId: $userId})-[:STARTED]->(cs:ChatSession {id: $chatId})
       DETACH DELETE cs`,
      { userId, chatId }
    );

    if (result.summary.counters.updates().nodesDeleted === 0) {
      return NextResponse.json({ error: "Chat not found or you don't have permission to delete it." }, { status: 404 });
    }

    const historyKey = `user:${userId}:chat:${chatId}:history`;
    await redis.del(historyKey);

    return NextResponse.json({ message: "Chat deleted successfully." });

  } catch (error) {
    console.error(`Failed to delete chat ${params.chatId}:`, error);
    return NextResponse.json({ error: "Failed to delete chat." }, { status: 500 });
  } finally {
    await neo4jSession.close();
  }
}
