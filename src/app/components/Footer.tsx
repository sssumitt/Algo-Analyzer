'use client';

import { Box, Container, HStack, IconButton, Tooltip, Flex, Divider } from '@chakra-ui/react';
import { Github, Linkedin } from 'lucide-react';

const developers = [
  {
    github: "https://github.com/sssumitt",
    linkedin: "https://www.linkedin.com/in/sumit-anand-68b828366",
  },
  {
    github: "https://github.com/AvneetKapoor28/",
    linkedin: "https://www.linkedin.com/in/avneet-singh-kapoor-9a6168248",
  },
  {
    github: "https://github.com/SUJAATALI",
    linkedin: "https://www.linkedin.com/in/sujaatali/",
  },
];

export function Footer() {
  return (
    <Box as="footer" bg="gray.900" color="gray.300">
      <Container maxW="1200px" py={6} px={{ base: 6, md: 10 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
        >
          <Box fontSize="sm" mb={{ base: 4, md: 0 }}>
            © {new Date().getFullYear()} Algo Analyzer. All rights reserved.
          </Box>

          <HStack spacing={{ base: 4, md: 6 }}>
            {developers.map((dev, idx) => (
              <HStack key={idx} spacing={2}>
                <Tooltip label="GitHub" hasArrow bg="gray.700" color="white">
                  <IconButton
                    as="a"
                    href={dev.github}
                    target="_blank"
                    aria-label="GitHub"
                    icon={<Github size={20} />}
                    variant="ghost"
                    color="gray.300"
                    _hover={{ color: 'white' }}
                    rounded="full"
                  />
                </Tooltip>
                <Tooltip label="LinkedIn" hasArrow bg="gray.700" color="white">
                  <IconButton
                    as="a"
                    href={dev.linkedin}
                    target="_blank"
                    aria-label="LinkedIn"
                    icon={<Linkedin size={20} />}
                    variant="ghost"
                    color="gray.300"
                    _hover={{ color: 'white' }}
                    rounded="full"
                  />
                </Tooltip>
              </HStack>
            ))}
          </HStack>
        </Flex>

        <Divider borderColor="whiteAlpha.200" mt={6} />
      </Container>
    </Box>
  );
}

export default Footer;
