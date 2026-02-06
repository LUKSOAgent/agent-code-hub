import { ethers, BrowserProvider, Contract } from 'ethers'

// Interface IDs for detecting Universal Profile capabilities
export const LSP0_INTERFACE_ID = '0x24871b3a' // LSP0ERC725Account
export const LSP6_INTERFACE_ID = '0x6f4df48b' // LSP6KeyManager
export const LSP17Extendable_INTERFACE_ID = '0xc245d565' // LSP17Extendable
export const ERC725X_INTERFACE_ID = '0x7545acac'
export const ERC725Y_INTERFACE_ID = '0x629aa694'

// LSP6 Permission keys
export const LSP6_PERMISSIONS = {
  CHANGEOWNER: '0x0000000000000000000000000000000000000000000000000000000000000000',
  ADDCONTROLLER: '0x0000000000000000000000000000000000000000000000000000000000000001',
  EDITPERMISSIONS: '0x0000000000000000000000000000000000000000000000000000000000000002',
  ADDEXTENSIONS: '0x0000000000000000000000000000000000000000000000000000000000000003',
  CHANGEEXTENSIONS: '0x0000000000000000000000000000000000000000000000000000000000000004',
  ADDUNIVERSALRECEIVERDELEGATE: '0x0000000000000000000000000000000000000000000000000000000000000005',
  CHANGEUNIVERSALRECEIVERDELEGATE: '0x0000000000000000000000000000000000000000000000000000000000000006',
  REENTRANCY: '0x0000000000000000000000000000000000000000000000000000000000000007',
  SUPER_TRANSFERVALUE: '0x0000000000000000000000000000000000000000000000000000000000000008',
  TRANSFERVALUE: '0x0000000000000000000000000000000000000000000000000000000000000100',
  SUPER_CALL: '0x0000000000000000000000000000000000000000000000000000000000000200',
  CALL: '0x0000000000000000000000000000000000000000000000000000000000000400',
  SUPER_STATICCALL: '0x0000000000000000000000000000000000000000000000000000000000000800',
  STATICCALL: '0x0000000000000000000000000000000000000000000000000000000000001000',
  SUPER_DELEGATECALL: '0x0000000000000000000000000000000000000000000000000000000000002000',
  DELEGATECALL: '0x0000000000000000000000000000000000000000000000000000000000004000',
  DEPLOY: '0x0000000000000000000000000000000000000000000000000000000000008000',
  SUPER_SETDATA: '0x0000000000000000000000000000000000000000000000000000000000010000',
  SETDATA: '0x0000000000000000000000000000000000000000000000000000000000020000',
  ENCRYPT: '0x0000000000000000000000000000000000000000000000000000000000040000',
  DECRYPT: '0x0000000000000000000000000000000000000000000000000000000000080000',
  SIGN: '0x0000000000000000000000000000000000000000000000000000000000100000',
}

/**
 * Check if an address is a Universal Profile by verifying interface support
 */
export async function isUniversalProfile(address: string, provider: BrowserProvider): Promise<boolean> {
  try {
    const code = await provider.getCode(address)
    
    // If no code, it's an EOA not a smart contract
    if (!code || code === '0x') {
      return false
    }

    // Check for LSP0 or ERC725 interface support
    const abi = ['function supportsInterface(bytes4 interfaceId) view returns (bool)']
    const contract = new Contract(address, abi, provider)

    const [supportsLSP0, supportsERC725X, supportsERC725Y] = await Promise.all([
      contract.supportsInterface(LSP0_INTERFACE_ID).catch(() => false),
      contract.supportsInterface(ERC725X_INTERFACE_ID).catch(() => false),
      contract.supportsInterface(ERC725Y_INTERFACE_ID).catch(() => false),
    ])

    return supportsLSP0 || (supportsERC725X && supportsERC725Y)
  } catch (error) {
    console.error('Error checking if address is UP:', error)
    return false
  }
}

/**
 * Get the KeyManager address for a Universal Profile
 * Most UPs have a KeyManager that controls permissions
 */
