// src/app/components/Logo.tsx
'use client';
import { Box, chakra, useId, type ResponsiveValue } from '@chakra-ui/react';
import React from 'react';

interface LogoProps {
  /** Chakra size token, number, or responsive value */
  size?: ResponsiveValue<string | number>;
}

export const Logo: React.FC<LogoProps> = ({ size = 12 }) => {
  const gradId = useId('logo-gradient');        

  return (
    <Box display="inline-block" cursor="pointer" sx={{ perspective: '600px' }}>
      <chakra.svg
        viewBox="0 0 64 64"
        boxSize={size}
        fill="none"
        transition="transform .6s"
        _hover={{ transform: 'rotateY(180deg)' }}
        sx={{ transformStyle: 'preserve-3d' }}
      >
        <defs>
          <linearGradient id={`grad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Outer diamond */}
        <path
          d="M32 8 L56 32 L32 56 L8 32 Z"
          stroke={`url(#grad-${gradId})`}
          strokeWidth={4}
          strokeLinejoin="round"
        />

        {/* Inner network */}
        <path
          d="M32 24 L40 32 L32 40 L24 32 Z"
          stroke={`url(#grad-${gradId})`}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <circle cx="32" cy="24" r="3" fill={`url(#grad-${gradId})`} />
        <circle cx="40" cy="32" r="3" fill={`url(#grad-${gradId})`} />
        <circle cx="32" cy="40" r="3" fill={`url(#grad-${gradId})`} />
        <circle cx="24" cy="32" r="3" fill={`url(#grad-${gradId})`} />
      </chakra.svg>
    </Box>
  );
};
