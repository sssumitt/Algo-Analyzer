'use client'

import { ReactNode } from 'react'
import { CacheProvider } from '@chakra-ui/next-js'
import { extendTheme } from '@chakra-ui/react'
import { SaasProvider, theme as saasTheme } from '@saas-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const customTheme = extendTheme(
  {
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    },
    styles: {
      global: {
        body: {
          bg: '#05060a',   // fallback page background
          color: 'white',
        },
      },
    },
    colors: {
      brand: { 50: '#f5fee5', 500: '#3a8e2b', 700: '#27691f' },
    },
  },
  saasTheme
)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CacheProvider>
      <QueryClientProvider client={queryClient}>
        <SaasProvider theme={customTheme}>{children}</SaasProvider>
      </QueryClientProvider>
    </CacheProvider>
  )
}
