'use client';

import './globals.css';
import ClientAuthProvider from './ClientAuthProvider';
import TokenRefresher from '@/components/TokenRefresher';
import { Rubik } from 'next/font/google';
import { useEffect } from 'react';
import { initMixpanel } from '../lib/mixpanel';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const rubik = Rubik({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  if (process.env.NODE_ENV === 'production') {
    useEffect(() => {
      initMixpanel(); // Initialize Mixpanel
    }, []);
  }
  
  return (
    <html lang="en">
      <body className={rubik.className}>
        <ClientAuthProvider>
          <TokenRefresher />
          <NuqsAdapter>
            {children}
          </NuqsAdapter>
        </ClientAuthProvider>
      </body>
    </html>
  );
}