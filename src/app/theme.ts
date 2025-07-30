import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = { initialColorMode: 'dark', useSystemColorMode: false };

export const theme = extendTheme({
  config,
  styles: {
    global: {
      // Add this to set a base height
      'html, body': {
        height: '100%',
      },
      body: {
        bg: '#0b0d11',
        color: 'gray.100',
        // This makes the body at least as tall as the viewport
        minHeight: '100vh',
      },
    },
  },
});