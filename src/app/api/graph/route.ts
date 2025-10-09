import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import driver from "@/lib/neo4j";
import type { GraphData, GraphNode, GraphLink } from "@/types/graphTypes";
import type { Node, Relationship } from "neo4j-driver";

type Neo4jNode = Node & {
  properties: {
    name?: string;
    userId?: string;
    url?: string;
  };
};

type Neo4jRelationship = Relationship;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  const dbSession = driver.session();
  try {
    const result = await dbSession.run(
      `
      MATCH (u:User {userId: $userId})
      CALL apoc.path.subgraphAll(u, {
          relationshipFilter: "SUBMITTED>|SOLVED_WITH>|BELONGS_TO>",
          labelFilter: "+User|+Problem|+Approach|+Concept"
      })
      YIELD nodes, relationships
      RETURN nodes, [rel IN relationships WHERE type(rel) IN ['SUBMITTED', 'SOLVED_WITH', 'BELONGS_TO']] AS relationships
      `,
      { userId }
    );

    if (result.records.length === 0) {
      return NextResponse.json({ nodes: [], links: [] });
    }

    const record = result.records[0];
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    
    const nodeMap = new Map<string, GraphNode>();

    record.get("nodes").forEach((node: Neo4jNode) => {
      const internalId = node.elementId;

      if (!nodeMap.has(internalId)) {
        const processedNode: GraphNode = {
          id: internalId,
          label: node.labels[0],
          name: node.properties.name || node.properties.userId || "",
          url: node.properties.url,
        };
        nodes.push(processedNode);
        nodeMap.set(internalId, processedNode);
      }
    });

    record.get("relationships").forEach((rel: Neo4jRelationship) => {
        const sourceNode = nodeMap.get(rel.startNodeElementId);
        const targetNode = nodeMap.get(rel.endNodeElementId);

        if (sourceNode && targetNode) {
            links.push({
                source: sourceNode.id,
                target: targetNode.id,
                label: rel.type,
            });
        }
    });
    
    const graphData: GraphData = { nodes, links };
    return NextResponse.json(graphData);

  } catch (error) {
    console.error("Failed to fetch graph data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await dbSession.close();
  }
}
