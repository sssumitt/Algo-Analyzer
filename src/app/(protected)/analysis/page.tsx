'use client';

import { motion } from 'framer-motion';
import { Box, Heading, Grid, GridItem } from '@chakra-ui/react';

import PerformanceCard from '@/app/components/analysis/PerformanceCard';
import AnalyticsCard from '@/app/components/analysis/AnalyticsSection';
import MemoryCard from '@/app/components/analysis/MemoryCard';

const MotionGrid = motion(Grid);
const MotionGridItem = motion(GridItem);

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Box p={{ base: 4, md: 8 }} minH="100vh">
      <Heading as="h1" size="xl" mb={6}>
        Analysis Dashboard
      </Heading>

      <MotionGrid
        h="calc(100% - 80px)"
        // 👇 Make the grid's columns and rows responsive
        templateRows={{ base: 'repeat(3, 1fr)', md: 'repeat(2, 1fr)' }}
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
        gap={6}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* AnalyticsCard */}
        <MotionGridItem
          // 👇 On mobile (base), it spans 1 column. On desktop (md), it also spans 1.
          colSpan={{ base: 1, md: 1 }}
          rowSpan={1}
          variants={itemVariants}
        >
          <AnalyticsCard />
        </MotionGridItem>

        {/* MemoryCard */}
        <MotionGridItem
          // 👇 Same responsive logic for this card
          colSpan={{ base: 1, md: 1 }}
          rowSpan={1}
          variants={itemVariants}
        >
          <MemoryCard />
        </MotionGridItem>

        {/* PerformanceCard */}
        <MotionGridItem
          // 👇 On mobile, this spans the single column. On desktop, it spans two.
          colSpan={{ base: 1, md: 2 }}
          rowSpan={1}
          variants={itemVariants}
        >
          <PerformanceCard />
        </MotionGridItem>
      </MotionGrid>
    </Box>
  );
}