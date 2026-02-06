import { ethers, BrowserProvider, Contract, Interface } from 'ethers';
import { Hex, PublicClient } from 'viem';

// Interface IDs for detecting Universal Profile capabilities
export const LSP0_INTERFACE_ID = '0x24871b3a' // LSP0ERC725Account
export const LSP6_INTERFACE_ID = '0x6f4df48b' // LSP6KeyManager
export const LSP17Extendable_INTERFACE_ID = '0xc245d565' // LSP17Extendable
export const ERC725X_INTERFACE_ID = '0x7545acac'
export const ERC725Y_INTERFACE_ID = '0x629aa694'

// LSP3 Profile data keys
export const LSP3_PROFILE_KEY = '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5';
export const LSP3_ISSUED_ASSETS_KEY = '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0';
export const LSP3_RECEIVED_ASSETS_KEY = '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b';

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
  CALL: '0x0000000000000000000000000000000000000000000000000000000000000400',
  STATICCALL: '0x0000000000000000000000000000000000000000000000000000000000001000',
  DELEGATECALL: '0x0000000000000000000000000000000000000000000000000000000000004000',
  DEPLOY: '0x0000000000000000000000000000000000000000000000000000000000008000',
  SUPER_SETDATA: '0x0000000000000000000000000000000000000000000000000000000000010000',
  SETDATA: '0x0000000000000000000000000000000000000000000000000000000000020000',
  ENCRYPT: '0x0000000000000000000000000000000000000000000000000000000000040000',
  DECRYPT: '0x0000000000000000000000000000000000000000000000000000000000080000',
  SIGN: '0x0000000000000000000000000000000000000000000000000000000000100000',
} as const;

// ERC725Y data keys for common LSPs
export const LSPDataKeys = {
  // Profile metadata
  LSP3Profile: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
  // Issued assets
  LSP12IssuedAssets: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
  // Received assets
  LSP5ReceivedAssets: '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
  // Permissions
  LSP6PermissionsPrefix: '0x4b80742d0000000082ac0000',
} as const;

export interface UPProfileData {
  name?: string;
  description?: string;
  profileImage?: { url: string; width: number; height: number }[];
  backgroundImage?: { url: string; width: number; height: number }[];
  tags?: string[];
  links?: Array<{ title: string; url: string }>;
}

/**
 * Check if an address is a Universal Profile by verifying interface support
 */
export async function isUniversalProfile(address: string, provider: BrowserProvider): Promise<boolean> {
  try {
    const code = await provider.getCode(address);
    
    if (!code || code === '0x') {
      return false;
    }

    const abi = ['function supportsInterface(bytes4 interfaceId) view returns (bool)'];
    const contract = new Contract(address, abi, provider);

    const [supportsLSP0, supportsERC725X, supportsERC725Y] = await Promise.all([
      contract.supportsInterface(LSP0_INTERFACE_ID).catch(() => false),
      contract.supportsInterface(ERC725X_INTERFACE_ID).catch(() => false),
      contract.supportsInterface(ERC725Y_INTERFACE_ID).catch(() => false),
    ]);

    return supportsLSP0 || (supportsERC725X && supportsERC725Y);
  } catch (error) {
    console.error('Error checking if address is UP:', error);
    return false;
  }
}

/**
 * Check if an address is a Universal Profile using viem
 */
export async function isUniversalProfileViem(
  address: Hex, 
  publicClient: PublicClient
): Promise<boolean> {
  try {
    const code = await publicClient.getCode({ address });
    
    if (!code || code === '0x') {
      return false;
    }

    const abi = [{ 
      type: 'function' as const, 
      name: 'supportsInterface', 
      inputs: [{ type: 'bytes4' as const, name: 'interfaceId' }], 
      outputs: [{ type: 'bool' as const }], 
      stateMutability: 'view' as const 
    }];

    const [supportsLSP0, supportsERC725X, supportsERC725Y] = await Promise.all([
      publicClient.readContract({
        address,
        abi,
        functionName: 'supportsInterface',
        args: [LSP0_INTERFACE_ID as Hex],
      }).catch(() => false),
      publicClient.readContract({
        address,
        abi,
        functionName: 'supportsInterface',
        args: [ERC725X_INTERFACE_ID as Hex],
      }).catch(() => false),
      publicClient.readContract({
        address,
        abi,
        functionName: 'supportsInterface',
        args: [ERC725Y_INTERFACE_ID as Hex],
      }).catch(() => false),
    ]);

    return supportsLSP0 || (supportsERC725X && supportsERC725Y);
  } catch (error) {
    console.error('Error checking if address is UP:', error);
    return false;
  }
}

