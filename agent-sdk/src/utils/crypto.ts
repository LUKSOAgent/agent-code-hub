/**
 * Cryptographic utilities for signing and verification
 */
import { ethers } from 'ethers';

/**
 * Sign data with a private key
 * @param data - Data to sign
 * @param privateKey - Private key (with or without 0x prefix)
 * @returns Signature string
 */
export function signData(data: string | object, privateKey: string): string {
  const wallet = new ethers.Wallet(normalizePrivateKey(privateKey));
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  return wallet.signMessageSync(message);
}

/**
 * Sign data asynchronously
 * @param data - Data to sign
 * @param privateKey - Private key
 * @returns Promise resolving to signature
 */
export async function signDataAsync(data: string | object, privateKey: string): Promise<string> {
  const wallet = new ethers.Wallet(normalizePrivateKey(privateKey));
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  return wallet.signMessage(message);
}

/**
 * Verify a signature
 * @param data - Original data
 * @param signature - Signature to verify
 * @param address - Expected signer address
 * @returns Whether signature is valid
 */
export function verifySignature(data: string | object, signature: string, address: string): boolean {
  try {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Recover address from signature
 * @param data - Signed data
 * @param signature - Signature
 * @returns Recovered address or null
 */
export function recoverAddress(data: string | object, signature: string): string | null {
  try {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    return ethers.verifyMessage(message, signature);
  } catch {
    return null;
  }
}

/**
 * Get address from private key
 * @param privateKey - Private key
 * @returns Address
 */
export function getAddressFromPrivateKey(privateKey: string): string {
  const wallet = new ethers.Wallet(normalizePrivateKey(privateKey));
  return wallet.address;
}

/**
 * Hash data using keccak256
 * @param data - Data to hash
 * @returns Hash
 */
export function hashData(data: string | object): string {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  return ethers.keccak256(ethers.toUtf8Bytes(message));
}

/**
 * Generate a random nonce
 * @param length - Length in bytes (default: 16)
 * @returns Hex string
 */
export function generateNonce(length: number = 16): string {
  const bytes = ethers.randomBytes(length);
  return ethers.hexlify(bytes);
}

/**
 * Create authentication challenge response
 * @param challenge - Server challenge
 * @param privateKey - Agent private key
 * @returns Signed challenge
 */
export function createAuthResponse(challenge: string, privateKey: string): string {
  const wallet = new ethers.Wallet(normalizePrivateKey(privateKey));
  const message = `Agent Code Hub Login\nChallenge: ${challenge}\nTimestamp: ${Date.now()}`;
  return wallet.signMessageSync(message);
}

/**
 * Normalize private key format
 * @param privateKey - Private key (with or without 0x prefix)
 * @returns Normalized private key with 0x prefix
 */
function normalizePrivateKey(privateKey: string): string {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }
  return privateKey;
}

/**
 * Verify message structure for WebSocket
 * @param message - Message to verify
 * @returns Whether message structure is valid
 */
export function isValidMessageStructure(message: unknown): message is { type: string; payload?: unknown } {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof (message as { type: string }).type === 'string'
  );
}

/**
 * Encrypt data (placeholder for future encryption support)
 * Currently returns base64 encoded data
 * @param data - Data to encrypt
 * @param key - Encryption key
 * @returns Encrypted data
 */
export function encryptData(data: string, key: string): string {
  // Placeholder implementation - would use proper encryption in production
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const keyBytes = encoder.encode(key);
  
  // Simple XOR for demonstration - DO NOT USE IN PRODUCTION
  const encrypted = new Uint8Array(dataBytes.length);
  for (let i = 0; i < dataBytes.length; i++) {
    encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return btoa(String.fromCharCode(...encrypted));
}

/**
 * Decrypt data (placeholder for future encryption support)
 * @param encrypted - Encrypted data
 * @param key - Decryption key
 * @returns Decrypted data
 */
export function decryptData(encrypted: string, key: string): string {
  // Placeholder implementation
  const decoder = new TextDecoder();
  const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const keyBytes = new TextEncoder().encode(key);
  
  const decrypted = new Uint8Array(encryptedBytes.length);
  for (let i = 0; i < encryptedBytes.length; i++) {
    decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return decoder.decode(decrypted);
}