"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Box, Flex, Heading, Text, VStack, HStack, Input, IconButton, List, ListItem,
  useBreakpointValue, InputGroup, InputLeftElement, Tooltip, Textarea,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent, Spinner,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button,
} from "@chakra-ui/react";
import { FiSend, FiPlus, FiSearch, FiMessageSquare, FiMenu, FiTrash2, FiCode } from "react-icons/fi";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Types ---
export type Message = { id: string; role: "user" | "bot"; text: string; createdAt?: number };
export type ChatSummary = { id: string; title: string; updatedAt?: number };
export type Chat = ChatSummary & { messages?: Message[] };

// --- Enhanced Markdown Styles ---
const markdownStyles = {
  p: { marginBottom: '1rem', lineHeight: '1.6' },
  a: {
    color: 'purple.300',
    textDecoration: 'underline',
    _hover: { color: 'purple.200' }
  },
  ul: { paddingLeft: '20px', marginBottom: '1rem' },
  ol: { paddingLeft: '20px', marginBottom: '1rem' },
  // ✅ MODIFICATION: Reduced bottom margin for tighter list items
  li: { marginBottom: '0.25rem' },
  // ✅ NEW RULE: Targets paragraphs inside list items to remove extra spacing
  'li > p': {
    marginBottom: '0.25rem',
  },
  h1: { fontSize: '2xl', fontWeight: 'bold', mb: 4, pb: 2, borderBottom: '1px solid', borderColor: 'gray.700' },
  h2: { fontSize: 'xl', fontWeight: 'bold', mb: 3, pb: 1, borderBottom: '1px solid', borderColor: 'gray.700' },
  h3: { fontSize: 'lg', fontWeight: 'bold', mb: 3 },
  blockquote: {
    borderLeft: '4px solid',
    borderColor: 'gray.600',
    pl: 4,
    my: 4,
    color: 'gray.400',
    fontStyle: 'italic',
  },
  hr: { my: 6, borderColor: 'gray.700' },
  table: { width: '100%', my: 4, borderCollapse: 'collapse' },
  th: { border: '1px solid', borderColor: 'gray.600', p: 2, fontWeight: 'bold', textAlign: 'left', bg: 'gray.700' },
  td: { border: '1px solid', borderColor: 'gray.600', p: 2 },
  'tr:nth-of-type(odd) td': {
    bg: 'rgba(255, 255, 255, 0.02)'
  },
  code: {
    bg: "rgba(0,0,0,0.3)",
    px: "0.5em",
    py: "0.2em",
    rounded: "md",
    fontFamily: "monospace",
    fontSize: "sm",
  },
  pre: {
    bg: "#0f1114",
    p: 4,
    rounded: "md",
    overflowX: "auto",
    my: 4,
    border: '1px solid',
    borderColor: 'gray.700'
  }
};
// =================================================================
// === API SERVICE ===============================================
// =================================================================

async function sendMessage(message: string, chatId?: string): Promise<{ reply: string, chatId: string, title?: string }> {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim(), chatId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The API call failed.');
    return data;
  } catch (error) { console.error("Error in sendMessage service:", error); throw error; }
}

async function getChats(): Promise<ChatSummary[]> {
  try {
    const response = await fetch('/api/chats');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch chats.');
    return data;
  } catch (error) { console.error("Error in getChats service:", error); throw error; }
}

