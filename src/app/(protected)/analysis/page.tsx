'use client';

// 1. Import motion from framer-motion
import { motion } from 'framer-motion';
import { Box, Heading, Grid, GridItem } from '@chakra-ui/react';

// Import your page components
import PerformanceCard from '@/app/components/analysis/PerformanceCard';
import AnalyticsCard from '@/app/components/analysis/AnalyticsSection';
import MemoryCard from '@/app/components/analysis/MemoryCard'; // This is your MemoryCardSection

// 2. Create motion-enabled Chakra components
const MotionGrid = motion(Grid);
const MotionGridItem = motion(GridItem);

export default function LandingPage() {
  // 3. Define animation variants for the container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Animate children with a 0.2s delay between them
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 }, // Start 20px below and invisible
    visible: {
      y: 0,
      opacity: 1, // Animate to original position and fully visible
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    // Use a Box for overall padding and layout
    <Box p={{ base: 4, md: 8 }} h="100vh">
      <Heading as="h1" size="xl" mb={6}>
        Analysis Dashboard
      </Heading>

      {/* 4. Apply the variants to the motion components */}
      <MotionGrid
        h="calc(100% - 80px)" // Adjust height to account for heading
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(2, 1fr)"
        gap={6}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <MotionGridItem rowSpan={1} colSpan={1} variants={itemVariants}>
          <AnalyticsCard />
        </MotionGridItem>

        <MotionGridItem rowSpan={1} colSpan={1} variants={itemVariants}>
          {/* Your MemoryCard component with its internal animations will work perfectly here */}
          <MemoryCard />
        </MotionGridItem>

        <MotionGridItem rowSpan={1} colSpan={2} variants={itemVariants}>
          <PerformanceCard />
        </MotionGridItem>
      </MotionGrid>
    </Box>
  );
}