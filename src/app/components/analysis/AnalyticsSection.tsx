"use client";

import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  useTheme,
  SimpleGrid,
  Spacer,
  chakra,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo, useRef } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import * as d3 from "d3";

// --- (Type Definitions and other components remain the same) ---
type DifficultyCounts = {
  easy: number;
  medium: number;
  hard: number;
};

type TopicStats = {
  domain: string;
  total: number;
};

interface TopicPieChartProps {
  data: TopicStats[];
  colorScale: d3.ScaleOrdinal<string, string>;
  size: number;
  hoveredTopic: string | null;
}

function TopicPieChart({
  data,
  colorScale,
  size,
  hoveredTopic,
}: TopicPieChartProps) {
  const ref = useRef<SVGSVGElement>(null);
  const total = useMemo(() => d3.sum(data, (d) => d.total), [data]);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    const pullDistance = 8;
    const radius = size / 2 - pullDistance;
    const innerRadius = radius * 0.65;

    const g = svg
      .selectAll("g")
      .data([null])
      .join("g")
      .attr("transform", `translate(${size / 2}, ${size / 2})`);

    const pie = d3
      .pie<TopicStats>()
      .value((d) => d.total)
      .sort(null);

    const arcGenerator = d3
      .arc<d3.PieArcDatum<TopicStats>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .padAngle(0.02)
      .cornerRadius(4);

    g.selectAll("path")
      .data(pie(data))
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("fill", (d) => colorScale(d.data.domain))
            .style("opacity", 0)
            .call((enter) =>
              enter
                .transition("enter")
                .duration(800)
                .delay((d, i) => i * 80)
                .style("opacity", 1)
                .attrTween("d", function (d) {
                  const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                  return function (t) {
                    return arcGenerator(i(t)) || "";
                  };
                })
            ),
        (update) =>
          update.call((update) =>
            update
              .transition("update")
              .duration(300)
              .attr("transform", (d) => {
                if (hoveredTopic === d.data.domain) {
                  const [x, y] = arcGenerator.centroid(d);
                  const angle = Math.atan2(y, x);
                  const tx = Math.cos(angle) * pullDistance;
                  const ty = Math.sin(angle) * pullDistance;
                  return `translate(${tx},${ty})`;
                }
                return "translate(0,0)";
              })
          ),
        (exit) => exit.remove()
      );
  }, [data, colorScale, size, hoveredTopic]);

  return (
    <Box position="relative" w={size} h={size}>
      <svg ref={ref} width={size} height={size} />
      <Center
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
      >
        <VStack spacing={0}>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color="whiteAlpha.900"
            lineHeight="1"
          >
            {total}
          </Text>
          <Text fontSize="xs" color="gray.400">
            Total Solved
          </Text>
        </VStack>
      </Center>
    </Box>
  );
}

interface TopicLegendProps {
  data: TopicStats[];
  colorScale: d3.ScaleOrdinal<string, string>;
  onHover: (domain: string | null) => void;
}

