// src/app/components/Footer.tsx
'use client';

import { Box, Container, Text } from '@chakra-ui/react';
import React from 'react';

/** Global footer shown on every page */
export function Footer() {
  return (
    <Box
      as="footer"
      py={{ base: 4, md: 6 }}
      borderTop="1px solid"
      borderColor="whiteAlpha.200"
      bg="transparent"
    >
      <Container maxW="1200px">
        <Text fontSize="xs" textAlign="center" color="gray.400">
          © {new Date().getFullYear()}{' '}
          <Text as="span" fontWeight="semibold" color="white">
            Algo&nbsp;Analyzer
          </Text>
          . All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}

/* optional default export so both styles work */
export default Footer;
