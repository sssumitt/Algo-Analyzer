// src/app/(protected)/repository/page.tsx
// This is your main page file. It should be a Server Component (no 'use client').



import { Spinner, Center } from '@chakra-ui/react';
import RepositoryHome from './views/indexed-view'; // Your existing server component
import TabbedView from '@/app/components/tabbedView';

import FilteredView from './views/filter-view'; // Placeholder for the filtered view
import { getFilterOptions } from './actions';
import { Suspense } from 'react';

const RepositoryLoading = () => (
  <Center p={10}>
    <Spinner thickness="4px" speed="0.65s" emptyColor="gray.700" color="blue.500" size="xl" />
  </Center>
);

export default async function RepositoryPage() {
    const { domainOptions, algorithmOptions } = await getFilterOptions();
  return (
    <TabbedView
      filteredView={<FilteredView allDomains={domainOptions ?? []} allAlgorithms={algorithmOptions ?? []} />}
      indexedView={
        <Suspense fallback={<RepositoryLoading />}>
          <RepositoryHome />
        </Suspense>
      }
    />
  )
}