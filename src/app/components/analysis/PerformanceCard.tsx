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
  Spacer,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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
  startDate: Date;
  endDate: Date;
  isMobile?: boolean;
}

/**
 * Renders the GitHub-style contribution heatmap for a given date range.
 * @param {ContributionGraphProps} props - The component props.
 */
/**
 * Renders the GitHub-style contribution heatmap for a given date range.
 * @param {ContributionGraphProps} props - The component props.
 */
function ContributionGraph({ data, width, startDate, endDate, isMobile = false }: ContributionGraphProps) {
  // ✨ NEW: State to manage which tooltip is open on mobile
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);

  const dataMap = useMemo(() => new Map(data.map(d => [d.date, d.count])), [data]);
  const maxCount = useMemo(() => d3.max(data, d => d.count) || 0, [data]);

  const colorScale = useMemo(() =>
    d3.scaleSequential(d3.interpolateBuPu)
      .domain([-0.1, maxCount])
      .clamp(true),
  [maxCount]);

  const cellPadding = 3;
  const topMargin = 20;
  const leftMargin = isMobile ? 15 : 30;
  const rightMargin = isMobile ? 15 : 25;

  const numWeeks = d3.timeWeek.count(startDate, endDate);
  const gridWidth = width - leftMargin - rightMargin;
  const cellSize = (gridWidth - (numWeeks - 1) * cellPadding) / (isMobile ? numWeeks + 1.5 : numWeeks);
  
  const DAYS_IN_WEEK = 7;
  const gridHeight = DAYS_IN_WEEK * cellSize + (DAYS_IN_WEEK - 1) * cellPadding;
  const svgHeight = gridHeight + topMargin + 10;

  const days = d3.timeDays(startDate, endDate);
  const monthLabels = d3.timeMonths(d3.timeMonth.offset(startDate, 0), endDate).map(month => ({
    month,
    x: d3.timeWeek.count(startDate, month) * (cellSize + cellPadding)
  }));

  const dayLabels = [ { day: 1, label: 'M' }, { day: 3, label: 'W' }, { day: 5, label: 'F' } ];
  const cellColor = '#2D2D2D';
  
  // ✨ NEW: Click handler to close tooltips when tapping the background
  const handleBackgroundClick = () => {
    if (isMobile) {
      setActiveCellIndex(null);
    }
  };

  return (
    <svg width={width} height={svgHeight} onClick={handleBackgroundClick}>
      <g transform={`translate(${leftMargin}, ${topMargin})`}>
        {!isMobile && dayLabels.map(({ day, label }) => (
          <text key={day} x={-15} y={day * (cellSize + cellPadding) + cellSize / 2} dy="0.3em" fontSize="10px" textAnchor="middle" fill="gray">
            {label}
          </text>
        ))}
        {monthLabels.map(({ month, x }, i) => (
          <text key={i} x={x} y={-8} fontSize="12px" fill="gray" textAnchor="start">
            {d3.timeFormat('%b')(month)}
          </text>
        ))}
        {days.map((day, i) => {
          const dayString = d3.timeFormat('%Y-%m-%d')(day);
          const count = dataMap.get(dayString) || 0;
          const weekIndex = d3.timeWeek.count(startDate, day);
          const dayIndex = day.getDay();
          const x = weekIndex * (cellSize + cellPadding);
          const y = dayIndex * (cellSize + cellPadding);
          const color = count > 0 ? colorScale(count) : cellColor;

          // ✨ NEW: Click handler for individual cells
          const handleCellClick = (e: React.MouseEvent) => {
            if (isMobile) {
              e.stopPropagation(); // Prevent background click from firing
              setActiveCellIndex(activeCellIndex === i ? null : i); // Toggle this cell's tooltip
            }
          };

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
              // 🔧 MODIFIED: Manually control open state on mobile
              isOpen={isMobile ? activeCellIndex === i : undefined}
            >
              <chakra.rect 
                x={x} 
                y={y} 
                width={cellSize > 0 ? cellSize : 0} 
                height={cellSize > 0 ? cellSize : 0} 
                fill={color} 
                rx={3} 
                ry={3}
                // 🔧 MODIFIED: Add mobile click handler
                onClick={handleCellClick}
                // Disable pointer events on mobile if no contribution, so you can't open an empty tooltip
                cursor={count > 0 ? 'pointer' : 'default'}
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
  const [displayDate, setDisplayDate] = useState(new Date());
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await fetch('/api/user/activity', { headers: { 'x-timezone': userTimezone } });
        if (!response.ok) throw new Error('Performance data not found');
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) setWidth(entries[0].contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const { total, activeDays, maxStreak } = useMemo(() => {
    if (!data.length) return { total: 0, activeDays: 0, maxStreak: 0 };
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const dateSet = new Set(data.filter(d => d.count > 0).map(d => d.date));
    const activeDays = dateSet.size;
    let maxStreak = 0; let currentStreak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date(); date.setDate(date.getDate() - i);
      const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      if (dateSet.has(dateString)) { currentStreak++; } else { maxStreak = Math.max(maxStreak, currentStreak); currentStreak = 0; }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    return { total, activeDays, maxStreak };
  }, [data]);

  const colorScale = useMemo(() => d3.scaleSequential(d3.interpolateBuPu).domain([-0.1, d3.max(data, d => d.count) || 0]).clamp(true), [data]);

  const today = new Date();
  const yearAgo = new Date();
  yearAgo.setFullYear(today.getFullYear() - 1);
  yearAgo.setDate(yearAgo.getDate() + 1);

  const yearEndDate = new Date();
  yearEndDate.setDate(today.getDate() + 1);

  const monthStartDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
  const monthEndDate = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1);
  
  const handlePrevMonth = () => {
    setDisplayDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setDisplayDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const isNextDisabled = displayDate.getFullYear() === today.getFullYear() && displayDate.getMonth() === today.getMonth();
  const isPrevDisabled = displayDate.getFullYear() === yearAgo.getFullYear() && displayDate.getMonth() === yearAgo.getMonth();

  return (
    <Box ref={containerRef} p={{ base: 4, md: 6 }} bg="#1C1C1E" borderRadius="xl" w="100%" border="1px" borderColor="whiteAlpha.100">
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
            <Center h="160px"><VStack><Spinner color="purple.400" /><Text color="gray.500" mt={2}>Loading performance data...</Text></VStack></Center>
          ) : width > 0 && data.length > 0 ? (
            <VStack align="stretch" spacing={3}>
              {isMobile && (
                <Flex align="center" justify="space-between">
                  <IconButton icon={<ChevronLeft />} aria-label="Previous month" variant="ghost" onClick={handlePrevMonth} isDisabled={isPrevDisabled} />
                  <Text fontSize="sm" fontWeight="medium" color="gray.300">{d3.timeFormat('%B %Y')(displayDate)}</Text>
                  <IconButton icon={<ChevronRight />} aria-label="Next month" variant="ghost" onClick={handleNextMonth} isDisabled={isNextDisabled} />
                </Flex>
              )}
              
              <ContributionGraph 
                data={data} 
                width={width} 
                startDate={isMobile ? monthStartDate : yearAgo}
                endDate={isMobile ? monthEndDate : yearEndDate}
                isMobile={isMobile}
              />

              <Flex justify="flex-end" pr={2}>
                 <Legend colorScale={colorScale} />
              </Flex>
            </VStack>
          ) : (
            <Center h="160px"><VStack color="gray.500"><Calendar size={48} strokeWidth={1} /><Text mt={2}>No problems solved recently.</Text></VStack></Center>
          )}
        </Box>
      </VStack>
    </Box>
  );
}