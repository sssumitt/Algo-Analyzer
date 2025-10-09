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
      <body>
        <EmotionRegistry>
          <Providers>
              {children}
          </Providers>
        </EmotionRegistry>
      </body>
    </html>
  );
}
