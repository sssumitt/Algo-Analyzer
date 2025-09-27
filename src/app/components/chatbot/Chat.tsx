"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  IconButton,
  List,
  ListItem,
  useBreakpointValue,
  InputGroup,
  InputLeftElement,
  Tooltip,
  Textarea,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  Spinner, // --- IMPORT SPINNER ---
} from "@chakra-ui/react";
import { FiSend, FiPlus, FiSearch, FiMessageSquare, FiMenu } from "react-icons/fi";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown"; // --- IMPORT MARKDOWN RENDERER ---
import remarkGfm from "remark-gfm"; // --- IMPORT GFM PLUGIN for tables, etc. ---

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

// --- Added some markdown examples to initial state ---
const initialStateArray: Chat[] = [
  {
    id: "c1",
    title: "DP problems review",
    messages: [
      { id: "m1", role: "user", text: "Why is my MCM dp state arr[l-1] * arr[i] * arr[r]?", createdAt: Date.now() - 1000 * 60 * 60 },
      { id: "m2", role: "bot", text: "Because the index boundaries of your array represent the dimensions of the matrices. For matrices `Ai...Aj`, the dimensions are `p(i-1) x p(i)` through `p(j-1) x p(j)`. The final multiplication cost is based on the dimensions of the resulting two sub-problem matrices.", createdAt: Date.now() - 1000 * 60 * 59 },
    ],
    updatedAt: Date.now() - 1000 * 60 * 59,
  },
  {
    id: "c2",
    title: "Linked list edge-cases",
    messages: [
      { id: "m3", role: "user", text: "How to remove zero-sum sublists?", createdAt: Date.now() - 1000 * 60 * 30 },
      { id: "m4", role: "bot", text: "A great approach is to use a prefix sum map. Here's a quick rundown:\n\n1.  Initialize a `prefix_sum` to 0 and a hash map `sums` with `{0: dummy_node}`.\n2.  Iterate through the list.\n3.  Add the current node's value to `prefix_sum`.\n4.  If `prefix_sum` is in `sums`, it means a zero-sum sublist exists. You'll set `sums[prefix_sum].next` to the current node's `next`.\n5.  Otherwise, add `prefix_sum` to the map.\n\nThis lets you solve it in O(n) time!", createdAt: Date.now() - 1000 * 60 * 29 },
    ],
    updatedAt: Date.now() - 1000 * 60 * 29,
  },
];

// --- Styles for rendered markdown ---
const markdownStyles = {
  "h1, h2, h3, h4, h5, h6": {
    my: 4,
    fontWeight: "bold",
  },
  p: {
    lineHeight: "tall",
  },
  a: {
    color: "purple.300",
    textDecoration: "underline",
  },
  ul: {
    my: 2,
    ml: 6,
    listStyleType: "disc",
  },
  ol: {
    my: 2,
    ml: 6,
    listStyleType: "decimal",
  },
  li: {
    mb: 1,
  },
  code: {
    bg: "#0f1114",
    color: "yellow.200",
    px: "0.4em",
    py: "0.2em",
    borderRadius: "md",
    fontFamily: "monospace",
    fontSize: "sm",
  },
  pre: {
    bg: "#0f1114",
    p: 4,
    borderRadius: "md",
    overflowX: "auto",
    my: 4,
  },
  "pre > code": {
    all: "unset", // Reset child code styles within a pre block
  },
  blockquote: {
    borderLeft: "4px solid",
    borderColor: "gray.600",
    pl: 4,
    color: "gray.400",
    fontStyle: "italic",
    my: 4,
  },
  table: {
    width: "full",
    borderCollapse: "collapse",
  },
  th: {
    border: "1px solid",
    borderColor: "gray.600",
    p: 2,
    textAlign: "left",
    bg: "#1f1f25"
  },
  td: {
    border: "1px solid",
    borderColor: "gray.600",
    p: 2,
  },
};


