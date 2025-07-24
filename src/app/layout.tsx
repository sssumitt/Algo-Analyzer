// app/layout.tsx
import './globals.css'
import { Navbar } from './components/Navbar'
import { Providers } from './providers'
import { Footer } from './components/footer'

export const metadata = {
  title: 'Algo Analyzer',
  description: 'Your algorithm dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Providers><Navbar/>{children}<Footer/></Providers></body></html>
}
