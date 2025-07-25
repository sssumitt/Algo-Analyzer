'use client'
import { Box } from '@chakra-ui/react'
import { RepositoryShowcase } from '../sections/RepositoryShowcase'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'


export default function LandingPage() {
  return (
    <> 
      <Navbar/>

      <Box
        minH="100vh"
        bgGradient="radial(at 30% 30%, #5b2dbb, transparent), radial(at 80% 70%, #7810a8, transparent), linear(to-b,#05060a,#05060a)"
        color="white"
      >
        <RepositoryShowcase />
      
      </Box>
      <Footer/>
    </>
    
  )
}