async function getChatMessages(chatId: string): Promise<{ messages: Message[] }> {
  try {
    const response = await fetch(`/api/chats/${chatId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch messages.');
    return data;
  } catch (error) { console.error("Error in getChatMessages service:", error); throw error; }
}

async function deleteChat(chatId: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete chat.');
    return data;
  } catch (error) { console.error("Error in deleteChat service:", error); throw error; }
}

// =================================================================
// === CHILD COMPONENTS ==========================================
// =================================================================

const MessageItem = React.memo(({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  return (
    <Flex justify={isUser ? "flex-end" : "flex-start"} w="full">
      <Box
        bg={isUser ? "purple.600" : "transparent"}
        borderWidth="1px"
        borderColor={isUser ? "purple.600" : "#2d2d38"}
        color="white"
        px={4}
        py={2}
        rounded="lg"
        maxW={{ base: "90%", md: "70%" }}
      >
        <Box sx={markdownStyles}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </Box>
      </Box>
    </Flex>
  );
});
MessageItem.displayName = 'MessageItem';

const ChatMessageArea = ({ chat, isLoading }: { chat: Chat | null, isLoading: boolean }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);


  if (!chat && !isLoading) {
    return (
      <VStack justify="center" h="full" spacing={6} textAlign="center" p={8}>
        {/* A styled, thematic icon */}
        <Box
          display="inline-block"
          p={5}
          bg="rgba(128, 90, 213, 0.1)" // Faint purple background
          borderRadius="full"
        >
          <FiCode size="52px" color="#9F7AEA" /> {/* Themed icon with theme color */}
        </Box>

        {/* A bolder heading */}
        <Heading size="xl" color="gray.200">
          Algo Chat
        </Heading>

        {/* Simple, instructive subtext */}
        <Text color="gray.400" maxW="md">
          Start a new conversation to analyze and optimize your code.
        </Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch" h="full">
      {chat?.messages?.map((msg) => <MessageItem key={msg.id} message={msg} />)}
      {isLoading && (
        <HStack spacing={3} alignSelf="flex-start">
          <Spinner size="sm" color="purple.300" />
          <Text fontSize="sm" color="gray.400">Thinking...</Text>
        </HStack>
      )}
      <div ref={messagesEndRef} />
    </VStack>
  );
};

const MessageInput = React.memo(({ onSendMessage, isLoading, selectedChat }: { onSendMessage: (message: string) => void; isLoading: boolean; selectedChat: Chat | null; }) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!selectedChat) {
      inputRef.current?.focus();
    }
  }, [selectedChat]);

  return (
    <InputGroup size="lg">
      <Textarea
        as={TextareaAutosize}
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your message here..."
        minRows={1}
        maxRows={6}
        pr="4.5rem"
        bg="#0f1114"
        borderColor="#26262a"
        _hover={{ borderColor: "purple.400" }}
        _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)" }}
        isDisabled={isLoading}
      />
      <IconButton
        aria-label="Send message"
        icon={<FiSend />}
        onClick={handleSend}
        isLoading={isLoading}
        isDisabled={!input.trim()} 
        position="absolute"
        right="0.5rem"
        bottom="8px"
        size="md"
        colorScheme="purple"
        variant="ghost"
      />
    </InputGroup>
  );
});
MessageInput.displayName = 'MessageInput';

const ChatSidebar = React.memo(({ chats, selectedChatId, onSelectChat, onCreateNewChat, onDeleteChat }: {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (id: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const filteredChats = useMemo(() => {
    if (!search.trim()) return chats;
    const q = search.toLowerCase();
    return chats.filter(c => c.title.toLowerCase().includes(q));
  }, [chats, search]);

  return (
    <VStack h="full" align="stretch" spacing={4}>
      <HStack justify="space-between"><Heading size="md" color="purple.200">Chats</Heading><Tooltip label="New Chat"><IconButton aria-label="new chat" icon={<FiPlus />} onClick={onCreateNewChat} size="sm" variant="ghost" /></Tooltip></HStack>
      <InputGroup><InputLeftElement pointerEvents="none"><FiSearch color="gray.500" /></InputLeftElement><Input placeholder="Search chats" value={search} onChange={(e) => setSearch(e.target.value)} bg="#0f1114" borderColor="#26262a" /></InputGroup>
      <List spacing={2} flex={1} overflowY="auto" pr={2}>
        {filteredChats.map((c) => (
          <ListItem
            key={c.id}
            onClick={() => onSelectChat(c.id)}
            cursor="pointer"
            bg={c.id === selectedChatId ? "rgba(128,90,213,0.12)" : "transparent"}
            p={3}
            rounded="md"
            _hover={{ bg: c.id !== selectedChatId ? "rgba(128,90,213,0.08)" : "rgba(128,90,213,0.12)" }}
            position="relative"
            sx={{ "&:hover .delete-button": { opacity: 1 } }}
          >
            <HStack align="start" justify="space-between">
              <HStack align="start" flex={1} overflow="hidden">
                <Box mt={1} color={c.id === selectedChatId ? "purple.300" : "gray.500"}><FiMessageSquare /></Box>
                <VStack align="start" spacing={0} flex={1} overflow="hidden">
                  <Text fontWeight="semibold" isTruncated w="full">{c.title}</Text>
                </VStack>
              </HStack>
              <Tooltip label="Delete Chat" placement="top">
                <IconButton
                  aria-label="Delete chat"
                  icon={<FiTrash2 />}
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  className="delete-button"
                  opacity={0}
                  transition="opacity 0.2s"
                  _hover={{ bg: "red.500", color: "white" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(c.id);
                  }}
                />
              </Tooltip>
            </HStack>
          </ListItem>
        ))}
      </List>
    </VStack>
  );
});
ChatSidebar.displayName = 'ChatSidebar';

// =================================================================
// === MAIN COMPONENT ============================================
// =================================================================
export default function ChatPage() {
  const [chats, setChats] = useState<{ byId: Record<string, Chat>; allIds: string[] }>({ byId: {}, allIds: [] });
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function fetchInitialChats() {
      setIsSidebarLoading(true);
      try {
        const chatList = await getChats();
        const byId = chatList.reduce((acc, chat) => { acc[chat.id] = chat; return acc; }, {} as Record<string, Chat>);
        const allIds = chatList.map(chat => chat.id);
        setChats({ byId, allIds });
      } catch (error) { console.error("Could not load chat history:", error); }
      finally { setIsSidebarLoading(false); }
    }
    fetchInitialChats();
  }, []);

  const orderedChats = useMemo(() => chats.allIds.map(id => chats.byId[id]), [chats.allIds, chats.byId]);
  const selectedChat = useMemo(() => (selectedChatId ? chats.byId[selectedChatId] : null), [chats.byId, selectedChatId]);

  const handleCreateNewChat = useCallback(() => { setSelectedChatId(null); onClose(); }, [onClose]);

  const handleSelectChat = useCallback(async (id: string) => {
    if (id === selectedChatId) return;
    setSelectedChatId(id);
    if (isMobile) onClose();

    if (!chats.byId[id]?.messages) {
      setIsLoading(true);
      try {
        const { messages } = await getChatMessages(id);
        setChats(prev => ({
          ...prev,
          byId: { ...prev.byId, [id]: { ...prev.byId[id], messages } }
        }));
      } catch (error) {
        console.error("Failed to load chat messages:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [chats.byId, onClose, selectedChatId, isMobile]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;
    setIsLoading(true);

    const currentChatId = selectedChatId;
    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", text: messageText };

    if (currentChatId) {
      setChats(prev => {
        const currentMessages = prev.byId[currentChatId]?.messages || [];
        return {
          ...prev,
          byId: {
            ...prev.byId,
            [currentChatId]: {
              ...prev.byId[currentChatId],
              messages: [...currentMessages, userMessage],
            },
          },
        };
      });
    }

    try {
      const { reply, chatId: newChatId, title } = await sendMessage(messageText, currentChatId ?? undefined);
      const botMessage: Message = { id: `bot-${Date.now()}`, role: 'bot', text: reply };

      setChats(prev => {
        const newById = { ...prev.byId };
        const chatToUpdate = newById[newChatId] || { id: newChatId, title: "" };

        const baseMessages = currentChatId === newChatId
          ? (chatToUpdate.messages || [])
          : [userMessage];

        newById[newChatId] = {
          ...chatToUpdate,
          title: title || chatToUpdate.title || "New Chat",
          messages: [...baseMessages, botMessage],
        };

        const newAllIds = [newChatId, ...prev.allIds.filter(id => id !== newChatId)];

        return { byId: newById, allIds: newAllIds };
      });

      if (selectedChatId !== newChatId) {
        setSelectedChatId(newChatId);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChatId]);

  const handleOpenDeleteDialog = useCallback((id: string) => {
    setChatToDelete(id);
    onAlertOpen();
  }, [onAlertOpen]);

  const handleConfirmDelete = useCallback(async () => {
    if (!chatToDelete) return;

    const chatToDeleteId = chatToDelete;
    onAlertClose();
    setChatToDelete(null);

    try {
      await deleteChat(chatToDeleteId);
      setChats(prev => {
        const newById = { ...prev.byId };
        delete newById[chatToDeleteId];
        const newAllIds = prev.allIds.filter(id => id !== chatToDeleteId);
        return { byId: newById, allIds: newAllIds };
      });
      if (selectedChatId === chatToDeleteId) {
        setSelectedChatId(null);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  }, [chatToDelete, selectedChatId, onAlertClose]);

  const sidebarComponent = (
    isSidebarLoading ?
      <VStack justify="center" h="full"><Spinner color="purple.300" /></VStack> :
      <ChatSidebar
        chats={orderedChats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onCreateNewChat={handleCreateNewChat}
        onDeleteChat={handleOpenDeleteDialog}
      />
  );

  return (
    <>
      <Flex h="calc(100vh - 70px)" bg="#0b0b0f" color="white" overflow="hidden">
        {isMobile ? (
          <Drawer placement="left" onClose={onClose} isOpen={isOpen}><DrawerOverlay /><DrawerContent bg="#111114" color="white" p={4}>{sidebarComponent}</DrawerContent></Drawer>
        ) : (
          <Box w="320px" bg="#111114" p={4} borderRight="1px solid" borderColor="#1f1f25" flexShrink={0}>{sidebarComponent}</Box>
        )}
        <Flex direction="column" flex={1} bg="#111114" minW={0}>
          <Flex align="center" p={4} borderBottom="1px solid" borderColor="#1f1f25" h="70px">
            {isMobile && <IconButton aria-label="Show chats" icon={<FiMenu />} onClick={onOpen} variant="ghost" mr={2} />}
            <Heading size="md" color="purple.200">{selectedChat ? selectedChat.title : "New Chat"}</Heading>
          </Flex>
          <Box flex={1} overflowY="auto" p={6}><ChatMessageArea chat={selectedChat} isLoading={isLoading} /></Box>
          <Box p={6} bg="#111114"><MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} selectedChat={selectedChat} /></Box>
        </Flex>
      </Flex>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="#1f1f25" color="white" borderColor="#26262a">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Chat
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This will permanently delete this chat and all its messages.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose} variant="ghost">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}