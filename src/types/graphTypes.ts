// A node in the graph, as returned by the API
export interface GraphNode {
  id: string;      // A unique identifier (Neo4j's elementId)
  label: string;   // The node's label (e.g., "Problem", "User")
  name: string;    // The display name
  url?: string;    // ✅ ADDED: Optional URL for Problem nodes
}

// A link in the graph, as returned by the API
export interface GraphLink {
  source: string;  // The ID of the source node
  target: string;  // The ID of the target node
  label: string;
}

// The complete graph data structure
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
