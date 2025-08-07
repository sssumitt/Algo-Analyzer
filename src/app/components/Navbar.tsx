'use client'

import {
  Box,
  Flex,
  Heading,
  Text,
  Container,
  HStack,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  VStack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { Logo } from './Logo'
import { HamburgerIcon } from '@chakra-ui/icons'

export function Navbar() {
  // Hook for managing the mobile navigation drawer state
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box
      as="nav"
      position="absolute"
      top="0"
      left="0"
      right="0"
      zIndex={50}
      bg="blackAlpha.100"
      backdropFilter="blur(10px)"
    >
      <Container maxW="1200px" px={{ base: 6, md: 10 }} py={5}>
        <Flex justify="space-between" align="center">
          {/* Logo and Title */}
          <HStack as={NextLink} href="/" spacing={2}>
            <Logo />
            <Heading
              size="lg"
              fontWeight="bold"
              bgGradient="linear(to-r, purple.300, pink.400)"
              bgClip="text"
              letterSpacing="tight"
            >
              Algo Analyzer
            </Heading>
          </HStack>

          {/* Desktop Navigation & CTAs */}
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <Text as={NextLink} href="/repository" color="gray.300" _hover={{ color: 'purple.300' }} fontSize="lg">
              Repository
            </Text>
            <Text as={NextLink} href="/analysis" color="gray.300" _hover={{ color: 'purple.300' }} fontSize="lg">
              Analysis
            </Text>
           
            <Button
              as={NextLink}
              href="/signup"
              colorScheme="purple"
              bgGradient="linear(to-r, purple.400, pink.400)"
              _hover={{
                bgGradient: 'linear(to-r, purple.500, pink.500)',
              }}
            >
              Sign Up
            </Button>
          </HStack>

          {/* Mobile Hamburger Menu Icon */}
          <IconButton
            aria-label="Open menu"
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            icon={<HamburgerIcon />}
            variant="ghost"
          />
        </Flex>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.800">
          <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.300">
            Menu
          </DrawerHeader>
          <DrawerBody>
            <VStack as="nav" spacing={6} align="stretch" mt={4}>
              <Text as={NextLink} href="/repository" onClick={onClose} fontSize="lg">
                Repository
              </Text>
              <Text as={NextLink} href="/analysis" onClick={onClose} fontSize="lg">
                Analysis
              </Text>
              <Button as={NextLink} href="/signup" colorScheme="purple" onClick={onClose}>
                Sign Up
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}