// Main Component
export default function ChatPage() {
  const [chats, setChats] = useState<{ byId: Record<string, Chat>; allIds: string[] }>(() => {
    const byId = initialStateArray.reduce((acc, chat) => {
      acc[chat.id] = chat;
      return acc;
    }, {} as Record<string, Chat>);
    const allIds = initialStateArray.map(chat => chat.id).sort((a, b) => (byId[b].updatedAt ?? 0) - (byId[a].updatedAt ?? 0));
    return { byId, allIds };
  });

  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats.allIds[0] ?? null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false); // --- NEW LOADING STATE ---
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedChat = useMemo(() => (selectedChatId ? chats.byId[selectedChatId] : null), [chats.byId, selectedChatId]);

  const filteredChats = useMemo(() => {
    const allChatsInOrder = chats.allIds.map(id => chats.byId[id]);
    if (!search.trim()) {
      return allChatsInOrder; 
    }
    
    const q = search.toLowerCase();
    return allChatsInOrder.filter((c) => 
      c.title.toLowerCase().includes(q) || 
      c.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [chats.allIds, chats.byId, search]);
  
  // Effect to scroll to the bottom of the messages list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages, isLoading]);

  function createNewChat() {
    const id = `c-${Date.now()}`;
    const title = `New Chat`;
    const newChat: Chat = { id, title, messages: [], updatedAt: Date.now() };
    
    setChats((prev) => ({
      byId: { ...prev.byId, [id]: newChat },
      allIds: [id, ...prev.allIds],
    }));

    setSelectedChatId(id);
    onClose();
  }

  function handleSelectChat(id: string) {
    setSelectedChatId(id);
    onClose();
  }

  // --- UPDATED SEND MESSAGE FUNCTION ---
  async function sendMessageToSelectedChat(text: string) {
    if (!selectedChatId || !text.trim() || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: text.trim(), createdAt: Date.now() };
    
    // Optimistic UI update
    setChats(prev => {
      const currentChat = prev.byId[selectedChatId];
      const isNewChat = currentChat.messages.length === 0;
      const newTitle = isNewChat ? text.substring(0, 40) + (text.length > 40 ? "..." : "") : currentChat.title;
      
      const updatedChat: Chat = { 
        ...currentChat, 
        title: newTitle, 
        messages: [...currentChat.messages, userMsg], 
        updatedAt: Date.now() 
      };
      
      const newAllIds = [selectedChatId, ...prev.allIds.filter(id => id !== selectedChatId)];

      return {
        byId: { ...prev.byId, [selectedChatId]: updatedChat },
        allIds: newAllIds,
      };
    });

    setInput("");
    setIsLoading(true); // --- START LOADING ---

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'The API call failed.');
      }

      const data = await response.json();
      const botMsg: Message = { id: `b-${Date.now()}`, role: "bot", text: data.reply, createdAt: Date.now() };

      setChats(prev => {
        const currentChat = prev.byId[selectedChatId!];
        // Replace user message with itself to trigger re-render, then add bot message
        const messages = currentChat.messages.slice(0, -1).concat(userMsg, botMsg);
        const updatedChat: Chat = { 
            ...currentChat, 
            messages: messages,
            updatedAt: Date.now() 
        };
        return {
          byId: { ...prev.byId, [selectedChatId!]: updatedChat },
          allIds: prev.allIds,
        };
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Failed to send message:", errorMessage);
      const errorMsg: Message = { id: `e-${Date.now()}`, role: "bot", text: `Sorry, an error occurred: ${errorMessage}`, createdAt: Date.now() };
      
      setChats(prev => {
        const currentChat = prev.byId[selectedChatId!];
        const updatedChat: Chat = { 
            ...currentChat, 
            messages: [...currentChat.messages, errorMsg], 
        };
        return {
          byId: { ...prev.byId, [selectedChatId!]: updatedChat },
          allIds: prev.allIds,
        };
      });
    } finally {
        setIsLoading(false); // --- STOP LOADING ---
    }
  }

  // Reusable sidebar content component (NO CHANGES)
  const sidebarContent = (
    <VStack h="full" align="stretch" spacing={4}>
      <HStack justify="space-between">
        <Heading size="md" color="purple.200">Chats</Heading>
        <Tooltip label="New Chat"><IconButton aria-label="new chat" icon={<FiPlus />} onClick={createNewChat} size="sm" variant="ghost" /></Tooltip>
      </HStack>
      <InputGroup>
        <InputLeftElement pointerEvents="none"><FiSearch color="gray.500" /></InputLeftElement>
        <Input placeholder="Search chats" value={search} onChange={(e) => setSearch(e.target.value)} bg="#0f1114" borderColor="#26262a" />
      </InputGroup>
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

  return (
    <Flex h="calc(100vh - 70px)" bg="#0b0b0f" color="white" overflow="hidden">
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
              <>
                {selectedChat.messages.map((m) => (
                  <Flex key={m.id} alignSelf={m.role === "user" ? "flex-end" : "flex-start"} w="fit-content" maxW={{ base: "90%", md: "70%" }}>
                    <Box bg={m.role === "user" ? "purple.600" : "#0f1113"} color="white" px={4} py={3} rounded="lg">
                      {m.role === 'bot' ? (
                          <Box sx={markdownStyles}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                          </Box>
                      ) : (
                        <Text whiteSpace="pre-wrap" wordBreak="break-word">{m.text}</Text>
                      )}
                      <Text fontSize="xs" color="gray.400" textAlign="right" suppressHydrationWarning={true} mt={2}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </Text>
                    </Box>
                  </Flex>
                ))}
                {/* --- RENDER LOADING INDICATOR --- */}
                {isLoading && (
                   <Flex alignSelf="flex-start" w="fit-content" maxW={{ base: "90%", md: "70%" }}>
                     <HStack spacing={3} bg="#0f1113" color="white" px={4} py={3} rounded="lg">
                        <Spinner size="sm" color="purple.300" />
                        <Text fontSize="md" fontStyle="italic">Thinking...</Text>
                     </HStack>
                   </Flex>
                )}
                <div ref={messagesEndRef} />
              </>
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
            <Textarea 
              as={TextareaAutosize} 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessageToSelectedChat(input);
                }
              }}
              placeholder={selectedChat ? `Message ${selectedChat.title}` : "Select a chat to start"} 
              bg="#0f1114" 
              borderColor="#26262a" 
              _placeholder={{ color: "gray.500" }} 
              isDisabled={!selectedChat || isLoading} 
              minRows={1} 
              maxRows={6} 
              resize="none" 
            />
            <IconButton aria-label="send" icon={<FiSend />} onClick={() => sendMessageToSelectedChat(input)} colorScheme="purple" size="lg" isDisabled={!selectedChat || !input.trim()} isLoading={isLoading} />
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
}
