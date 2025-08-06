"use client";

import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Spinner,
  Text,
  VStack,
  useToast,
  Center,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  SimpleGrid,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { useState } from "react";
import { FileText, NotebookPen } from "lucide-react";
// Assuming CodeWindow is in this path
import { CodeWindow } from "@/app/components/CodeWindow";

// --- Types and Interfaces ---
type AnalysisJSON = {
  pseudoCode: string[];
  time: string;
  space: string;
  tags: string[];
};

interface UploadQuestionFormProps {
  onSubmit: (link: string, code: string, notes: string) => void;
  isLoading: boolean;
}

interface ResultItem {
  label: string;
  value: string;
}
interface ResultSectionProps {
  pseudoCode: string[]; // pseudoCode is an array of strings (lines)
  results: ResultItem[];
}

// --- UI Components ---

/**
 * A styled form for submitting code for analysis.
 */
function UploadQuestionForm({ onSubmit, isLoading }: UploadQuestionFormProps) {
  const [link, setLink] = useState("");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    onSubmit(link, code, notes);
  };

  return (
    <Box
      p={{ base: 6, md: 8 }}
      bg="#1C1C1E"
      borderRadius="xl"
      h="100%" // Make the container fill the available height
      position="relative" // Needed for absolute positioning of the icon button
    >
      <Tooltip label="Add Notes" hasArrow  placement="top">
        <IconButton
          padding={3}
          aria-label="Add notes"
          icon={<NotebookPen size={30} />}
          isRound
          variant="ghost"
          color="purple.300"
          position="absolute"
          top={{ base: 4, md: 7 }}
          right={{ base: 4, md: 6 }}
          onClick={onOpen}
          _hover={{ bg: "whiteAlpha.200" }}
        />
      </Tooltip>

      <form onSubmit={handleSubmit} style={{ height: "100%" }}>
        <VStack spacing={6} align="stretch" h="100%">
          <Heading as="h2" size="lg">
            Submit for Analysis
          </Heading>
          <FormControl>
            <FormLabel color="gray.400">Problem Link</FormLabel>
            <Input
              placeholder="e.g., https://leetcode.com/problems/two-sum/"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              bg="gray.800"
              borderColor="gray.700"
              _hover={{ borderColor: "gray.600" }}
              _focus={{
                borderColor: "purple.400",
                boxShadow: "0 0 0 1px #B794F4",
              }}
            />
          </FormControl>
          <FormControl
            isRequired
            display="flex"
            flexDirection="column"
            flexGrow={1}
          >
            <FormLabel color="gray.400">Code Snippet</FormLabel>
            <Textarea
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              bg="gray.800"
              borderColor="gray.700"
              _hover={{ borderColor: "gray.600" }}
              _focus={{
                borderColor: "purple.400",
                boxShadow: "0 0 0 1px #B794F4",
              }}
              fontFamily="monospace"
              fontSize="sm"
              flexGrow={1}
              resize="none"
            />
          </FormControl>
          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            bgGradient="linear(to-r, purple.500, pink.500)"
            _hover={{
              bgGradient: "linear(to-r, purple.600, pink.600)",
            }}
            isDisabled={!code || isLoading}
          >
            Analyze
          </Button>
        </VStack>
      </form>

      {/* Notes Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered >
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg="#1C1C1E" color="white">
          <ModalHeader>Add Your Notes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              placeholder="Enter any notes, thoughts, or reflections on your approach..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              bg="gray.800"
              borderColor="gray.700"
              _focus={{
                borderColor: "purple.400",
                boxShadow: "0 0 0 1px #B794F4",
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

/**
 * A styled section to display the analysis results.
 */
function ResultSection({ pseudoCode, results }: ResultSectionProps) {
  return (
    <VStack spacing={10} align="stretch" w="full" h="100%">
      <Box>
        <Heading as="h2" size="lg" mb={6} color="whiteAlpha.900">
          Complexity & Tags
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {results.map((result) => (
            <VStack key={result.label} align="flex-start" spacing={1}>
              <Text fontSize="md" color="gray.400">
                {result.label}
              </Text>
              <Text
                fontWeight="bold"
                fontSize="xl"
                whiteSpace="pre-wrap"
                color="whiteAlpha.900"
                wordBreak="break-word"
              >
                {result.value}
              </Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Box>
      <Divider borderColor="gray.700" />
      <Box flex={1} minH={0} display="flex" flexDirection="column">
        <Heading as="h2" size="lg" mb={6} color="whiteAlpha.900">
          Pseudocode
        </Heading>
        <Box
          flex={1}
          overflowY="auto"
          overflowX="auto"
          sx={{
            "&::-webkit-scrollbar": { width: "8px", height: "8px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "gray.600",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "gray.500" },
          }}
        >
          <CodeWindow lines={pseudoCode} />
        </Box>
      </Box>
    </VStack>
  );
}

// --- Main Dashboard Page ---

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisJSON | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  /** Type-guard to verify the server really returned an AnalysisJSON */
  const isAnalysisJSON = (data: unknown): data is AnalysisJSON => {
    if (typeof data !== "object" || data === null) return false;
    const d = data as Record<string, unknown>;
    return (
      Array.isArray(d.pseudoCode) &&
      typeof d.time === "string" &&
      typeof d.space === "string" &&
      Array.isArray(d.tags)
    );
  };

  const runAnalysis = async (link: string, code: string, notes: string) => {
    setAnalysis(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, code, notes }),
      });

      const text = await res.text();
      const payload: unknown = JSON.parse(text);

      if (!res.ok) {
        const errorMessage =
          typeof payload === "object" && payload !== null && "error" in payload
            ? (payload as { error?: string }).error ?? "Gemini analysis failed"
            : "Gemini analysis failed";
        throw new Error(errorMessage);
      }

      if (isAnalysisJSON(payload)) {
        setAnalysis(payload);
        console.log("Analysis result:", payload);
      } else {
        throw new Error("Unexpected response shape from server");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      toast({ status: "error", title: message, isClosable: true });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="#121212" color="white" minH="100vh">
      <Container maxW="1500px" py={12} px={{ base: 4, md: 10 }}>
        <Grid
          templateColumns={{ base: "1fr", lg: "1.5fr 2.5fr" }}
          gap={{ base: 8, lg: 12 }}
          alignItems="stretch" // Make grid items stretch to match height
          h={{ lg: "calc(100vh - 150px)" }} // Set grid height to fill viewport minus padding
        >
          <GridItem as="aside">
            <UploadQuestionForm onSubmit={runAnalysis} isLoading={isLoading} />
          </GridItem>
          <GridItem as="main" overflow="hidden">
            <Box
              p={{ base: 6, md: 10 }}
              bg="#1C1C1E"
              borderRadius="xl"
              h="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {isLoading ? (
                <Center h="100%">
                  <VStack spacing={4}>
                    <Spinner size="xl" color="purple.400" thickness="4px" />
                    <Text color="gray.400">Analyzing your code...</Text>
                  </VStack>
                </Center>
              ) : analysis ? (
                <ResultSection
                  pseudoCode={analysis.pseudoCode}
                  results={[
                    { label: "Time", value: analysis.time },
                    { label: "Space", value: analysis.space },
                    { label: "Tags", value: analysis.tags.join(",\n") },
                  ]}
                />
              ) : (
                <Center h="100%">
                  <VStack spacing={4} color="gray.600">
                    <FileText size={64} strokeWidth={1} />
                    <Text fontSize="lg">
                      Your analysis results will appear here
                    </Text>
                  </VStack>
                </Center>
              )}
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
