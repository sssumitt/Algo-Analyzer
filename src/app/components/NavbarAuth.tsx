'use client'

import NextLink from 'next/link'
import { signOut } from 'next-auth/react'
import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Avatar,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { Logo } from './Logo'
import { FiLogOut } from 'react-icons/fi'

interface NavbarAuthProps { userName: string }

export function NavbarAuth({ userName }: NavbarAuthProps)  {
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200')

  return (
    <Box
      as="nav"
      w="100vw"
      minH="80px" // <<-- Set min height to match previous container with py={5}
      position="relative"
      borderBottom="1px solid"
      borderColor={borderColor}
      px={{ base: 4, md: 10 }}
      bg="transparent"
      display="flex"
      alignItems="center"
    >
      <Flex
        w="100%"
        align="center"
        justify="space-between"
        mx="auto"
        minH="80px" // <<-- Also set on Flex for consistent vertical alignment
      >
        {/* Logo & title to the extreme left */}
        <HStack spacing={2} align="center">
          <Logo />
          <Heading
            as={NextLink}
            href="/dashboard"
            size="lg"
            fontWeight="bold"
            bgGradient="linear(to-r, purple.300, pink.400)"
            bgClip="text"
            letterSpacing="tight"
            lineHeight="1"
            mb={0}
          >
            Algo Analyzer
          </Heading>
        </HStack>

        {/* User avatar, nav links, and logout to the extreme right */}
        <HStack
          spacing={6}
          fontSize="sm"
          color="gray.300"
        >
          <Text
            as={NextLink}
            href="/repository"
            _hover={{ color: 'purple.300' }}
            fontSize={{ lg: 'lg' }}
            display={{ base: 'none', md: 'block' }}
          >
            Repository
          </Text>
          <Text
            as={NextLink}
            href="/analysis"
            _hover={{ color: 'purple.300' }}
            fontSize={{ lg: 'lg' }}
            display={{ base: 'none', md: 'block' }}
          >
            Analysis
          </Text>
          <Avatar
            name={userName}
            size="sm"
            bg="purple.600"
            color="white"
            showBorder
          />
          <IconButton
            aria-label="Logout"
            icon={<FiLogOut />}
            variant="ghost"
            color="gray.300"
            _hover={{ color: 'purple.300', bg: 'transparent' }}
            onClick={() => signOut({ callbackUrl: '/' })}
          />
        </HStack>
      </Flex>
    </Box>
  )
}
