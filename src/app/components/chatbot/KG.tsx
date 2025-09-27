"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, TrackballControls, Line } from "@react-three/drei";
import type { TrackballControls as TrackballControlsImpl } from 'three-stdlib';
import * as THREE from "three";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX, // NEW: Import forceX
  forceY, // NEW: Import forceY
} from "d3-force-3d";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { GraphData, GraphNode as GraphNodeType, GraphLink as GraphLinkType } from "@/types/graphTypes";
import {
  Box,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Heading,
  Badge,
  Link,
  Text as ChakraText,
  IconButton,
  HStack,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { X, ExternalLink, HelpCircle } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface SimulationNode extends GraphNodeType {
  x?: number; y?: number; z?: number;
  username?: string;
}
interface SimulationLink extends Omit<GraphLinkType, 'source' | 'target'> {
  source: SimulationNode; target: SimulationNode;
}

// --- CONFIGURATION ---
const NODE_COLORS: Record<string, string> = {
  User: "#f472b6",      // Pink
  Problem: "#60a5fa",   // Blue
  Approach: "#4ade80",  // Green
  Concept: "#f97316",   // Orange
};

// --- HELPER COMPONENTS ---

const CameraAnimator = ({ target }: { target: THREE.Vector3 | null }) => {
  useFrame((state) => {
    if (target && state.controls) {
      const controls = state.controls as TrackballControlsImpl;
      const cameraPosition = new THREE.Vector3(target.x, target.y, target.z + 60);
      state.camera.position.lerp(cameraPosition, 0.05);
      controls.target.lerp(target, 0.05);
      controls.update();
    }
  });
  return null;
};

const InfoSidebar = ({ node, onClose }: { node: SimulationNode | null; onClose: () => void }) => {
  if (!node) return null;
  const accentColor = NODE_COLORS[node.label] || "#ffffff";
  return (
    <Box
      position="absolute" top="90px" right="20px" width="288px"
      bg="rgba(17, 17, 20, 0.7)" backdropFilter="blur(8px)" p={4}
      borderRadius="lg" boxShadow="xl" borderTop="4px solid"
      borderColor={accentColor} transition="all 0.3s ease" color="white"
    >
      <IconButton
        aria-label="Close sidebar" icon={<X size={20} />} onClick={onClose} size="sm" variant="ghost"
        position="absolute" top={2} right={2} _hover={{ bg: "rgba(255,255,255,0.1)" }}
      />
      <Heading as="h2" size="md" mb={2} pr={8} color="whiteAlpha.900">{node.name}</Heading>
      <Badge colorScheme="gray">{`Type: ${node.label}`}</Badge>
      {node.label === 'Problem' && node.url && (
        <Link href={node.url} isExternal mt={4} color={accentColor} _hover={{ textDecoration: 'none', opacity: 0.8 }}>
          <HStack spacing={2}>
            <ChakraText fontWeight="medium">View Problem</ChakraText>
            <ExternalLink size={16} />
          </HStack>
        </Link>
      )}
    </Box>
  );
};

const GraphLegend = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
    return (
        <Box
          position="absolute" top="90px" left="20px" bg="rgba(17, 17, 20, 0.7)"
          backdropFilter="blur(8px)" borderRadius="lg" boxShadow="xl" color="whiteAlpha.900"
          overflow="hidden" maxH={isOpen ? "300px" : "48px"} transition="max-height 0.4s ease-in-out"
          border="1px solid" borderColor="rgba(255, 255, 255, 0.1)"
        >
          <HStack
            p={4} py={3} onClick={onToggle} cursor="pointer"
            _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }} transition="background 0.2s" spacing={3}
          >
             <HelpCircle size={18} />
             <Heading size="sm">Legend</Heading>
          </HStack>
          <Box px={4} pb={4} pt={0}>
              <Divider mb={3} borderColor="whiteAlpha.300" />
              <VStack align="start" spacing={2}>
                {Object.entries(NODE_COLORS).map(([label, color]) => (
                  <HStack key={label} spacing={3}>
                    <Box w="12px" h="12px" bg={color} borderRadius="full" />
                    <ChakraText fontSize="sm">{label}</ChakraText>
                  </HStack>
                ))}
              </VStack>
          </Box>
        </Box>
    );
};

// --- CORE GRAPH COMPONENTS ---

const GraphNode = ({ node, onClick }: { node: SimulationNode; onClick: (node: SimulationNode) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = useMemo(() => NODE_COLORS[node.label] || "#ffffff", [node.label]);
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ref.current) {
        const targetPos = new THREE.Vector3(node.x || 0, node.y || 0, node.z || 0);
        ref.current.position.lerp(targetPos, 0.1);
    }
  });

  return (
    <group ref={ref}>
      <mesh
        onClick={() => onClick(node)}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        scale={isHovered ? 1.3 : 1}
      >
        <icosahedronGeometry args={[7, 1]} /> 
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={isHovered ? 1.2 : 0.4}
          toneMapped={false}
        />
      </mesh>
      <Text
        position={[0, 11, 0]} // Adjusted text position for larger node
        fontSize={3.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        visible={isHovered}
      >
        {node.name}
      </Text>
    </group>
  );
};

