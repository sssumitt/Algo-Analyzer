'use client';

import { Box, Container, Text, HStack, VStack, IconButton, Tooltip, Flex } from '@chakra-ui/react';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <Box
      as="footer"
      bg="transparent"
      color="gray.500"
    >
      <Container
        maxW="1200px"
        py={6}
        px={{ base: 6, md: 10 }}
        borderTop="1px solid"
        borderColor="whiteAlpha.200"
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align="center"
        >
          <Text fontSize="sm" mb={{ base: 4, md: 0 }}>
            © {new Date().getFullYear()} Algo Analyzer. All rights reserved.
          </Text>
          <VStack spacing={2} align={{ base: 'center', md: 'flex-end' }}>
            <HStack spacing={1}>
              <Text fontSize="xs" color="gray.600" mr={2}>Dev 1:</Text>
              <Tooltip label="Developer 1's GitHub" hasArrow bg="gray.700" color="white">
                <IconButton
                  as="a"
                  href="https://github.com/sssumitt"
                  target="_blank"
                  aria-label="Developer 1's GitHub"
                  icon={<Github size={20} />}
                  variant="ghost"
                  color="gray.500"
                  transition="color 0.2s"
                  _hover={{ color: 'white' }}
                  rounded="full"
                />
              </Tooltip>
              <Tooltip label="Developer 1's LinkedIn" hasArrow bg="gray.700" color="white">
                <IconButton
                  as="a"
                  href="https://www.linkedin.com/in/sumit-anand-68b828366" 
                  target="_blank"
                  aria-label="Developer 1's LinkedIn"
                  icon={<Linkedin size={20} />}
                  variant="ghost"
                  color="gray.500"
                  transition="color 0.2s"
                  _hover={{ color: 'white' }}
                  rounded="full"
                />
              </Tooltip>
              
            </HStack>
            <HStack spacing={1}>
              <Text fontSize="xs" color="gray.600" mr={2}>Dev 2:</Text>
              <Tooltip label="Developer 2's GitHub" hasArrow bg="gray.700" color="white">
                <IconButton
                  as="a"
                  href="https://github.com/AvneetKapoor28/"
                  target="_blank"
                  aria-label="Developer 2's GitHub"
                  icon={<Github size={20} />}
                  variant="ghost"
                  color="gray.500"
                  transition="color 0.2s"
                  _hover={{ color: 'white' }}
                  rounded="full"
                />
              </Tooltip>
              <Tooltip label="Developer 2's LinkedIn" hasArrow bg="gray.700" color="white">
                <IconButton
                  as="a"
                  href="https://www.linkedin.com/in/avneet-singh-kapoor-9a6168248"
                  target="_blank"
                  aria-label="Developer 2's LinkedIn"
                  icon={<Linkedin size={20} />}
                  variant="ghost"
                  color="gray.500"
                  transition="color 0.2s"
                  _hover={{ color: 'white' }}
                  rounded="full"
                />
              </Tooltip>
              
            </HStack>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default Footer;
