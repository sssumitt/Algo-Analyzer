// src/app/(protected)/repository/page.tsx
// This is your main page file. It should be a Server Component (no 'use client').

import { Box ,Spinner, Center, chakra } from '@chakra-ui/react';


import FilteredView from './views/filter-view'; // Placeholder for the filtered view
import { getFilterOptions } from './actions';



const RepositoryLoading = () => (
  <Center p={10}>
    <Spinner thickness="4px" speed="0.65s" emptyColor="gray.700" color="blue.500" size="xl" />
  </Center>
);

export default async function RepositoryPage() {
    const { domainOptions, algorithmOptions } = await getFilterOptions();
  return (

      <Box 
        pt='2em'
      >        
        <FilteredView allDomains={domainOptions ?? []} allAlgorithms={algorithmOptions ?? []} />
      </Box>
    
  )
}