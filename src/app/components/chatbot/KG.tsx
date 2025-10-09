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
  forceX,
  forceY,
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
  Link,
  Text as ChakraText,
  IconButton,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { X, ExternalLink } from "lucide-react";

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

// --- HELPER & UI COMPONENTS ---

const CameraAnimator = ({ target }: { target: THREE.Vector3 | null }) => {
  useFrame((state) => {
    const controls = state.controls as TrackballControlsImpl;
    if (target && controls) {
      // Animate camera to focus on the selected node
      const targetCameraPos = new THREE.Vector3(target.x, target.y, target.z + 50);
      state.camera.position.lerp(targetCameraPos, 0.05);
      controls.target.lerp(target, 0.05);
      controls.update();
    } else if (controls) {
      // Animate back to the center
      const initialTarget = new THREE.Vector3(0, 0, 0);
      state.camera.position.lerp(new THREE.Vector3(0, 0, 300), 0.05);
      controls.target.lerp(initialTarget, 0.05);
      controls.update();
    }
  });
  return null;
};

const InfoPanel = ({ node, onClose }: { node: SimulationNode | null; onClose: () => void }) => {
  const accentColor = node ? NODE_COLORS[node.label] || "#ffffff" : "#ffffff";

  return (
    <Box
      position="absolute" top="20px" right={node ? '20px' : '-320px'} // Animate slide-in/out
      width="280px" bg="rgba(10, 10, 15, 0.5)" backdropFilter="blur(10px)"
      p={5} borderRadius="lg" boxShadow="lg" color="whiteAlpha.900"
      border="1px solid" borderColor="rgba(255, 255, 255, 0.1)"
      transition="right 0.4s ease-in-out"
      zIndex={1}
    >
      {node && (
        <>
          <IconButton
            aria-label="Close panel" icon={<X size={20} />} onClick={onClose} size="sm" variant="ghost"
            position="absolute" top={2} right={2} _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
          />
          <VStack align="start" spacing={3}>
            <Box borderLeft="3px solid" borderColor={accentColor} pl={3}>
              <Heading as="h2" size="md">{node.name}</Heading>
              <ChakraText fontSize="sm" color="whiteAlpha.700">{node.label}</ChakraText>
            </Box>
            {node.label === 'Problem' && node.url && (
              <Link href={node.url} isExternal color="blue.300" _hover={{ textDecoration: 'none', color: 'blue.200' }}>
                <HStack spacing={2}>
                  <ChakraText fontWeight="medium">View Problem</ChakraText>
                  <ExternalLink size={16} />
                </HStack>
              </Link>
            )}
          </VStack>
        </>
      )}
    </Box>
  );
};

const Legend = () => (
    <Box
      position="absolute"
      top="20px"
      left="20px"
      bg="rgba(10, 10, 15, 0.5)"
      backdropFilter="blur(10px)"
      p={4}
      borderRadius="lg"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      width="160px"
      zIndex={1}
    >
      <VStack align="start" spacing={3}>
        <Heading size="sm" color="whiteAlpha.800" mb={1}>Legend</Heading>
        {Object.entries(NODE_COLORS).map(([label, color]) => (
          <HStack key={label} spacing={3}>
            <Box w="12px" h="12px" bg={color} borderRadius="full" />
            <ChakraText fontSize="sm" color="whiteAlpha.900">{label}</ChakraText>
          </HStack>
        ))}
      </VStack>
    </Box>
);

// --- CORE GRAPH COMPONENTS ---

const GraphNode = ({ node, onClick }: { node: SimulationNode; onClick: (node: SimulationNode) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = useMemo(() => NODE_COLORS[node.label] || "#ffffff", [node.label]);
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    // Smoothly interpolate node position for a fluid animation
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
        <sphereGeometry args={[5, 32, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.5}
          emissive={color}
          emissiveIntensity={isHovered ? 0.8 : 0.3}
          toneMapped={false}
        />
      </mesh>
      <Text
        position={[0, 9, 0]}
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
  const graphData = useMemo(() => {
    const nodes: SimulationNode[] = data.nodes.map(node => ({ ...node }));
    const links: SimulationLink[] = data.links.map(link => ({
        ...link,
        source: nodes.find(n => n.id === link.source)!,
        target: nodes.find(n => n.id === link.target)!,
    }));

    const layerPositions: Record<string, number> = {
      User: -150, Problem: -50, Approach: 50, Concept: 150,
    };

    const simulation = forceSimulation(nodes, 3)
      .force("link", forceLink(links).id((d: any) => d.id).distance(90).strength(0.8))
      .force("charge", forceManyBody().strength(-200))
      .force("collide", forceCollide().radius(25))
      .force("x", forceX(0).strength(0.05))
      .force("y", forceY((d: any) => layerPositions[d.label] || 0).strength(0.2));

    for (let i = 0; i < 200; ++i) simulation.tick();

    return { nodes, links };
  }, [data]);

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
        lineWidth={0.3}
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

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch("/api/graph");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  const closePanel = () => {
    setSelectedNode(null);
    setCameraTarget(null); // Signal camera to return to center
  };

  if (isLoading) {
    return (
        <Center h="100vh" w="100%" bg="#05050a">
            <HStack><Spinner color="blue.500" /><ChakraText color="whiteAlpha.800">Loading Knowledge Graph...</ChakraText></HStack>
        </Center>
    );
  }
  
  if (error) {
    return (
        <Center h="100vh" w="100%" bg="#05050a" p={4}>
            <Alert status="error" variant="subtle" borderRadius="md" bg="red.900" color="whiteAlpha.900">
                <AlertIcon color="white" />
                <Box>
                    <AlertTitle>Failed to Load Graph</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Box>
            </Alert>
        </Center>
    );
  }

  return (
    <Box position="relative" h="100vh" w="100%" bg="#05050a">
      {graphData && (
        <>
            <Legend />
            <Canvas camera={{ position: [0, 0, 300], fov: 50 }}>
                <color attach="background" args={['#05050a']} />
                <ambientLight intensity={0.2} />
                <pointLight position={[0, 0, 100]} intensity={0.4} color="white" />
                
                <Graph data={graphData} onNodeClick={handleNodeClick} />
                <CameraAnimator target={cameraTarget} />
                
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={400} intensity={0.5} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>
            <InfoPanel node={selectedNode} onClose={closePanel} />
        </>
      )}
    </Box>
  );
}