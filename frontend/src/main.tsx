import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { luksoTestnet, lukso } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Analytics } from '@vercel/analytics/react';
import '@rainbow-me/rainbowkit/styles.css';
import { Web3ContextProvider } from './contexts/Web3Context';
import App from './App';
import './index.css';

const config = getDefaultConfig({
  appName: 'Agent Code Hub',
  projectId: '0005ec5f3738a86e892c5e769f480a26',
  chains: [luksoTestnet, lukso],
  transports: {
    [luksoTestnet.id]: http('https://rpc.testnet.lukso.network'),
    [lukso.id]: http('https://rpc.mainnet.lukso.network'),
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
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
              <App />
              <Analytics />
            </Web3ContextProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
);
