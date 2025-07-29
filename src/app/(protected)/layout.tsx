// src/app/(protected)/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';          // ← fixed path
import { Flex, Box } from '@chakra-ui/react';

import { NavbarAuth } from '@/app/components/NavbarAuth';
  // import Footer from '@/app/components/Footer';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  const userName =
    session.user?.name ?? session.user?.email?.split('@')[0] ?? 'User';

  return (
    <Flex direction="column" minH="100vh">
      <NavbarAuth userName={userName} />
      <Box as="main" flex="1" px={4} py={6}>
        {children}
      </Box>
      {/* <Footer /> */}
    </Flex>
  );
}
