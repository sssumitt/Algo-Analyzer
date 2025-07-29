// src/app/dashboard/page.tsx
'use client';

import { Flex, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import UploadQuestionForm from '@/app/components/UploadQuestionForm';
import ResultSection from '@/app/sections/ResultSection';

type AnalysisJSON = { pseudoCode: string[]; time: string; space: string; tags: string[] };

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisJSON | null>(null);
  const toast = useToast();

  /** Type-guard to verify the server really returned an AnalysisJSON */
  const isAnalysisJSON = (data: unknown): data is AnalysisJSON => {
    if (typeof data !== 'object' || data === null) return false;
    const d = data as Record<string, unknown>;
    return Array.isArray(d.pseudoCode)
      && typeof d.time === 'string'
      && typeof d.space === 'string'
      && Array.isArray(d.tags);
  };

  const runAnalysis = async (link: string, code: string) => {
    setAnalysis(null);

    try {
      const res = await fetch('/api/analyze', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ link, code }),
      });

      const text    = await res.text();          // raw response
      const payload: unknown = JSON.parse(text); // no `any` here ✅

      if (!res.ok) {
        // try to surface a server-side error field if it exists
        const errorMessage =
          typeof payload === 'object' && payload !== null && 'error' in payload
            ? (payload as { error?: string }).error ?? 'Gemini analysis failed'
            : 'Gemini analysis failed';
        throw new Error(errorMessage);
      }

      if (isAnalysisJSON(payload)) {
        setAnalysis(payload);
      } else {
        throw new Error('Unexpected response shape from server');
      }

    } catch (err: unknown) {                     // no `any` here ✅
      const message = err instanceof Error ? err.message : 'Unexpected error';
      toast({ status: 'error', title: message });
      console.error(err);
    }
  };

  return (
    <Flex
      direction={{ base: 'column', lg: 'row' }}
      align="flex-start"
      justify="center"
      gap={8}
      px={{ base: 4, md: 10 }}
      py={6}
    >
      <UploadQuestionForm onSubmit={runAnalysis} />

      {analysis && (
        <ResultSection
          pseudoCode={analysis.pseudoCode}
          results={[
            { label: 'Time',  value: analysis.time  },
            { label: 'Space', value: analysis.space },
            { label: 'Tags',  value: analysis.tags.join(', ') },
          ]}
        />
      )}
    </Flex>
  );
}
