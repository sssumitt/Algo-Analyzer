'use client';

import { Session } from 'next-auth';
import NextLink from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  VStack,
  Button, // Import Button
} from '@chakra-ui/react';
import { Logo } from './Logo';
import { FiLogOut } from 'react-icons/fi';
import { HamburgerIcon } from '@chakra-ui/icons';

// A custom NavLink component to handle active styling
const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Text
      as={NextLink}
      href={href}
      px={2}
      py={1}
      color={isActive ? 'purple.300' : 'gray.300'}
      fontWeight={isActive ? 'bold' : 'normal'}
      transition="color 0.2s ease-in-out"
      _hover={{
        color: 'purple.300',
      }}
      onClick={onClick}
    >
      {children}
    </Text>
  );
};

interface NavbarAuthProps {
  user: Session['user'];
}

export function NavbarAuth({ user }: NavbarAuthProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!user) {
    return null;
  }

  return (
    <Box
      as="nav"
      w="100vw"
      position="sticky"
      top={0}
      zIndex={10}
      bg="rgba(14, 15, 20, 0.6)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.300"
      px={{ base: 4, md: 10 }}
    >
      <Flex h="80px" align="center" justify="space-between" mx="auto">
        {/* Logo & title */}
        <HStack spacing={3} align="center">
          <Logo />
          <Heading as={NextLink} href="/dashboard" size="lg" fontWeight="bold" bgGradient="linear(to-r, purple.300, pink.400)" bgClip="text">
            Algo Analyzer
          </Heading>
        </HStack>

        {/* Desktop Navigation & User Menu */}
        <HStack spacing={6} align="center">
          {/* Desktop Links */}
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            {/* <NavLink href="/chatbot" onClick={onClose}>Chat</NavLink> will be done in next commit*/}
            <NavLink href="/repository">Repository</NavLink>
            <NavLink href="/analysis">Analysis</NavLink>
          </HStack>

          {/* User Menu (Clickable Avatar) */}
          <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
              minW={0}
            >
              <Avatar
                size={'sm'}
                src={user.image ?? undefined}
                name={user.name ?? user.username}
                bg="purple.500"
                color="white"
              />
            </MenuButton>
            <MenuList bg="gray.800" borderColor="whiteAlpha.200">
              <MenuItem bg="gray.800" _hover={{ bg: 'gray.800' }} isDisabled>
                <Text fontWeight="bold" color="whiteAlpha.900">{user.name ?? user.username}</Text>
              </MenuItem>
              <MenuDivider borderColor="whiteAlpha.200" />
              <MenuItem
                bg="gray.800"
                icon={<FiLogOut />}
                onClick={() => signOut({ callbackUrl: '/' })}
                _hover={{ bg: 'purple.500', color: 'white' }}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Mobile Hamburger Menu Icon */}
          <IconButton
            aria-label="Open menu"
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            icon={<HamburgerIcon />}
            variant="ghost"
          />
        </HStack>
      </Flex>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.800">
          <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.300">Menu</DrawerHeader>
          <DrawerBody>
            <VStack as="nav" spacing={4} align="stretch">
              <NavLink href="/dashboard" onClick={onClose}>Dashboard</NavLink>
              <NavLink href="/repository" onClick={onClose}>Repository</NavLink>
              <NavLink href="/analysis" onClick={onClose}>Analysis</NavLink>
              <NavLink href="/chatbot" onClick={onClose}>Chat</NavLink>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
