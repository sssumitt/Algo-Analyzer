"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  IconButton,
  Button,
  List,
  ListItem,
  useBreakpointValue,
  InputGroup,
  InputLeftElement,
  Tooltip,
  Textarea,
  // --- DRAWER IMPORTS ---
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/react";

import { FiSend, FiPlus, FiSearch, FiMessageSquare, FiCode, FiMenu } from "react-icons/fi";
import TextareaAutosize from "react-textarea-autosize";
import KnowledgeGraph from "./KG";


type Message = {
  id: string;
  role: "user" | "bot" | "system";
  text: string;
  createdAt?: number;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt?: number;
};

// Main Component
export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "c1",
      title: "DP problems review",
      messages: [
        { id: "m1", role: "user", text: "Why is my MCM dp state arr[l-1] * arr[i] * arr[r]?", createdAt: Date.now() - 1000 * 60 * 60 },
        { id: "m2", role: "bot", text: "Because the index boundaries of your array represent the dimensions of the matrices. For matrices Ai...Aj, the dimensions are p(i-1) x p(i) through p(j-1) x p(j). The final multiplication cost is based on the dimensions of the resulting two sub-problem matrices.", createdAt: Date.now() - 1000 * 60 * 59 },
      ],
      updatedAt: Date.now() - 1000 * 60 * 59,
    },
    {
      id: "c2",
      title: "Linked list edge-cases",
      messages: [
        { id: "m3", role: "user", text: "How to remove zero-sum sublists?", createdAt: Date.now() - 1000 * 60 * 30 },
        { id: "m4", role: "bot", text: "A great approach is to use a prefix sum map. Iterate through the list, calculate the prefix sum at each node, and store it in a hash map. If you encounter a prefix sum that's already in the map, it means the sublist between the two occurrences sums to zero, and you can bypass it.", createdAt: Date.now() - 1000 * 60 * 29 },
      ],
      updatedAt: Date.now() - 1000 * 60 * 29,
    },
  ]);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats[0]?.id ?? null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Derived State
  const selectedChat = useMemo(() => chats.find((c) => c.id === selectedChatId) ?? null, [chats, selectedChatId]);
  const filteredChats = useMemo(() => {
    if (!search.trim()) return [...chats].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    const q = search.toLowerCase();
    return chats
      .filter((c) => c.title.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q)))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [chats, search]);

  // Functions
  function createNewChat() {
    const id = `c-${Date.now()}`;
    const title = `New Chat`;
    const newChat: Chat = { id, title, messages: [], updatedAt: Date.now() };
    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(id);
    onClose();
  }

  function handleSelectChat(id: string) {
    setSelectedChatId(id);
    onClose();
  }

  function sendMessageToSelectedChat(text: string) {
    if (!selectedChat || !text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: text.trim(), createdAt: Date.now() };
    const isNewChat = selectedChat.messages.length === 0;
    const newTitle = isNewChat ? text.substring(0, 40) + (text.length > 40 ? "..." : "") : selectedChat.title;
    const updatedChatWithUserMsg: Chat = { ...selectedChat, title: newTitle, messages: [...selectedChat.messages, userMsg], updatedAt: Date.now() };
    setChats((prev) => prev.map((c) => (c.id === selectedChat.id ? updatedChatWithUserMsg : c)));
    setInput("");
    setTimeout(() => {
      const botMsg: Message = { id: `b-${Date.now()}`, role: "bot", text: `Simulated reply for: "${text.trim()}"`, createdAt: Date.now() };
      setChats((currentChats) => currentChats.map((c) => c.id === selectedChat.id ? { ...c, messages: [...c.messages, botMsg], updatedAt: Date.now() } : c));
    }, 700);
  }

  // Reusable sidebar content component
  const sidebarContent = (
    // ✅ FIX: Changed to a VStack to allow the List to grow and fill available space.
    <VStack h="full" align="stretch" spacing={4}>
      <HStack justify="space-between">
        <Heading size="md" color="purple.200">Chats</Heading>
        <Tooltip label="New Chat"><IconButton aria-label="new chat" icon={<FiPlus />} onClick={createNewChat} size="sm" variant="ghost" /></Tooltip>
      </HStack>
      <InputGroup>
        <InputLeftElement pointerEvents="none"><FiSearch color="gray.500" /></InputLeftElement>
        <Input placeholder="Search chats" value={search} onChange={(e) => setSearch(e.target.value)} bg="#0f1114" borderColor="#26262a" />
      </InputGroup>
      {/* ✅ FIX: List now grows to fill space and scrolls internally */}
      <List spacing={2} flex={1} overflowY="auto" pr={2}>
        {filteredChats.map((c) => (
          <ListItem key={c.id} onClick={() => handleSelectChat(c.id)} cursor="pointer" bg={c.id === selectedChatId ? "rgba(128,90,213,0.12)" : "transparent"} p={3} rounded="md" _hover={{ bg: "rgba(128,90,213,0.08)" }} transition="background 0.2s ease-in-out">
            <HStack align="start">
              <Box mt={1} color={c.id === selectedChatId ? "purple.300" : "gray.500"}><FiMessageSquare /></Box>
              <VStack align="start" spacing={0} flex={1} overflow="hidden">
                <Text fontWeight="semibold" isTruncated w="full">{c.title}</Text>
                <Text fontSize="sm" color="gray.400" isTruncated w="full">{c.messages.length > 0 ? c.messages[c.messages.length-1].text : "No messages yet"}</Text>
              </VStack>
            </HStack>
          </ListItem>
        ))}
      </List>
    </VStack>
  );

  // --- RENDER ---
  return (
    // ✅ FIX: Changed height to account for your external 70px navbar.
    // Adjust the "70px" value to match your navbar's actual height.
    <Flex h="calc(100vh - 70px)" bg="#0b0b0f" color="white" overflow="hidden">
      
      {/* --- RESPONSIVE SIDEBAR LOGIC --- */}
      {isMobile ? (
        <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent bg="#111114" color="white" p={4}>
            {sidebarContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Box w="320px" bg="#111114" p={4} borderRight="1px solid" borderColor="#1f1f25" flexShrink={0}>
          {sidebarContent}
        </Box>
      )}

      {/* Center Column — Main Chat Area (No changes needed here) */}
      <Flex direction="column" flex={1} bg="#111114" minW={0}>
        <Flex align="center" p={4} borderBottom="1px solid" borderColor="#1f1f25" h="70px">
          {isMobile && (
            <Tooltip label="Show Chats" placement="bottom">
              <IconButton aria-label="Show chats" icon={<FiMenu />} onClick={onOpen} variant="ghost" mr={2} />
            </Tooltip>
          )}
          <Heading size="md" color="purple.200">{selectedChat ? selectedChat.title : "Select a Chat"}</Heading>
        </Flex>
        <Box flex={1} overflowY="auto" p={6}>
          <VStack align="stretch" spacing={4}>
            {selectedChat ? (
              selectedChat.messages.map((m) => (
                <Flex key={m.id} alignSelf={m.role === "user" ? "flex-end" : "flex-start"} w="fit-content" maxW={{ base: "90%", md: "70%" }}>
                  <VStack align="start" spacing={1} bg={m.role === "user" ? "purple.600" : "#0f1113"} color="white" px={4} py={3} rounded="lg">
                    <Text whiteSpace="pre-wrap" wordBreak="break-word">{m.text}</Text>
                    <Text fontSize="xs" color="gray.400" alignSelf="flex-end" suppressHydrationWarning={true} >
                      {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </Text>
                  </VStack>
                </Flex>
              ))
            ) : (
              <VStack justify="center" h="full" spacing={4} color="gray.500">
                <FiMessageSquare size="48px" />
                <Heading size="md">No Chat Selected</Heading>
                <Text>Choose a conversation from the sidebar or start a new one.</Text>
              </VStack>
            )}
          </VStack>
        </Box>
        <Box p={6} bg="#111114">
          <HStack spacing={3} align="flex-end">
            <Textarea as={TextareaAutosize} value={input} onChange={(e) => setInput(e.target.value)} placeholder={selectedChat ? `Message ${selectedChat.title}` : "Select a chat to start"} bg="#0f1114" borderColor="#26262a" _placeholder={{ color: "gray.500" }} isDisabled={!selectedChat} minRows={1} maxRows={6} resize="none" />
            <IconButton aria-label="send" icon={<FiSend />} onClick={() => sendMessageToSelectedChat(input)} colorScheme="purple" size="lg" isDisabled={!selectedChat || !input.trim()} />
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
}
