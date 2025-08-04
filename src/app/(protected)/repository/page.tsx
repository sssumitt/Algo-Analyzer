// src/app/(protected)/repository/page.tsx
// This is your main page file. It should be a Server Component (no 'use client').

import { Box, Text } from '@chakra-ui/react';
import { getServerSession } from 'next-auth/next';
import { Spinner, Center } from '@chakra-ui/react';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
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
  const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect('/signup');
    const userId = session.user.id;
    const { domainOptions, algorithmOptions } = await getFilterOptions();
  // This is the part you asked about.
  // We are rendering the components here on the server and passing them as props.
  return (
    // <TabbedView
    //   // Here, we pass the placeholder component for the "Filtered" tab
    //   filteredView={<FilteredView />}

    //   // And here, we pass your <RepositoryHome /> server component for the "Indexed" tab
    //   indexedView={<RepositoryHome />}
    <TabbedView
      // Pass the filter options to the FilteredView component
      filteredView={<FilteredView allDomains={domainOptions ?? []} allAlgorithms={algorithmOptions ?? []} />}
      indexedView={
        <Suspense fallback={<RepositoryLoading />}>
          <RepositoryHome />
        </Suspense>
      }
    />
  )
}