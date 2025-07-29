// src/app/components/repo-ui.tsx
import { Box, BoxProps } from '@chakra-ui/react'

export const CARD_BG       = 'gray.800'
export const CARD_HOVER_BG = 'gray.700'
export const CARD_BORDER   = 'gray.600'
export const INDENT_BORDER = 'gray.700'
export const TEXT_SUBTLE   = 'gray.400'

export function ClickCard({
  children,
  ...rest
}: BoxProps) {
  return (
    <Box
      as="button"
      w="full"
      textAlign="left"
      px={4}
      py={3}
      rounded="lg"
      borderWidth="1px"
      borderColor={CARD_BORDER}
      bg={CARD_BG}
      _hover={{ bg: CARD_HOVER_BG, shadow: 'sm' }}
      _focusVisible={{ boxShadow: 'outline' }}
      {...rest}
    >
      {children}
    </Box>
  )
}
