'use client';

import { Box, Container, Text, HStack, IconButton } from '@chakra-ui/react';
import { Github, Twitter, Linkedin } from 'lucide-react';

/** A minimalist and subtle global footer */
export function Footer() {
  return (
    <Box
      as="footer"
      bg="transparent" // Fully transparent background
      color="gray.500"   // Muted text color for subtlety
    >
      <Container 
        maxW="1200px" 
        py={6} 
        px={{ base: 6, md: 10 }}
        borderTop="1px solid" // A simple top border for separation
        borderColor="whiteAlpha.200"
      >
        <HStack justify="space-between" align="center">
          <Text fontSize="sm">
            © {new Date().getFullYear()} Algo Analyzer. All rights reserved.
          </Text>
          <HStack spacing={3}>
            <IconButton
              as="a"
              href="#"
              aria-label="GitHub"
              icon={<Github size={20} />}
              variant="ghost"
              color="gray.500"
              transition="color 0.2s"
              _hover={{ color: 'white' }}
              rounded="full"
            />
            <IconButton
              as="a"
              href="#"
              aria-label="Twitter"
              icon={<Twitter size={20} />}
              variant="ghost"
              color="gray.500"
              transition="color 0.2s"
              _hover={{ color: 'white' }}
              rounded="full"
            />
            <IconButton
              as="a"
              href="#"
              aria-label="LinkedIn"
              icon={<Linkedin size={20} />}
              variant="ghost"
              color="gray.500"
              transition="color 0.2s"
              _hover={{ color: 'white' }}
              rounded="full"
            />
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}

/* optional default export so both styles work */
export default Footer;
