'use client';

import {
  Box,
  Button,
  Grid,
  GridItem,
  VStack,
  Text,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { Hero3D } from '@/app/components/SignUp3d';
import { Logo } from '../components/Logo';
import { WelcomeOverlay } from '@/app/components/Welcome'; // <-- Import the new component

export default function SignInPage() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="radial-gradient(ellipse at center, #0b0d11, #000000)"
      p={4}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="700px"
        h="700px"
        bgGradient="radial(circle, purple.600, transparent, transparent)"
        filter="blur(150px)"
        opacity={0.15}
        pointerEvents="none"
      />
      
      <Box
        maxW="4xl" 
        w="full"
        bg="rgba(17, 19, 23, 0.5)"
        backdropFilter="blur(10px)"
        rounded="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor="whiteAlpha.200"
        boxShadow="0 20px 50px rgba(0, 0, 0, 0.4)"
        zIndex={10}
      >
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }}>
          
          <GridItem
            minH={{ base: '300px', lg: '500px' }}
            position="relative" // This is crucial for the absolute positioning of the overlay
          >
            {/* The 3D animation is now the background */}
            <Hero3D /> 
            {/* The welcome text sits on top */}
            <WelcomeOverlay /> 
          </GridItem>

          <GridItem
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={{ base: 6, md: 10 }}
          >
            <VStack spacing={6} w="full" maxW="sm">
              <VStack spacing={3}>
                  <Logo size={12} />
                  <Heading as="h1" size="lg" color="gray.50">
                      Algo Analyzer
                  </Heading>
                  <Text color="gray.400">Authentication Required</Text>
              </VStack>

              <VStack w="full" spacing={4} pt={4}>
                <Button
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  w="full"
                  size="lg"
                  variant="outline"
                  color="gray.300"
                  borderColor="whiteAlpha.300"
                  leftIcon={<Icon as={FaGoogle} />}
                  _hover={{ 
                    bg: 'purple.500/10',
                    borderColor: 'purple.400',
                    color: 'white',
                   }}
                >
                  Continue with Google
                </Button>

                <Button
                  onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                  w="full"
                  size="lg"
                  variant="outline"
                  color="gray.300"
                  borderColor="whiteAlpha.300"
                  leftIcon={<Icon as={FaGithub} />}
                  _hover={{ 
                    bg: 'purple.500/10',
                    borderColor: 'purple.400',
                    color: 'white',
                   }}
                >
                  Continue with GitHub
                </Button>
              </VStack>

              <Text fontSize="xs" color="gray.500" pt={4}>
                By continuing, you agree to our Terms of Service.
              </Text>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
}