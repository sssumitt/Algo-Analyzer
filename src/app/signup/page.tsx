import { Suspense } from 'react';
import AuthForm from '@/app/components/AuthForm';

import { Box, Spinner } from '@chakra-ui/react';

// This is the loading UI that will be shown as a fallback
function Loading() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="linear-gradient(to bottom, rgba(128,90,213,0.15), #0e0f14)"
    >
      <Spinner size="xl" color="purple.300" />
    </Box>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthForm />
    </Suspense>
  );
}