function TopicLegend({ data, colorScale, onHover }: TopicLegendProps) {
  return (
    <VStack spacing={1} w="100%" align="stretch">
      {data.map((topic) => (
        <HStack
          key={topic.domain}
          p={2}
          borderRadius="md"
          transition="background 0.2s"
          _hover={{ bg: "whiteAlpha.100" }}
          onMouseEnter={() => onHover(topic.domain)}
          onMouseLeave={() => onHover(null)}
        >
          <Box
            w="8px"
            h="8px"
            bg={colorScale(topic.domain)}
            borderRadius="full"
          />
          <Text fontSize="sm" color="whiteAlpha.800" noOfLines={1}>
            {topic.domain}
          </Text>
          <Spacer />
          <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.900">
            {topic.total}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

export default function AnalyticsSection() {
  const [analyticsData, setAnalyticsData] = useState<{
    topics: TopicStats[];
    difficulties: DifficultyCounts;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/user/analytics");
        if (!response.ok) {
          throw new Error("Analytics data not found");
        }
        const result = await response.json();
        setAnalyticsData(result);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setAnalyticsData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const topicColorScale = useMemo(() => {
    if (!theme || !theme.colors) {
      return d3.scaleOrdinal<string>();
    }
    const colors = [
      theme.colors.purple[400],
      theme.colors.pink[400],
      theme.colors.teal[300],
      theme.colors.orange[400],
      theme.colors.cyan[400],
      theme.colors.red[400],
      theme.colors.green[400],
      theme.colors.blue[400],
      theme.colors.yellow[400],
      theme.colors.purple[700],
      theme.colors.pink[300],
      theme.colors.teal[500],
      theme.colors.orange[300],
      theme.colors.gray[500],
    ];
    return d3.scaleOrdinal<string>().range(colors);
  }, [theme]);

  const topTopics = useMemo(
    () => analyticsData?.topics.slice(0, 15) || [],
    [analyticsData]
  );

  return (
    <Box
      p={{ base: 3, md: 4 }}
      bg="#1C1C1E"
      borderRadius="xl"
      w="100%"
      minH={{ base: "300px", md: "100%" }}
      border="1px"
      borderColor="whiteAlpha.100"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Heading
        as="h3"
        size={{ base: "sm", md: "md" }}
        color="whiteAlpha.900"
        mb={{ base: 3, md: 4 }}
      >
        Analytics
      </Heading>

      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minW={0}
      >
        {isLoading ? (
          <Spinner color="purple.400" />
        ) : analyticsData && topTopics.length > 0 ? (
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 4, md: 6 }}
            w="100%"
            alignItems="center"
            minW={0}
          >
            {/* Chart Section */}
            <Center minW={0}>
              <TopicPieChart
                data={topTopics}
                colorScale={topicColorScale}
                size={Math.min(220, window?.innerWidth > 768 ? 220 : 180)}
                hoveredTopic={hoveredTopic}
              />
            </Center>

            {/* Legend & Stats Section */}
            <VStack align="stretch" spacing={3} minW={0}>
              {/* Scrollable Container for the Legend */}
              <Box
                maxHeight={{ base: "150px", md: "190px" }}
                overflowY="auto"
                pr={2}
                minW={0}
                css={{
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-track": { background: "transparent" },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#4A5568",
                    borderRadius: "24px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": { background: "#718096" },
                }}
              >
                <TopicLegend
                  data={topTopics}
                  colorScale={topicColorScale}
                  onHover={setHoveredTopic}
                />
              </Box>
              <HStack
                spacing={{ base: 2, md: 3 }}
                color="gray.400"
                justify="center"
                w="100%"
                wrap="wrap"
                pt={2}
                minW={0}
              >
                <HStack align="center" spacing={1.5}>
                  <Box w="8px" h="8px" bg="green.400" borderRadius="full" />
                  <Text fontSize="xs">
                    Easy:{" "}
                    <chakra.span fontWeight="bold" color="whiteAlpha.800">
                      {analyticsData.difficulties.easy}
                    </chakra.span>
                  </Text>
                </HStack>
                <HStack align="center" spacing={1.5}>
                  <Box w="8px" h="8px" bg="yellow.400" borderRadius="full" />
                  <Text fontSize="xs">
                    Medium:{" "}
                    <chakra.span fontWeight="bold" color="whiteAlpha.800">
                      {analyticsData.difficulties.medium}
                    </chakra.span>
                  </Text>
                </HStack>
                <HStack align="center" spacing={1.5}>
                  <Box w="8px" h="8px" bg="red.400" borderRadius="full" />
                  <Text fontSize="xs">
                    Hard:{" "}
                    <chakra.span fontWeight="bold" color="whiteAlpha.800">
                      {analyticsData.difficulties.hard}
                    </chakra.span>
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </SimpleGrid>
        ) : (
          <VStack color="gray.600">
            <PieChartIcon size={48} strokeWidth={1} />
            <Text>No analytics data available.</Text>
          </VStack>
        )}
      </Box>
    </Box>
  );
}
