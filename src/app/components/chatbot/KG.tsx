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
} from "d3-force-3d";
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
} from "@chakra-ui/react";
import { X, ExternalLink } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface SimulationNode extends GraphNodeType {
  x?: number; y?: number; z?: number;
}
interface SimulationLink extends Omit<GraphLinkType, 'source' | 'target'> {
  source: SimulationNode; target: SimulationNode;
}

// --- CONFIGURATION ---
const NODE_COLORS: Record<string, string> = {
  User: "#f472b6", // Pink
  Problem: "#60a5fa", // Blue
  Approach: "#4ade80", // Green
  Concept: "#f97316", // Orange
};

// --- HELPER COMPONENTS ---

const CameraAnimator = ({ target }: { target: THREE.Vector3 | null }) => {
  useFrame((state) => {
    const controls = state.controls as TrackballControlsImpl;
    if (target && controls) {
      const lookAtTarget = new THREE.Vector3(target.x, target.y, target.z - 100);
      state.camera.position.lerp(target, 0.05);
      controls.target.lerp(lookAtTarget, 0.05);
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
      position="absolute"
      top={4}
      right={4}
      width="288px"
      bg="rgba(23, 25, 35, 0.5)"
      backdropFilter="blur(4px)"
      p={4}
      borderRadius="lg"
      boxShadow="2xl"
      borderTop="4px solid"
      borderColor={accentColor}
      transition="all 0.3s ease"
    >
      <IconButton
        aria-label="Close sidebar"
        icon={<X size={20} />}
        onClick={onClose}
        size="sm"
        variant="ghost"
        position="absolute"
        top={2}
        right={2}
      />
      <Heading as="h2" size="md" mb={2} pr={8}>{node.name}</Heading>
      <Badge colorScheme="gray">{`Type: ${node.label}`}</Badge>
      
      {node.label === 'Problem' && node.url && (
        <Link href={node.url} isExternal mt={4} color={accentColor} _hover={{ opacity: 0.8 }}>
          <HStack spacing={2}>
            <ChakraText>View Problem</ChakraText>
            <ExternalLink size={16} />
          </HStack>
        </Link>
      )}
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
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial
          color="#111111"
          emissive={color}
          emissiveIntensity={isHovered ? 1.2 : 0.8}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <Text
        position={[0, 7, 0]}
        fontSize={2.5}
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
  const controlsRef = useRef<TrackballControlsImpl>(null);

  useEffect(() => {
    const nodes: SimulationNode[] = data.nodes.map(node => ({ ...node }));
    const links: GraphLinkType[] = data.links.map(link => ({ ...link }));
    const simulation = forceSimulation(nodes, 3)
      .force("link", forceLink(links).id((d: SimulationNode) => d.id).distance(60))
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter())
      .force("collide", forceCollide().radius(12));
    simulation.on("tick", () => {
      setGraphData({ nodes: [...nodes], links: links as unknown as SimulationLink[] });
    });
    return () => simulation.stop();
  }, [data]);

  if (!graphData) return null;

  return (
    <>
      <fog attach="fog" args={['#111117', 50, 250]} />
      <hemisphereLight intensity={0.5} groundColor="black" />
      <spotLight position={[50, 50, 50]} angle={0.3} penumbra={1} intensity={1.5} castShadow />

      {graphData.nodes.map((node) => (
        <GraphNode key={node.id} node={node} onClick={onNodeClick} />
      ))}

      {graphData.links.map((link) => {
        const sourcePos: [number, number, number] = [link.source.x || 0, link.source.y || 0, link.source.z || 0];
        const targetPos: [number, number, number] = [link.target.x || 0, link.target.y || 0, link.target.z || 0];
        return (
          <Line
            key={`${link.source.id}-${link.target.id}`}
            points={[sourcePos, targetPos]}
            color="rgba(255, 255, 255, 0.3)"
            lineWidth={0.5}
          />
        );
      })}
      <TrackballControls ref={controlsRef} noZoom={false} noPan={true} rotateSpeed={3} />
    </>
  );
};

// --- PARENT COMPONENT ---
// --- PARENT COMPONENT ---
export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SimulationNode | null>(null);
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch("/api/graph");
        if (!response.ok) {
          // Throw a proper Error object to be caught below
          throw new Error(`Failed to fetch graph data: ${response.statusText}`);
        }
        const data: GraphData = await response.json();
        setGraphData(data);
      } catch (err) { // err is implicitly 'unknown'
        // ✅ FIX: Check if the caught error is an instance of Error
        if (err instanceof Error) {
          setError(err.message);
        } else {
          // Handle cases where a non-Error value was thrown
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchGraphData();
  }, []);

  const handleNodeClick = (node: SimulationNode) => {
    setSelectedNode(node);
    if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        setCameraTarget(new THREE.Vector3(node.x, node.y, node.z + 50));
    }
  };

  const closeSidebar = () => {
    setSelectedNode(null);
    setCameraTarget(null);
  };

  return (
    <Box position="relative" h="100vh" w="100%" bgGradient="linear(to-br, gray.900, black)">
      {isLoading && (
        <Center h="100%">
            <HStack>
                <Spinner color="blue.500" />
                <ChakraText>Loading Knowledge Graph...</ChakraText>
            </HStack>
        </Center>
      )}
      {error && (
        <Center h="100%" p={4}>
          <Alert status="error" variant="subtle" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        </Center>
      )}
      {!isLoading && !error && graphData && (
        <>
            <Canvas camera={{ position: [0, 0, 150], fov: 50 }}>
                <Graph data={graphData} onNodeClick={handleNodeClick} />
                <CameraAnimator target={cameraTarget} />
            </Canvas>
            <InfoSidebar node={selectedNode} onClose={closeSidebar} />
            <ChakraText fontSize="xs" color="gray.500" position="absolute" bottom={4} left={4}>
                Left-click & drag to rotate. Scroll to zoom.
            </ChakraText>
        </>
      )}
    </Box>
  );
}