import './globals.css';
import { Providers } from './providers';
import { EmotionRegistry } from './emotion';



export const metadata = {
  title: 'Algo Analyzer',
  description: 'Your algorithm dashboard',
  icons: [
    {
      rel: 'icon',
      url: '/logo.svg', 
    },
  ],
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0e0f14] text-white">
        <EmotionRegistry>
          <Providers>
            <main className="min-h-screen flex flex-col">
              {children}
            </main>
          </Providers>
        </EmotionRegistry>
    
      </body>
    </html>
  );
}
