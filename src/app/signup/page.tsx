// src/app/signup/page.tsx  (a.k.a. auth page)
'use client';

import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { Logo } from '../components/Logo';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const API = '/api';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const isError = (e: unknown): e is Error =>
    typeof e === 'object' && e !== null && 'message' in e;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch(`${API}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({}));
          throw new Error(error ?? 'Registration failed');
        }
      }

      const res = await signIn('credentials', {
        username,
        password,
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (res?.error) throw new Error(res.error);
      router.push('/dashboard');
    } catch (err: unknown) {            // ← no more `any`
      toast({
        title: 'Auth error',
        description: isError(err) ? err.message : 'Unexpected error',
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
      bg="linear-gradient(to bottom, rgba(128,90,213,0.15), #0e0f14)"
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

          <HStack mb={2} spacing={3}>
            <Logo />
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
                onClick={() =>
                  signIn('google', { callbackUrl: '/dashboard' })
                }
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
