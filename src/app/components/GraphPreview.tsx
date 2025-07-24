'use client'
import { Box, Text } from '@chakra-ui/react'

/**
 * Lightweight static knowledge-graph preview using SVG.
 */
export function GraphPreview() {
  return (
    <Box
      p={5}
      rounded="lg"
      bg="rgba(255,255,255,0.04)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(4px)"
      position="relative"
    >
      <Text fontWeight="semibold" mb={2}>
        Knowledge Graph (Relationships)
      </Text>
      <Box as="svg" viewBox="0 0 300 160" w="100%" h="160px">
        <defs>
          <linearGradient id="node" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        {/* edges */}
        <line x1="90" y1="40" x2="150" y2="80" stroke="#666" />
        <line x1="210" y1="40" x2="150" y2="80" stroke="#666" />
        <line x1="150" y1="80" x2="120" y2="130" stroke="#666" />
        <line x1="150" y1="80" x2="200" y2="130" stroke="#666" />

        {/* nodes */}
        {[
          { x: 90, y: 40, label: 'DFS' },
          { x: 210, y: 40, label: 'BFS' },
          { x: 150, y: 80, label: 'Graph' },
          { x: 120, y: 130, label: 'Cycle' },
          { x: 200, y: 130, label: 'Topo' },
        ].map(n => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r="20" fill="url(#node)" opacity={0.8} />
            <text
              x={n.x}
              y={n.y + 4}
              fontSize="10"
              textAnchor="middle"
              fill="white"
              style={{ fontFamily: 'Inter, system-ui' }}
            >
              {n.label}
            </text>
          </g>
        ))}
      </Box>
      <Text mt={2} fontSize="xs" color="gray.300">
        Automatically links related algorithms & concepts.
      </Text>
    </Box>
  )
}
