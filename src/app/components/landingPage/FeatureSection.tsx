'use client'
import { Box, Container, Heading, Text, VStack, Grid } from '@chakra-ui/react'
import { Bug, Database, LineChart, Share2 } from 'lucide-react'
import { FC, ReactElement } from 'react'

// A reusable card component for a more structured and stylish look
interface FeatureCardProps {
  icon: ReactElement;
  title: string;
  desc: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, desc }) => {
  return (
    <VStack
      w="100%" // Take the full width of the grid column
      h="100%" // Ensure all cards in a row have the same height
      spacing={5}
      p={8}
      bg="whiteAlpha.50" // Semi-transparent background
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="2xl"
      backdropFilter="blur(10px)" // Frosted glass effect
      transition="all 0.2s"
      _hover={{
        bg: 'whiteAlpha.100',
        borderColor: 'whiteAlpha.300',
        transform: 'translateY(-5px)'
      }}
    >
      <Box color="purple.300">{icon}</Box>
      <Heading as="h3" size="md" textAlign="center">{title}</Heading>
      <Text color="gray.400" textAlign="center">{desc}</Text>
    </VStack>
  )
}

export function FeaturesSection() {
  return (
    <Box as="section" py={24} bg="black">
      <Container maxW="1200px" px={{ base: 6, md: 10 }}>
        <Heading size="xl" mb={16} textAlign="center" color="white">
          Core Capabilities
        </Heading>
        {/* Using Grid for a responsive layout that aligns items in columns */}
        <Grid
          templateColumns={{
            base: '1fr', // 1 column on small screens
            md: 'repeat(2, 1fr)', // 2 columns on medium screens
            lg: 'repeat(4, 1fr)', // 4 columns on large screens (all in one line)
          }}
          gap={8}
        >
          <FeatureCard
            icon={<Database size={40} />}
            title="Store & Tag"
            desc="Central repository with searchable tags by paradigm or pattern."
          />
          <FeatureCard
            icon={<Bug size={40} />}
            title="Auto Complexity"
            desc="Static analysis extracts time/space and English pseudocode."
          />
          <FeatureCard
            icon={<LineChart size={40} />}
            title="Skill Insights"
            desc="Track strengths across topics with visual progress metrics."
          />
          <FeatureCard
            icon={<Share2 size={40} />}
            title="Knowledge Graph"
            desc="Interconnect algorithms to discover prerequisite gaps."
          />
        </Grid>
      </Container>
    </Box>
  )
}
