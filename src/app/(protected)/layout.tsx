// src/app/(protected)/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Flex, Box } from '@chakra-ui/react';
import { NavbarAuth } from '@/app/components/NavbarAuth';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If there's no session, redirect to the home/login page
  if (!session || !session.user) {
    redirect('/');
  }

  return (
    <Flex direction="column" minH="100vh">
     
      <NavbarAuth user={session.user} />
      
      {/* Your main content */}
      <Box as="main" flex="1">
        {children}
      </Box>
    </Flex>
  );
}