export async function getKeyManagerAddress(
  upAddress: string, 
  provider: BrowserProvider
): Promise<string | null> {
  try {
    // The KeyManager is typically the owner of the UP
    const abi = ['function owner() view returns (address)']
    const contract = new Contract(upAddress, abi, provider)
    const owner = await contract.owner()
    
    // Verify the owner is a KeyManager by checking LSP6 interface
    const keyManagerAbi = ['function supportsInterface(bytes4 interfaceId) view returns (bool)']
    const keyManager = new Contract(owner, keyManagerAbi, provider)
    const isKeyManager = await keyManager.supportsInterface(LSP6_INTERFACE_ID).catch(() => false)
    
    return isKeyManager ? owner : null
  } catch (error) {
    console.error('Error getting KeyManager address:', error)
    return null
  }
}

/**
 * Encode a transaction to be executed through a Universal Profile
 * This properly formats the call for UP.execute() via KeyManager
 */
export function encodeUPExecute(
  targetContract: string,
  data: string,
  value: bigint = 0n,
  operation: number = 0 // 0 = CALL, 1 = CREATE, 2 = CREATE2, 3 = STATICCALL, 4 = DELEGATECALL
): string {
  const executeABI = [
    'function execute(uint256 operation, address to, uint256 value, bytes calldata data) external payable returns(bytes memory)'
  ]
  
  const iface = new ethers.Interface(executeABI)
  return iface.encodeFunctionData('execute', [operation, targetContract, value, data])
}

/**
 * Encode a batch execution for Universal Profile
 * Requires the UP to support LSP14 (Ownable2Step) with executeBatch
 */
export function encodeUPExecuteBatch(
  operations: number[],
  targets: string[],
  values: bigint[],
  datas: string[]
): string {
  const executeBatchABI = [
    'function executeBatch(uint256[] operations, address[] targets, uint256[] values, bytes[] datas) external payable returns(bytes[] memory)'
  ]
  
  const iface = new ethers.Interface(executeBatchABI)
  return iface.encodeFunctionData('executeBatch', [operations, targets, values, datas])
}

/**
 * Check if the Universal Profile extension is installed
 */
export function detectUPExtension(): boolean {
  if (typeof window === 'undefined') return false
  
  const ethereum = (window as any).ethereum
  if (!ethereum) return false

  // Check various indicators of UP extension
  return !!(
    ethereum.isUniversalProfile ||
    ethereum.isLukso ||
    (ethereum.providers?.some((p: any) => p.isUniversalProfile || p.isLukso))
  )
}

/**
 * Get the Universal Profile provider
 * Returns the UP provider if available, otherwise falls back to regular ethereum
 */
export function getUPProvider(): any {
  if (typeof window === 'undefined') return null
  
  const ethereum = (window as any).ethereum
  if (!ethereum) return null

  // If there's a UP-specific provider in the providers array, use it
  if (ethereum.providers) {
    const upProvider = ethereum.providers.find(
      (p: any) => p.isUniversalProfile || p.isLukso
    )
    if (upProvider) return upProvider
  }

  // Check if the main provider is UP
  if (ethereum.isUniversalProfile || ethereum.isLukso) {
    return ethereum
  }

  return ethereum
}

/**
 * Format a LUKSO address for display
 * Handles both UP addresses and EOA addresses
 */
export function formatLuksoAddress(address: string, profileName?: string): string {
  if (profileName) {
    return profileName
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * LUKSO Testnet chain configuration for wagmi/viem
 */
export const LUKSO_TESTNET_CONFIG = {
  id: 4201,
  name: 'LUKSO Testnet',
  network: 'lukso-testnet',
  nativeCurrency: {
    name: 'LYX',
    symbol: 'LYX',
    decimals: 18,
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

/**
 * LUKSO Mainnet chain configuration for wagmi/viem
 */
export const LUKSO_MAINNET_CONFIG = {
  id: 42,
  name: 'LUKSO Mainnet',
  network: 'lukso',
  nativeCurrency: {
    name: 'LYX',
    symbol: 'LYX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.lukso.network'],
    },
    public: {
      http: ['https://rpc.mainnet.lukso.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LUKSO Mainnet Explorer',
      url: 'https://explorer.execution.mainnet.lukso.network',
    },
  },
} as const
