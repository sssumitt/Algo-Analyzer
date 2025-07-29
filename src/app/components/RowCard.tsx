// src/app/components/RowCard.tsx
'use client';

import { Card, CardBody } from '@chakra-ui/react';
import React, { ReactNode, ElementType } from 'react';

/** Row-style card for a site that is *always* dark-mode. */
interface RowCardProps {
  children: ReactNode;
  onClick?: () => void;
  as?: ElementType;   // ← was `any`
  href?: string;
}

export default function RowCard({
  children,
  onClick,
  as,
  href,
}: RowCardProps) {
  const bg    = '#1f232a'; // matches screenshot
  const hover = '#262b32'; // subtle lift

  return (
    <Card
      as={as}
      href={href}
      w="full"
      bg={bg}
      cursor={onClick || href ? 'pointer' : 'default'}
      _hover={onClick || href ? { bg: hover, boxShadow: 'md' } : undefined}
      transition="background 0.15s ease"
      borderRadius="md"
      onClick={onClick}
    >
      <CardBody py={4}>{children}</CardBody>
    </Card>
  );
}
