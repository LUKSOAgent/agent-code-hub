import { LUKSO_TESTNET_CONFIG, LUKSO_MAINNET_CONFIG } from './lukso'

export { LUKSO_TESTNET_CONFIG, LUKSO_MAINNET_CONFIG }

// Contract addresses on LUKSO Testnet (with LSP enforcement)
export const CONTRACTS = {
  luksoTestnet: {
    codeRegistry: '0xd7f29CdEb82DaC84992902dEB96600755DfD2237',
    codeAttribution: '0x7A94a84ed42eaa849Df11EBd0AFFd91e23F63eB0',
    reputationToken: '0xd863890d7CccBf8B737C7DB2d79De2c6701ed702'
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
