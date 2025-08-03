// src/app/(protected)/repository/components/TabbedView.tsx
'use client'; // This component handles state, so it's a client component.

import { useState, useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import TabSelector from '@/app/components/TabSelector'; // Your existing TabSelector

// Define the props this component will accept
interface TabbedViewProps {
  filteredView: React.ReactNode;
  indexedView: React.ReactNode;
}

const TabbedView: React.FC<TabbedViewProps> = ({ filteredView, indexedView }) => {
  // --- Configuration Array ---
  // This is a neater, more scalable way to manage tabs.
  // Each object defines a tab's label and its corresponding content.
  const tabsConfig = useMemo(() => [
    {
      label: 'Filtered',
      content: filteredView,
    },
    {
      label: 'Indexed',
      content: indexedView,
    },
    // To add a new tab, you would just add a new object here.
  ], [filteredView, indexedView]);

  // State is managed here, on the client. Default to the first tab's label.
  const [activeTabLabel, setActiveTabLabel] = useState(tabsConfig[0].label);

  // Derive the list of tab labels for the TabSelector component.
  const tabLabels = tabsConfig.map(tab => tab.label);

  // Find the content for the currently active tab.
  const activeTabContent = tabsConfig.find(tab => tab.label === activeTabLabel)?.content;

  return (
    <Box>
      <Box display="flex" justifyContent="center" mb={4} width={'100%'} mt={5}>
        <TabSelector
          tabs={tabLabels}
          defaultTab={activeTabLabel}
          onTabChange={(tab) => setActiveTabLabel(tab)}
        />
      </Box>

      <Box mt={4} p={4}>
        {/* Now, we just render the active content directly. No more conditional checks! */}
        {activeTabContent}
      </Box>
    </Box>
  );
};

export default TabbedView;