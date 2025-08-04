import React, { useState } from 'react';
import { HStack, Button } from '@chakra-ui/react';

// --- Component Definition ---
// This is the reusable TabSelector component.

interface TabSelectorProps {
  /**
   * An array of strings representing the labels for each tab.
   */
  tabs: string[];
  /**
   * The initially selected tab. If not provided, the first tab in the array will be selected.
   */
  defaultTab?: string;
  /**
   * A callback function that is invoked whenever a new tab is selected.
   * It receives the label of the selected tab as an argument.
   */
  onTabChange: (tab: string) => void;
}

/**
 * A modern, pill-shaped tab selector component inspired by the provided image.
 * It's built with Chakra UI and is fully typed with TypeScript.
 */
export const TabSelector: React.FC<TabSelectorProps> = ({ tabs, defaultTab, onTabChange }) => {
  // State to keep track of the currently active tab.
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0] : ''));

  /**
   * Handles the click event on a tab.
   * It updates the internal state and calls the onTabChange callback.
   * @param tab - The label of the clicked tab.
   */
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    // The main container for the tabs, styled to look like a dark, rounded capsule.
    <HStack
      as="nav"
      spacing={2}
      p={2}
      bg="gray.900"
      borderRadius="full"
      boxShadow="lg"
      width={'fit-content'}
    >
      {tabs.map((tab) => (
        <Button
          key={tab}
          onClick={() => handleTabClick(tab)}
          // --- Styling ---
          // Applies different styles based on whether the tab is active.
          bg={activeTab === tab ? 'whiteAlpha.300' : 'transparent'}
          color="white"
          borderRadius="full"
          variant="solid"
          size="md"
          px={8}
          py={2}
          fontWeight="medium"
          // Smooth transition for background color changes.
          transition="background-color 0.3s ease-in-out"
          // Removes the default blue focus outline for a cleaner look.
          _focus={{ boxShadow: 'none' }}
          // Subtle hover effect for inactive tabs.
          _hover={{
            bg: activeTab === tab ? 'whiteAlpha.300' : 'whiteAlpha.100',
          }}
        >
          {tab}
        </Button>
      ))}
    </HStack>
  );
};

export default TabSelector;