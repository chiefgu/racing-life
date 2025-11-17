import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { ReactQueryProvider } from '@/lib/react-query';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Racing Life - Australian Horse Racing Odds & News',
  description:
    'Compare odds from top Australian bookmakers and get the latest horse racing news with AI-powered sentiment analysis',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#24508F',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'} />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ReactQueryProvider>
          <AuthProvider>
            <WebSocketProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </WebSocketProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
