import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from './providers';
import { NavbarWrapper } from './navbar-wrapper';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Code Hub | Decentralized Code Sharing on LUKSO',
  description: 'Share and discover code snippets on the LUKSO blockchain. Decentralized code registry with IPFS storage and on-chain attribution.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen bg-slate-950">
            <NavbarWrapper />
            {children}
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
