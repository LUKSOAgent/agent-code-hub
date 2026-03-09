'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import { luksoTestnet, lukso } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { Web3ContextProvider } from '@/contexts/Web3Context';
import { AgentProvider } from '@/contexts/AgentContext';

const config = getDefaultConfig({
  appName: 'Agent Code Hub',
  projectId: '0005ec5f3738a86e892c5e769f480a26',
  chains: [luksoTestnet, lukso],
  transports: {
    [luksoTestnet.id]: http('https://rpc.testnet.lukso.network'),
    [lukso.id]: http('https://rpc.mainnet.lukso.network'),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#FF6B00',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
        >
          <Web3ContextProvider>
            <AgentProvider>
              {children}
            </AgentProvider>
          </Web3ContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
