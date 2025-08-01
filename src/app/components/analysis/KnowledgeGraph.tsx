// 'use client';

// import dynamic from 'next/dynamic';
// import {
//   Box,
//   Heading,
//   VStack,
//   Text,
//   Spinner,
//   Center,
//   useTheme,
//   HStack,
//   Tag,
//   Drawer,
//   DrawerBody,
//   DrawerHeader,
//   DrawerOverlay,
//   DrawerContent,
//   DrawerCloseButton,
//   useDisclosure,
//   chakra,
// } from '@chakra-ui/react';
// import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
// import { BrainCircuit, SlidersHorizontal } from 'lucide-react';
// import * as d3 from 'd3';

// // Dynamic import of the 3D force graph component (no SSR)
// const ForceGraph3D = dynamic(
//   () => import('react-force-graph-3d'),
//   { ssr: false }
// );
// import type { ForceGraphMethods, NodeObject } from 'react-force-graph-3d';

// // --- Type Definitions ---
// type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

// type ProblemData = {
//   id: string;
//   name: string;
//   url: string;
//   domain: string;
//   keyAlgorithm: string;
//   difficulty: ProblemDifficulty;
//   engagement: number;
// };

// type GraphNode = {
//   id: string;
//   name: string;
//   type: 'problem' | 'domain';
//   difficulty?: ProblemDifficulty;
//   url?: string;
//   engagement?: number;
// };

// type GraphLink = {
//   source: string;
//   target: string;
// };

// type GraphData = {
//   nodes: GraphNode[];
//   links: GraphLink[];
// };

// // --- Mock Data (Replace with API fetch) ---
// const getMockGraphData = (): ProblemData[] => [
//   { id: '1', name: 'Two Sum', url: '#', difficulty: 'Easy', domain: 'Arrays', keyAlgorithm: 'Hash Table', engagement: 5 },
//   { id: '2', name: 'Container With Most Water', url: '#', difficulty: 'Medium', domain: 'Arrays', keyAlgorithm: 'Two Pointers', engagement: 8 },
//   { id: '3', name: 'Median of Two Sorted Arrays', url: '#', difficulty: 'Hard', domain: 'Arrays', keyAlgorithm: 'Binary Search', engagement: 12 },
//   { id: '4', name: 'Valid Parentheses', url: '#', difficulty: 'Easy', domain: 'Stacks', keyAlgorithm: 'Stack', engagement: 3 },
//   { id: '5', name: 'Longest Substring Without Repeating Characters', url: '#', difficulty: 'Medium', domain: 'Strings', keyAlgorithm: 'Sliding Window', engagement: 9 },
// ];

// // --- Detail Panel Drawer ---
// function DetailPanel({ node, onClose }: { node: GraphNode | null; onClose: () => void }) {
//   const { isOpen, onClose: closeDrawer } = useDisclosure({ isOpen: !!node, onClose });
//   const difficultyColorMap: Record<ProblemDifficulty, string> = {
//     Easy: 'green.300',
//     Medium: 'yellow.300',
//     Hard: 'red.300',
//   };

//   return (
//     <Drawer isOpen={isOpen} placement="right" onClose={closeDrawer} size="sm">
//       <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
//       <DrawerContent bg="#1C1C1E" borderLeft="1px" borderColor="whiteAlpha.200">
//         <DrawerCloseButton />
//         <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.200">
//           {node?.type === 'problem' ? 'Problem Details' : 'Domain Details'}
//         </DrawerHeader>
//         <DrawerBody p={6}>
//           {node && (
//             <VStack align="stretch" spacing={5}>
//               <Heading size="lg" color="whiteAlpha.900">{node.name}</Heading>
//               {node.type === 'problem' && node.difficulty && (
//                 <Tag colorScheme={difficultyColorMap[node.difficulty].split('.')[0]}>
//                   {node.difficulty}
//                 </Tag>
//               )}
//               <Text color="gray.400">
//                 {node.type === 'problem'
//                   ? 'This node represents a solved problem.'
//                   : `All problems under the domain '${node.name}'.`}
//               </Text>
//               {node.url && (
//                 <chakra.a href={node.url} target="_blank" rel="noopener noreferrer" color="purple.300" fontWeight="bold">
//                   View Problem →
//                 </chakra.a>
//               )}
//             </VStack>
//           )}
//         </DrawerBody>
//       </DrawerContent>
//     </Drawer>
//   );
// }

