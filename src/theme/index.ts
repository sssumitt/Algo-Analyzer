// src/theme/index.ts
import { extendTheme as extendChakra } from '@chakra-ui/react'
import { theme as saasTheme }      from '@saas-ui/react'

const custom = {
  colors: {
    brand: {
      50:  '#f5fee5',
      500: '#3a8e2b',
      700: '#27691f',
    },
  },
}

export default extendChakra(custom, saasTheme)