/**
 * Get the KeyManager address for a Universal Profile
 */
export async function getKeyManagerAddress(
  upAddress: string, 
  provider: BrowserProvider
): Promise<string | null> {
  try {
    const abi = ['function owner() view returns (address)'];
    const contract = new Contract(upAddress, abi, provider);
    const owner = await contract.owner();
    
    const keyManagerAbi = ['function supportsInterface(bytes4 interfaceId) view returns (bool)'];
    const keyManager = new Contract(owner, keyManagerAbi, provider);
    const isKeyManager = await keyManager.supportsInterface(LSP6_INTERFACE_ID).catch(() => false);
    
    return isKeyManager ? owner : null;
  } catch (error) {
    console.error('Error getting KeyManager address:', error);
    return null;
  }
}

/**
 * Get the KeyManager address using viem
 */
export async function getKeyManagerAddressViem(
  upAddress: Hex,
  publicClient: PublicClient
): Promise<Hex | null> {
  try {
    const ownerAbi = [{ 
      type: 'function' as const, 
      name: 'owner', 
      inputs: [], 
      outputs: [{ type: 'address' as const }], 
      stateMutability: 'view' as const 
    }];
    
    const owner = await publicClient.readContract({
      address: upAddress,
      abi: ownerAbi,
      functionName: 'owner',
    });
    
    const keyManagerAbi = [{ 
      type: 'function' as const, 
      name: 'supportsInterface', 
      inputs: [{ type: 'bytes4' as const, name: 'interfaceId' }], 
      outputs: [{ type: 'bool' as const }], 
      stateMutability: 'view' as const 
    }];
    
    const isKeyManager = await publicClient.readContract({
      address: owner,
      abi: keyManagerAbi,
      functionName: 'supportsInterface',
      args: [LSP6_INTERFACE_ID as Hex],
    }).catch(() => false);
    
    return isKeyManager ? owner : null;
  } catch (error) {
    console.error('Error getting KeyManager address:', error);
    return null;
  }
}

/**
 * Fetch LSP3 profile data from a Universal Profile
 */
export async function fetchLSP3Profile(
  upAddress: string,
  provider: BrowserProvider
): Promise<UPProfileData | null> {
  try {
    const abi = ['function getData(bytes32 dataKey) view returns (bytes)'];
    const contract = new Contract(upAddress, abi, provider);
    
    const profileData = await contract.getData(LSP3_PROFILE_KEY);
    
    if (!profileData || profileData === '0x') {
      return null;
    }

    // Decode the profile data (it's typically JSON URL encoded)
    // This is a simplified version - real implementation would decode VerifiableURI
    return decodeLSP3ProfileData(profileData);
  } catch (error) {
    console.error('Error fetching LSP3 profile:', error);
    return null;
  }
}

/**
 * Decode LSP3 profile data from bytes
 * Note: This is a simplified decoder. Real implementation should handle VerifiableURI properly
 */
function decodeLSP3ProfileData(data: string): UPProfileData | null {
  try {
    // Remove the 0x prefix and VerifiableURI prefix if present
    // VerifiableURI format: 0x6f357c6a...<hash_function><data_length><data>
    const cleanData = data.replace(/^0x/, '');
    
    // Try to decode as JSON
    // This is simplified - production code needs proper VerifiableURI decoding
    const decoded = ethers.toUtf8String('0x' + cleanData.slice(128));
    const parsed = JSON.parse(decoded);
    
    return {
      name: parsed.LSP3Profile?.name,
      description: parsed.LSP3Profile?.description,
      profileImage: parsed.LSP3Profile?.profileImage,
      backgroundImage: parsed.LSP3Profile?.backgroundImage,
      tags: parsed.LSP3Profile?.tags,
      links: parsed.LSP3Profile?.links,
    };
  } catch (error) {
    console.error('Error decoding LSP3 profile data:', error);
    return null;
  }
}

/**
 * Encode a transaction to be executed through a Universal Profile
 */
export function encodeUPExecute(
  targetContract: string,
  data: string,
  value: bigint = 0n,
  operation: number = 0 // 0 = CALL, 1 = CREATE, 2 = CREATE2, 3 = STATICCALL, 4 = DELEGATECALL
): string {
  const executeABI = [
    'function execute(uint256 operation, address to, uint256 value, bytes calldata data) external payable returns(bytes memory)'
  ];
  
  const iface = new Interface(executeABI);
  return iface.encodeFunctionData('execute', [operation, targetContract, value, data]);
}

