// src/app/components/UploadQuestionForm.tsx
'use client';

import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Panel } from './Panel';

interface UploadQuestionFormProps {
  onSubmit: (link: string, code: string) => Promise<void>;
}

export default function UploadQuestionForm({ onSubmit }: UploadQuestionFormProps) {
  const [link, setLink]       = useState('');
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const isError = (e: unknown): e is Error => e instanceof Error;

  const handleClick = async () => {
    if (!link.trim() || !code.trim()) return;
    setLoading(true);
    try {
      await onSubmit(link.trim(), code);
    } catch (err: unknown) {                              // ← no more `any`
      toast({
        status: 'error',
        title: isError(err) ? err.message : 'Analysis failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel>
      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel color="white">Problem URL</FormLabel>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste problem URL…"
            size="lg"
            bg="whiteAlpha.100"
            borderColor="gray.600"
            _placeholder={{ color: 'gray.400' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel color="white">Your Solution</FormLabel>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your solution code…"
            size="lg"
            minH="240px"
            bg="whiteAlpha.100"
            borderColor="gray.600"
            _placeholder={{ color: 'gray.400' }}
            fontFamily="mono"
          />
        </FormControl>

        <Button
          onClick={handleClick}
          isDisabled={!link.trim() || !code.trim() || loading}
          size="lg"
          leftIcon={loading ? <Spinner /> : undefined}
          bgGradient="linear(to-r, purple.400, pink.400)"
          _hover={{ bgGradient: 'linear(to-r, purple.500, pink.500)' }}
        >
          Analyse
        </Button>
      </VStack>
    </Panel>
  );
}
