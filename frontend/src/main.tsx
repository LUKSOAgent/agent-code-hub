import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { luksoTestnet, lukso } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import App from './App';
import './index.css';

const config = getDefaultConfig({
  appName: 'Agent Code Hub',
  projectId: 'agent_code_hub_2025',
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
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
);