// // --- Controls Overlay ---
// function GraphControls({ domains, onDomainChange }: { domains: string[]; onDomainChange: (d: string) => void }) {
//   return (
//     <Box
//       position="absolute"
//       top={4}
//       left={4}
//       zIndex={10}
//       bg="rgba(28,28,30,0.8)"
//       backdropFilter="blur(5px)"
//       p={3}
//       borderRadius="lg"
//       border="1px"
//       borderColor="whiteAlpha.100"
//     >
//       <VStack align="start" spacing={2}>
//         <HStack>
//           <SlidersHorizontal />
//           <Text fontSize="sm">Highlight Domain</Text>
//         </HStack>
//         <chakra.select
//           bg="#2D2D2D"
//           color="white"
//           borderColor="#4A4A4A"
//           onChange={e => onDomainChange(e.target.value)}
//         >
//           <option value="All">All</option>
//           {domains.map(d => (
//             <option key={d} value={d}>{d}</option>
//           ))}
//         </chakra.select>
//       </VStack>
//     </Box>
//   );
// }

// // --- Main Component ---
// export default function KnowledgeGraphSection() {
//   const [data, setData] = useState<ProblemData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
//   const [highlightDomain, setHighlightDomain] = useState('All');
//   const fgRef = useRef<ForceGraphMethods | null>(null);

//   // Load mock or real data
//   useEffect(() => {
//     setTimeout(() => {
//       setData(getMockGraphData());
//       setLoading(false);
//     }, 1000);
//   }, []);

//   // Compute domains & color scale
//   const { domains, colorScale } = useMemo(() => {
//     const uniq = Array.from(new Set(data.map(p => p.domain)));
//     const scale = d3.scaleOrdinal(d3.schemeCategory10).domain(uniq);
//     return { domains: uniq, colorScale: scale };
//   }, [data]);

//   // Build graph nodes & links
//   const graphData = useMemo<GraphData>(() => {
//     const nodes: GraphNode[] = [];
//     const links: GraphLink[] = [];
//     const seen = new Set<string>();

//     data.forEach(p => {
//       if (!seen.has(p.id)) {
//         nodes.push({ id: p.id, name: p.name, type: 'problem', url: p.url, difficulty: p.difficulty, engagement: p.engagement });
//         seen.add(p.id);
//       }
//       if (!seen.has(p.domain)) {
//         nodes.push({ id: p.domain, name: p.domain, type: 'domain' });
//         seen.add(p.domain);
//       }
//       links.push({ source: p.id, target: p.domain });
//     });
//     return { nodes, links };
//   }, [data]);

//   // Node click handler
//   const handleNodeClick = useCallback((node: NodeObject) => {
//     setSelectedNode(node as GraphNode);
//     if (fgRef.current && node.x != null && node.y != null && node.z != null) {
//       fgRef.current.cameraPosition(
//         { x: node.x, y: node.y, z: (node.z as number) + 100 },
//         { x: node.x, y: node.y, z: node.z as number },
//         500
//       );
//     }
//   }, []);

//   // Determine node color & opacity
//   const getNodeColor = useCallback((node: GraphNode) => {
//     let domain = node.type === 'problem'
//       ? graphData.links.find(l => l.source === node.id)?.target
//       : node.id;
//     const base = colorScale(domain || '');
//     const { r, g, b } = d3.rgb(base);
//     const isActive = highlightDomain === 'All' || highlightDomain === domain;
//     return `rgba(${r},${g},${b},${isActive ? 0.9 : 0.2})`;
//   }, [colorScale, graphData.links, highlightDomain]);

//   return (
//     <Box w="100%" h="600px" bg="#1C1C1E" position="relative" borderRadius="xl" overflow="hidden">
//       {loading ? (
//         <Center h="100%">
//           <Spinner color="purple.400" />
//         </Center>
//       ) : (
//         <>
//           <GraphControls domains={domains} onDomainChange={setHighlightDomain} />
//           <ForceGraph3D
//             ref={fgRef}
//             graphData={graphData}
//             backgroundColor="#121212"
//             nodeLabel={node => `<b>${(node as GraphNode).name}</b>`}
//             nodeColor={node => getNodeColor(node as GraphNode)}
//             nodeVal={node => (node as GraphNode).engagement ?? 5}
//             linkColor={() => 'rgba(255,255,255,0.1)'}
//             onNodeClick={handleNodeClick}
//           />
//           <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
//         </>
//       )}
//     </Box>
//   );
// }
