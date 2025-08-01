'use client';

import { ReactNode } from 'react';
import { SaasProvider } from '@saas-ui/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme';

const queryClient = new QueryClient();


export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
        <SaasProvider theme={theme}>{children}</SaasProvider>
    </QueryClientProvider>
  );
}
