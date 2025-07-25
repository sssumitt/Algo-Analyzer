'use client';

import { Box } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function DashboardPage() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar/>
      <Box as="main" flex="1" px={8} py={6} />
      <Footer />
    </Box>
  );
}
