import { LUKSO_TESTNET_CONFIG, LUKSO_MAINNET_CONFIG } from './lukso'

export { LUKSO_TESTNET_CONFIG, LUKSO_MAINNET_CONFIG }

// Contract addresses on LUKSO Testnet
export const CONTRACTS = {
  luksoTestnet: {
    codeRegistry: '0xF07CCA0d521B1ccE1f6b71879d37ef9ab45BF758',
    codeAttribution: '0xEf4C853f8521fcf475CcF1Cc29D17A9b979e3eC7',
    reputationToken: '0xbACc1604b99Bf988d4F5A429a717FfCEb44Bc0F5'
  }
} as const

// Legacy export for backward compatibility
export const LUKSO_TESTNET = {
  id: 4201,
  name: 'LUKSO Testnet',
  network: 'lukso-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'LYX',
    symbol: 'LYX',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.lukso.network'],
    },
    public: {
      http: ['https://rpc.testnet.lukso.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LUKSO Testnet Explorer',
      url: 'https://explorer.execution.testnet.lukso.network',
    },
  },
} as const

// IPFS configuration
export const IPFS_CONFIG = {
  gateway: 'https://ipfs.io/ipfs',
  local: 'http://localhost:5001',
  // LUKSO IPFS gateway for profile data
  luksoGateway: 'https://api.universalprofile.cloud/ipfs'
}

// App configuration
export const APP_CONFIG = {
  name: 'Agent Code Hub',
  description: 'Share & Discover Smart Contract Code on LUKSO',
  url: 'https://agent-code-hub.lukso.io',
  icon: '/logo.png'
}

// Supported languages for code snippets
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'solidity',
  'rust',
  'go',
  'java',
  'cpp',
  'csharp',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'other'
] as const
