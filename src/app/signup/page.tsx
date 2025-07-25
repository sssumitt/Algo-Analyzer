'use client';

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Divider,
  Image,
  HStack,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Logo } from '../components/Logo';

const API_URL = 'https://authentication-bzi6.onrender.com';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get CSRF token
      const csrfResponse = await fetch(`${API_URL}/auth/csrf-token`, {
        credentials: 'include'
      });
      
      if (!csrfResponse.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const { csrfToken } = await csrfResponse.json();
      console.log(csrfToken)

      // 2. Submit authentication request
      const authResponse = await fetch(`${API_URL}/auth/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      // 3. Handle response
      if (authResponse.ok) {
        // Success - redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        // Handle server errors
        const errorData = await authResponse.json();
        throw new Error(errorData.message || `Failed to ${mode}`);
      }
    } catch (error) {
      // Display error to user
      toast({
        title: 'Authentication Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      minH="100vh"
      // bgGradient="linear(to-b, rgba(128,90,213,0.15), #0e0f14)"
      bgGradient="linear(to-b, rgba(107, 70, 193, 0.3), #0e0f14)"

      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Container maxW="sm" px={0}>
        <Box
          position="relative"
          rounded="xl"
          p={8}
          bg="rgba(255,255,255,0.04)"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="3px"
            bgGradient="linear(to-r, purple.300, pink.300)"
          />

          {/* Logo + gradient text */}
          <HStack mb={2} spacing={3}>
            <Logo/>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              bgGradient="linear(to-r, purple.300, pink.300)"
              bgClip="text"
            >
              Algo Analyzer
            </Text>
          </HStack>

          <Text fontSize="sm" color="gray.400" mb={6}>
            {mode === 'login'
              ? 'Sign in to continue analyzing.'
              : 'Create an account to get started.'}
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" color="gray.300">
                  Username
                </FormLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe"
                  bg="whiteAlpha.200"
                  _focus={{ bg: 'whiteAlpha.300' }}
                  required
                  isDisabled={loading}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="gray.300">
                  Password
                </FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  bg="whiteAlpha.200"
                  _focus={{ bg: 'whiteAlpha.300' }}
                  required
                  isDisabled={loading}
                />
              </FormControl>

              <Button 
                type="submit" 
                w="full" 
                colorScheme="purple"
                isLoading={loading}
                loadingText={mode === 'login' ? 'Logging in' : 'Registering'}
              >
                {mode === 'login' ? 'Login' : 'Register'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                isDisabled={loading}
              >
                {mode === 'login'
                  ? 'Need an account? Register'
                  : 'Already have an account? Login'}
              </Button>

              <Divider borderColor="whiteAlpha.200" pt={2} />

              <Button
                as="a"
                href={`${API_URL}/auth/google`}
                w="full"
                bg="white"
                color="gray.800"
                _hover={{ bg: 'whiteAlpha.900' }}
                fontWeight="medium"
                leftIcon={
                  <Image
                    src="/google-icon.png"
                    alt="Google"
                    boxSize="20px"
                  />
                }
                isDisabled={loading}
              >
                Continue with Google
              </Button>
            </VStack>
          </form>
        </Box>
      </Container>
    </Box>
  );
}