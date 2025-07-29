import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = { initialColorMode: 'dark', useSystemColorMode: false };

export const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: '#0b0d11',
        color: 'gray.100',
      },
    },
  },
});
