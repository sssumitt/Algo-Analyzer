'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Center,
  chakra,
  HStack,
  Tooltip,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { useEffect, useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { Calendar } from 'lucide-react';

/**
 * Type definition for daily problem submission counts.
 */
type DailyProblemCount = {
  date: string; // Format: YYYY-MM-DD
  count: number;
};

interface ContributionGraphProps {
  data: DailyProblemCount[];
  width: number;
}

/**
 * Renders the GitHub-style contribution heatmap.
 * @param {ContributionGraphProps} props - The component props.
 */
function ContributionGraph({ data, width }: ContributionGraphProps) {
  const today = new Date();
  const yearAgo = new Date();
  yearAgo.setFullYear(today.getFullYear() - 1);
  yearAgo.setDate(yearAgo.getDate() + 1);

  // Create a 'tomorrow' date to make the D3 range inclusive of today.
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const dataMap = useMemo(() => new Map(data.map(d => [d.date, d.count])), [data]);
  const maxCount = useMemo(() => d3.max(data, d => d.count) || 0, [data]);

  const colorScale = useMemo(() =>
    d3.scaleSequential(d3.interpolateBuPu) // Using a darker blue-purple palette
      .domain([-0.1, maxCount]) // Start domain slightly below 0 for better color scale
      .clamp(true),
  [maxCount]);

  // --- Corrected Layout Calculations ---
  const WEEKS_IN_YEAR = 53;
  const DAYS_IN_WEEK = 7;
  const cellPadding = 3;
  const leftMargin = 30;  // Space for day labels
  const topMargin = 20;   // Space for month labels
  const rightMargin = 10; // Extra space on the right

  // Available width for the grid = total width - horizontal margins.
  const gridWidth = width - leftMargin - rightMargin;
  
  // The available width must be divided among 53 cells and 52 gaps.
  // gridWidth = (53 * cellSize) + (52 * cellPadding)
  const cellSize = (gridWidth - (WEEKS_IN_YEAR - 1) * cellPadding) / WEEKS_IN_YEAR;

  // Calculate the total height needed for the SVG.
  const gridHeight = DAYS_IN_WEEK * cellSize + (DAYS_IN_WEEK - 1) * cellPadding;
  const svgHeight = gridHeight + topMargin + 10; // Add margin for top and bottom.

  const days = d3.timeDays(yearAgo, tomorrow);

  const monthLabels = d3.timeMonths(d3.timeMonth.offset(yearAgo, 1), today).map(month => ({
    month,
    // Position month labels relative to the grid group.
    x: d3.timeWeek.count(yearAgo, month) * (cellSize + cellPadding)
  }));

  const dayLabels = [
    { day: 1, label: 'M' },
    { day: 3, label: 'W' },
    { day: 5, label: 'F' },
  ];

  const cellColor = '#2D2D2D'; // Fixed dark theme color for empty cells

  return (
    <svg width={width} height={svgHeight}>
      <g transform={`translate(${leftMargin}, ${topMargin})`}>
        {/* Day of the week labels (M, W, F) */}
        {dayLabels.map(({ day, label }) => (
          <text
            key={day}
            x={-15} // Positioned to the left of the grid
            y={day * (cellSize + cellPadding) + cellSize / 2}
            dy="0.3em"
            fontSize="10px"
            textAnchor="middle"
            fill="gray"
          >
            {label}
          </text>
        ))}

        {/* Month labels (Oct, Nov, Dec...) */}
        {monthLabels.map(({ month, x }, i) => (
          <text
            key={i}
            x={x}
            y={-8} // Positioned above the grid
            fontSize="12px"
            fill="gray"
            textAnchor="start"
          >
            {d3.timeFormat('%b')(month)}
          </text>
        ))}

        {/* Contribution cells */}
        {days.map((day, i) => {
          const dayString = d3.timeFormat('%Y-%m-%d')(day);
          const count = dataMap.get(dayString) || 0;

          const weekIndex = d3.timeWeek.count(yearAgo, day);
          const dayIndex = day.getDay();

          const x = weekIndex * (cellSize + cellPadding);
          const y = dayIndex * (cellSize + cellPadding);

          const color = count > 0 ? colorScale(count) : cellColor;

          return (
            <Tooltip
              key={i}
              label={`${count} problems on ${d3.timeFormat('%b %d, %Y')(day)}`}
              hasArrow
              placement="top"
              bg="gray.900"
              borderColor="gray.700"
              borderWidth="1px"
              color="white"
            >
              <chakra.rect
                x={x}
                y={y}
                width={cellSize > 0 ? cellSize : 0}   // Prevent negative width on resize
                height={cellSize > 0 ? cellSize : 0}  // Prevent negative height on resize
                fill={color}
                rx={3}
                ry={3}
              />
            </Tooltip>
          );
        })}
      </g>
    </svg>
  );
}

/**
 * Renders the color legend for the contribution graph.
 */
function Legend({ colorScale }: { colorScale: d3.ScaleSequential<string, never> }) {
  const legendColors = [0, 0.25, 0.5, 0.75, 1].map(t => colorScale(colorScale.domain()[1] * t));
  return (
    <HStack spacing={1} align="center">
      <Text fontSize="xs" color="gray.400">Less</Text>
      {legendColors.map((color, i) => (
        <Box key={i} w="12px" h="12px" bg={color} borderRadius="sm" />
      ))}
      <Text fontSize="xs" color="gray.400">More</Text>
    </HStack>
  );
}

/**
 * The main component card that fetches and displays user performance data.
 */
export default function PerformanceCard() {
  const [data, setData] = useState<DailyProblemCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  /**
   * Fetches performance data from the API on component mount.
   */
  useEffect(() => {
  // In your PerformanceCard component
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get the browser's timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const response = await fetch('/api/user/activity', {
          headers: {
            // Send the timezone in the custom header
            'x-timezone': userTimezone,
          },
        });

        if (!response.ok) {
          throw new Error('Performance data not found');
        }
        const result: DailyProblemCount[] = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching performance data:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Observes the container width to make the SVG chart responsive.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  /**
   * Calculates performance stats. Memoized for performance.
   */
  const { total, activeDays, maxStreak } = useMemo(() => {
    if (!data.length) return { total: 0, activeDays: 0, maxStreak: 0 };

    const total = data.reduce((sum, d) => sum + d.count, 0);
    const dateSet = new Set(data.filter(d => d.count > 0).map(d => d.date));
    const activeDays = dateSet.size;

    let maxStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Format date manually to avoid timezone bugs.
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      if (dateSet.has(dateString)) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 0;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    return { total, activeDays, maxStreak };
  }, [data]);

  const colorScale = useMemo(() =>
    d3.scaleSequential(d3.interpolateBuPu) // Using a darker blue-purple palette
      .domain([-0.1, d3.max(data, d => d.count) || 0])
      .clamp(true),
  [data]);

  return (
    <Box
      ref={containerRef}
      p={{ base: 4, md: 6 }}
      bg="#1C1C1E"
      borderRadius="xl"
      w="100%"
      border="1px"
      borderColor="whiteAlpha.100"
    >
      <VStack align="stretch" spacing={4}>
        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} gap={{ base: 2, md: 4 }}>
          <Heading as="h3" size="md" color="whiteAlpha.900" flexShrink={0}>
            {isLoading ? 'Loading...' : `${total} problems in the last year`}
          </Heading>
          <Spacer />
          <HStack color="gray.400" fontSize="sm" spacing={4}>
            <Text>Active days: <chakra.span color="whiteAlpha.800" fontWeight="bold">{activeDays}</chakra.span></Text>
            <Text>Max streak: <chakra.span color="whiteAlpha.800" fontWeight="bold">{maxStreak}</chakra.span></Text>
          </HStack>
        </Flex>

        <Box minH="160px">
          {isLoading ? (
            <Center h="160px">
              <VStack>
                <Spinner color="purple.400" />
                <Text color="gray.500" mt={2}>Loading performance data...</Text>
              </VStack>
            </Center>
          ) : width > 0 && data.length > 0 ? (
            <VStack align="stretch" spacing={3}>
              <ContributionGraph data={data} width={width} />
              <Flex justify="flex-end" pr={2}>
                 <Legend colorScale={colorScale} />
              </Flex>
            </VStack>
          ) : (
            <Center h="160px">
              <VStack color="gray.500">
                <Calendar size={48} strokeWidth={1} />
                <Text mt={2}>No problems solved recently.</Text>
              </VStack>
            </Center>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
