"use client";

// Removed `motion` from framer-motion import
import { Box, Heading, Grid, GridItem } from "@chakra-ui/react";

// Assuming these components exist and are styled correctly
import PerformanceCard from "@/app/components/analysis/PerformanceCard";
import AnalyticsCard from "@/app/components/analysis/AnalyticsSection";
import MemoryCard from "@/app/components/analysis/MemoryCard";

// MotionGrid and MotionGridItem definitions are no longer needed

export default function LandingPage() {
  // Animation variants are no longer needed
  // const containerVariants = { ... };
  // const itemVariants = { ... };

  return (
    <Box
      w="100vw"
      minH="100vh"
      overflowX="hidden"
      p={{ base: 3, sm: 4, md: 6, lg: 8 }}
    >
      <Box maxW="100%" mx="auto">
        <Heading
          as="h1"
          size={{ base: "lg", md: "xl" }}
          mb={{ base: 4, md: 6 }}
          textAlign={{ base: "center", md: "left" }}
        >
          Analysis Dashboard
        </Heading>

        {/* Mobile-first responsive grid */}
        <Grid
          w="100%"
          templateColumns={{
            base: "1fr",
            lg: "repeat(2, 1fr)",
          }}
          templateRows={{
            base: "auto auto auto",
            lg: "auto auto",
          }}
          gap={{ base: 4, md: 6 }}
        >
          {/* Analytics Card - Full width on mobile, left column on desktop */}
          <GridItem colSpan={{ base: 1, lg: 1 }} rowSpan={1} w="100%" minW={0}>
            <Box w="100%" h="100%">
              <AnalyticsCard />
            </Box>
          </GridItem>

          {/* Memory Card - Full width on mobile, right column on desktop */}
          <GridItem colSpan={{ base: 1, lg: 1 }} rowSpan={1} w="100%" minW={0}>
            <Box w="100%" h="100%">
              <MemoryCard />
            </Box>
          </GridItem>

          {/* Performance Card - Full width on all screens, spans both columns on desktop */}
          <GridItem colSpan={{ base: 1, lg: 2 }} rowSpan={1} w="100%" minW={0}>
            <Box w="100%" h="100%">
              <PerformanceCard />
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
}

