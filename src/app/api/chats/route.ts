import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import driver from "@/lib/neo4j";

export async function GET() {
  const neo4jSession = driver.session();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch only the ID, title, and latest update time for the sidebar
    const result = await neo4jSession.run(
      `MATCH (u:User {userId: $userId})-[:STARTED]->(cs:ChatSession)
       RETURN cs.id AS id, cs.title AS title, cs.createdAt AS updatedAt
       ORDER BY cs.createdAt DESC`,
      { userId }
    );

    const chats = result.records.map(record => ({
      id: record.get('id'),
      title: record.get('title'),
      updatedAt: new Date(record.get('updatedAt').toNumber()).getTime(),
    }));

    return NextResponse.json(chats);

  } catch (error) {
    console.error("Failed to fetch chats:", error);
    return NextResponse.json({ error: "Failed to fetch chat history." }, { status: 500 });
  } finally {
    await neo4jSession.close();
  }
}