/**
 * Encode a batch execution for Universal Profile
 */
export function encodeUPExecuteBatch(
  operations: number[],
  targets: string[],
  values: bigint[],
  datas: string[]
): string {
  const executeBatchABI = [
    'function executeBatch(uint256[] operations, address[] targets, uint256[] values, bytes[] datas) external payable returns(bytes[] memory)'
  ];
  
  const iface = new Interface(executeBatchABI);
  return iface.encodeFunctionData('executeBatch', [operations, targets, values, datas]);
}

/**
 * Check if the Universal Profile extension is installed
 */
export function detectUPExtension(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return false;

  return !!(
    ethereum.isUniversalProfile ||
    ethereum.isLukso ||
    (ethereum.providers?.some((p: any) => p.isUniversalProfile || p.isLukso))
  );
}

/**
 * Get the Universal Profile provider
 * Returns the UP provider if available, otherwise falls back to regular ethereum
 */
export function getUPProvider(): any {
  if (typeof window === 'undefined') return null;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;

  if (ethereum.providers) {
    const upProvider = ethereum.providers.find(
      (p: any) => p.isUniversalProfile || p.isLukso
    );
    if (upProvider) return upProvider;
  }

  if (ethereum.isUniversalProfile || ethereum.isLukso) {
    return ethereum;
  }

  return ethereum;
}

/**
 * Format a LUKSO address for display
 */
export function formatLuksoAddress(address: string, profileName?: string): string {
  if (profileName) {
    return profileName;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get LUKSO explorer URL for an address
 */
export function getLuksoExplorerUrl(address: string, isTestnet: boolean = true): string {
  const baseUrl = isTestnet 
    ? 'https://explorer.execution.testnet.lukso.network'
    : 'https://explorer.execution.mainnet.lukso.network';
  return `${baseUrl}/address/${address}`;
}

/**
 * Get LUKSO explorer URL for a transaction
 */
export function getLuksoTxExplorerUrl(txHash: string, isTestnet: boolean = true): string {
  const baseUrl = isTestnet 
    ? 'https://explorer.execution.testnet.lukso.network'
    : 'https://explorer.execution.mainnet.lukso.network';
  return `${baseUrl}/tx/${txHash}`;
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
} as const;

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
} as const;

/**
 * Validate a LUKSO address
 */
export function isValidLuksoAddress(address: string): boolean {
  if (!address) return false;
  
  // Check basic format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }
  
  return true;
}

/**
 * Encode ERC725Y data key
 */
export function encodeERC725YKey(key: string): string {
  // Keys are typically 32 bytes (64 hex chars)
  if (key.startsWith('0x')) {
    return key.toLowerCase().padEnd(66, '0');
  }
  return '0x' + key.toLowerCase().padEnd(64, '0');
}

/**
 * Decode permissions from LSP6
 */
export function decodeLSP6Permissions(permissionValue: string): string[] {
  const permissions: string[] = [];
  const value = BigInt(permissionValue);
  
  const permissionBits: Record<string, string> = {
    '0': 'CHANGEOWNER',
    '1': 'ADDCONTROLLER',
    '2': 'EDITPERMISSIONS',
    '3': 'ADDEXTENSIONS',
    '4': 'CHANGEEXTENSIONS',
    '5': 'ADDUNIVERSALRECEIVERDELEGATE',
    '6': 'CHANGEUNIVERSALRECEIVERDELEGATE',
    '7': 'REENTRANCY',
    '8': 'SUPER_TRANSFERVALUE',
    '256': 'TRANSFERVALUE',
    '512': 'SUPER_CALL',
    '1024': 'CALL',
    '2048': 'SUPER_STATICCALL',
    '4096': 'STATICCALL',
    '8192': 'SUPER_DELEGATECALL',
    '16384': 'DELEGATECALL',
    '32768': 'DEPLOY',
    '65536': 'SUPER_SETDATA',
    '131072': 'SETDATA',
    '262144': 'ENCRYPT',
    '524288': 'DECRYPT',
    '1048576': 'SIGN',
  };
  
  for (const [bit, name] of Object.entries(permissionBits)) {
    if ((value & (1n << BigInt(bit))) !== 0n) {
      permissions.push(name);
    }
  }
  
  return permissions;
}