const Graph = ({ data, onNodeClick }: { data: GraphData, onNodeClick: (node: SimulationNode) => void }) => {
  const [graphData, setGraphData] = useState<{ nodes: SimulationNode[], links: SimulationLink[] } | null>(null);

  useEffect(() => {
    const nodes: SimulationNode[] = data.nodes.map(node => ({ ...node }));
    const links: GraphLinkType[] = data.links.map(link => ({ ...link }));
    
    // NEW: Define vertical positions for each layer
    const layerPositions: Record<string, number> = {
      User: -150,
      Problem: -50,
      Approach: 50,
      Concept: 150,
    };

    // UPDATED: Simulation now uses forceX and forceY for a hierarchical layout
    const simulation = forceSimulation(nodes, 3)
      .force("link", forceLink(links).id((d: any) => d.id).distance(90).strength(0.8))
      .force("charge", forceManyBody().strength(-200)) // Weaker repulsion to allow layering
      .force("collide", forceCollide().radius(25)) // Collision to prevent overlap in layers
      .force("x", forceX(0).strength(0.05)) // Center horizontally
      .force("y", forceY((d: any) => layerPositions[d.label]).strength(0.2)); // Position vertically by layer
      
    for (let i = 0; i < 150; ++i) simulation.tick(); // Run simulation for longer to settle
    simulation.on("tick", () => setGraphData({ nodes: [...nodes], links: links as any }));
    return () => simulation.stop();
  }, [data]);

  if (!graphData) return null;

  return (
    <>
      {graphData.nodes.map((node) => (
        <GraphNode key={node.id} node={node} onClick={onNodeClick} />
      ))}
      <Line
        points={graphData.links.map(link => [
            new THREE.Vector3(link.source.x, link.source.y, link.source.z),
            new THREE.Vector3(link.target.x, link.target.y, link.target.z)
        ]).flat() as any}
        color="rgba(255, 255, 255, 0.2)"
        lineWidth={0.5}
      />
      <TrackballControls noZoom={false} noPan={true} rotateSpeed={3} />
    </>
  );
};

// --- PARENT COMPONENT ---
export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SimulationNode | null>(null);
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);
  const [isLegendVisible, setIsLegendVisible] = useState(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch("/api/graph");
        if (!response.ok) throw new Error(`Failed to fetch graph data: ${response.statusText}`);
        const data: GraphData = await response.json();
        setGraphData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGraphData();
  }, []);

  const handleNodeClick = (node: SimulationNode) => {
    setSelectedNode(node);
    if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        setCameraTarget(new THREE.Vector3(node.x, node.y, node.z));
    }
  };

  const closeSidebar = () => {
    setSelectedNode(null);
    setCameraTarget(null);
  };
  
  const toggleLegend = () => setIsLegendVisible(prev => !prev);

  return (
    <Box position="relative" h="100vh" w="100%" bg="#05050a">
      {isLoading && (
        <Center h="100%"><HStack><Spinner color="blue.500" /><ChakraText color="whiteAlpha.800">Loading Knowledge Graph...</ChakraText></HStack></Center>
      )}
      {error && (
        <Center h="100%" p={4}>
          <Alert status="error" variant="subtle" borderRadius="md" bg="red.900" color="white">
            <AlertIcon color="white" /><Box><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Box>
          </Alert>
        </Center>
      )}
      {!isLoading && !error && graphData && (
        <>
            {/* UPDATED: Camera position adjusted to better fit the vertical layout */}
            <Canvas camera={{ position: [0, 0, 300], fov: 50 }}>
                <color attach="background" args={['#05050a']} />
                <ambientLight intensity={0.1} />
                <pointLight position={[100, 100, 100]} intensity={0.5} color="white" />
                <pointLight position={[-100, -100, -50]} intensity={0.7} color="#f472b6" />

                <Graph data={graphData} onNodeClick={handleNodeClick} />
                <CameraAnimator target={cameraTarget} />
                
                <EffectComposer>
                    <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={400} intensity={0.9} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>
            <GraphLegend isOpen={isLegendVisible} onToggle={toggleLegend} />
            <InfoSidebar node={selectedNode} onClose={closeSidebar} />
            <ChakraText fontSize="xs" color="gray.500" position="absolute" bottom={4} right={4}>
                Left-click & drag to rotate. Scroll to zoom.
            </ChakraText>
        </>
      )}
    </Box>
  );
}