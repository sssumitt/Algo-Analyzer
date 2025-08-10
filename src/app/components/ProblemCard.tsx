'use client';

import { useState, useTransition } from 'react';
import {
  Box,
  Badge,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  IconButton,
  Tooltip,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { Clock, Code, ExternalLink, MemoryStick, NotebookText } from 'lucide-react';
import { CodeWindow } from './CodeWindow';
import { updateAnalysisNotes } from '@/app/(protected)/repository/actions'; // Adjust path if needed

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface ProblemCardProps {
  analysisId: string; // <-- Required for updating
  href: string;
  title: string;
  difficulty: Difficulty;
  timeComplexity: string;
  spaceComplexity: string;
  pseudoCode: string[];
  notes: string;
}

const diffMap: Record<Difficulty, { bg: string; color: string }> = {
  Easy: { bg: 'green.900', color: 'green.300' },
  Medium: { bg: 'yellow.900', color: 'yellow.300' },
  Hard: { bg: 'red.900', color: 'red.300' },
};

export default function ProblemCard({
  analysisId,
  href,
  title,
  difficulty,
  timeComplexity,
  spaceComplexity,
  pseudoCode,
  notes,
}: ProblemCardProps) {
  const { isOpen: isPseudoCodeOpen, onOpen: onPseudoCodeOpen, onClose: onPseudoCodeClose } = useDisclosure();
  const { isOpen: isNotesOpen, onOpen: onNotesOpen, onClose: onNotesClose } = useDisclosure();
  
  // --- THIS IS THE FIX ---
  // 'currentNotes' holds the live version of the notes on the client.
  // 'editedNotes' is a temporary state for the text area.
  const [currentNotes, setCurrentNotes] = useState(notes);
  const [editedNotes, setEditedNotes] = useState(notes);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleSaveNotes = () => {
    // Optimization: check against the live state, not the initial prop.
    if (editedNotes === currentNotes) {
      return;
    }

    startTransition(async () => {
      const result = await updateAnalysisNotes({ analysisId, newNotes: editedNotes });
      if (result.success) {
        // --- THIS IS THE FIX ---
        // Update the live client-side state with the newly saved notes.
        setCurrentNotes(editedNotes); 
        toast({
          title: 'Notes saved successfully!',
          variant: 'subtle',
          colorScheme: 'purple',
          isClosable: true,
        });
      } else {
        toast({ title: 'Error updating notes', description: result.error, status: 'error', isClosable: true });
      }
    });
  };

  const handleOpenNotes = () => {
    // When opening, set the editor's text to the current live state.
    setEditedNotes(currentNotes);
    onNotesOpen();
  };
  
  const notesHaveChanged = editedNotes !== currentNotes;

  const cardBg = '#0e0f14';
  const cardHoverBg = '#16181d';
  const sectionBg = 'gray.800';
  const accent = 'purple.300';

  return (
    <Box
      bg={cardBg} rounded="2xl" borderWidth="1px" borderColor="whiteAlpha.100"
      shadow="lg" transition=".2s ease" _hover={{ bg: cardHoverBg, transform: 'translateY(-4px)' }}
      p={6} textDecor="none"
    >
      <Flex justify="space-between" align="start" mb={4}>
        <Heading size="md" color="gray.100" pr={4} noOfLines={2}>{title}</Heading>
        <Badge px={3} py={0.5} rounded="full" fontSize="xs" bg={diffMap[difficulty].bg} color={diffMap[difficulty].color}>
          {difficulty}
        </Badge>
      </Flex>

      <Flex gap={1} align="center" mb={3}>
        <Tooltip label="Show Pseudo Code" placement="top" hasArrow>
          <IconButton variant="ghost" size="sm" colorScheme="purple" icon={<Code size={25}/>} onClick={onPseudoCodeOpen} aria-label="Show Pseudo Code"/>
        </Tooltip>
        <Tooltip label="Edit Notes" placement="top" hasArrow>
          <IconButton variant="ghost" size="sm" colorScheme="purple" icon={<NotebookText size={25}/>} onClick={handleOpenNotes} aria-label="Edit Notes"/>
        </Tooltip>
        <Tooltip label="Open Problem Link" placement="top" hasArrow>
          <IconButton variant="ghost" size="sm" colorScheme="purple" icon={<ExternalLink size={23}/>} onClick={() => window.open(href, '_blank')} aria-label="Open Problem"/>
        </Tooltip>
      </Flex>

      <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={6}>
        <Flex direction="column" bg={sectionBg} rounded="md" p={4} align="center">
          <Icon as={Clock} w={6} h={6} color={accent} /><Text fontSize="xs" color="gray.400" mt={1}>TC</Text><Text fontFamily="mono" color={accent} fontSize="sm">{timeComplexity}</Text>
        </Flex>
        <Flex direction="column" bg={sectionBg} rounded="md" p={4} align="center">
          <Icon as={MemoryStick} w={6} h={6} color={accent} /><Text fontSize="xs" color="gray.400" mt={1}>SC</Text><Text fontFamily="mono" color={accent} fontSize="sm">{spaceComplexity}</Text>
        </Flex>
      </Grid>

      <Modal isOpen={isPseudoCodeOpen} onClose={onPseudoCodeClose} size="xl">
        <ModalOverlay /><ModalContent bg="gray.900" borderColor="whiteAlpha.200"><ModalHeader color="white">Pseudo Code</ModalHeader><ModalCloseButton /><ModalBody><CodeWindow lines={pseudoCode} /></ModalBody><ModalFooter><Button colorScheme="purple" onClick={onPseudoCodeClose}>Close</Button></ModalFooter></ModalContent>
      </Modal>

      <Modal isOpen={isNotesOpen} onClose={onNotesClose} isCentered>
        <ModalOverlay /><ModalContent bg="gray.900" borderColor="whiteAlpha.200">
          <ModalHeader color="white">Edit Notes</ModalHeader><ModalCloseButton />
          <ModalBody>
            <Textarea 
              value={editedNotes} 
              onChange={(e) => setEditedNotes(e.target.value)} 
              rows={10} 
              bg="gray.800" 
              _focus={{ borderColor: 'purple.400' }}
              placeholder="Enter any notes, thoughts, or reflections..."
              whiteSpace="pre"
              overflowX="auto"
              sx={{
                '&::-webkit-scrollbar': {
                  display: 'none', // For Chrome, Safari, and Opera
                },
                msOverflowStyle: 'none', // For Internet Explorer and Edge
                scrollbarWidth: 'none', // For Firefox
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="purple" 
              onClick={handleSaveNotes} 
              isLoading={isPending}
              isDisabled={!notesHaveChanged || isPending}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
