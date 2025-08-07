'use client';

import { Box, Heading, Stack, Text } from '@chakra-ui/react';

export function WelcomeOverlay() {
  return (
    <Box
      position="absolute"
      top="50%"
      left={{ base: '50%', lg: '8%' }}
      transform={{ base: 'translate(-50%, -50%)', lg: 'translateY(-50%)' }}
      w={{ base: 'calc(100% - 2rem)', md: 'auto' }}
      zIndex={10}
      p={{ base: 4, md: 8 }}
      pointerEvents="none"
    >
      <Stack 
        spacing={6} 
        maxW="lg" 
        align={{ base: 'center', lg: 'flex-start' }}
        textAlign={{ base: 'center', lg: 'left' }}
      >
        <Heading
          size={{ base: 'xl', md: '2xl' }}
          lineHeight="1.1"
          bgGradient="linear(to-r, purple.300, pink.300)"
          bgClip="text"
        >
          {/* The apostrophe in "Code's" is now escaped */}
          Unlock Your Code&apos;s Potential
        </Heading>
        <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.300">
          Visualize complexity, discover insights, and master your algorithms.
        </Text>
      </Stack>
    </Box>
  );
}