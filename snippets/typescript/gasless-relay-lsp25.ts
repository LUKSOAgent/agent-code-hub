/**
 * GASLESS META-TRANSACTIONS WITH LSP25 EXECUTE RELAY CALL
 *
 * USE CASE: Let users interact with their Universal Profile without paying gas.
 *           A relayer (backend service, AI agent, or sponsor) signs and submits
 *           the transaction, covering the LYX fee on behalf of the user.
 *
 * PERFECT FOR:
 * - Onboarding new users with zero LYX balance
 * - AI agents executing automated UP operations (setting data, making calls)
 * - Scheduled/cron-based UP interactions
 * - Sponsored transactions in dApps
 *
 * HOW LSP25 WORKS:
 * 1. Build the UP calldata (setData / execute / whatever the UP should do)
 * 2. Get the controller nonce from the Key Manager (replay protection)
 * 3. Sign a hash of: (LSP25_VERSION, chainId, nonce, validityTimestamps, value, calldata)
 * 4. Submit to the Key Manager via executeRelayCall — anyone can submit
 *    (the gas payer doesn't need to be the controller)
 *
 * INSTALL:
 *   npm install viem @lukso/lsp0-contracts
 *
 * Docs: https://docs.lukso.tech/standards/access-control/lsp25-execute-relay-call
 */

import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  encodeAbiParameters,
  keccak256,
  http,
  parseAbi,
  type Hex,
  type Address,
} from "viem";
import { lukso } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { lsp0Erc725AccountAbi } from "@lukso/lsp0-contracts/abi";

// ── ABIs ───────────────────────────────────────────────────────────────────

const lsp6KeyManagerAbi = parseAbi([
  "function getNonce(address from, uint128 channelId) external view returns (uint256)",
  "function executeRelayCall(bytes signature, uint256 nonce, uint256 validityTimestamps, bytes payload) external payable returns (bytes)",
]);

// ── Types ──────────────────────────────────────────────────────────────────

interface RelayConfig {
  /** The Universal Profile to interact with */
  upAddress: Address;
  /** The Key Manager address (get via UP.owner()) */
  keyManagerAddress: Address;
  /**
   * Controller private key — the controller must have permissions for the UP call.
   * This key signs the meta-transaction but doesn't need to pay gas.
   */
  controllerKey: Hex;
  /**
   * Channel ID (0–127). Use separate channels for parallel transactions
   * to avoid nonce conflicts. Channel 0 = sequential, channels 1–127 = parallel.
   */
  channelId?: number;
}

// ── Core function ──────────────────────────────────────────────────────────

/**
 * Sign and submit a gasless relay transaction via LSP25.
 *
 * @param config           Relay configuration
 * @param upCalldata       Encoded calldata for the UP (setData, execute, etc.)
 * @param validForSeconds  How long the signature is valid (default: 1 hour)
 * @returns                Transaction hash
 */
async function executeRelayTransaction(
  config: RelayConfig,
  upCalldata: Hex,
  validForSeconds = 3600
): Promise<Hex> {
  const { upAddress, keyManagerAddress, controllerKey, channelId = 0 } = config;

  const account = privateKeyToAccount(controllerKey);
  const publicClient = createPublicClient({ chain: lukso, transport: http() });
  const walletClient = createWalletClient({ account, chain: lukso, transport: http() });

  // ── Step 1: Get the current nonce for this controller + channel ────────
  const nonce = await publicClient.readContract({
    address: keyManagerAddress,
    abi: lsp6KeyManagerAbi,
    functionName: "getNonce",
    args: [account.address, BigInt(channelId)],
  });

  console.log(`  Nonce (channel ${channelId}): ${nonce}`);

  // ── Step 2: Build validity timestamps ─────────────────────────────────
  // LSP25 packs (validAfter, validBefore) as two uint128s in a uint256
  const now = BigInt(Math.floor(Date.now() / 1000));
  const validAfter = 0n;                          // valid immediately
  const validBefore = now + BigInt(validForSeconds);
  const validityTimestamps = (validAfter << 128n) | validBefore;

  // ── Step 3: Hash the relay payload per LSP25 spec ─────────────────────
  // Hash = keccak256(abi.encode(LSP25_VERSION, chainId, nonce, validityTimestamps, value, calldata))
  const msgHash = keccak256(
    encodeAbiParameters(
      [
        { type: "uint256" }, // LSP25 version (always 25)
        { type: "uint256" }, // chain ID
        { type: "uint256" }, // nonce (from Key Manager)
        { type: "uint256" }, // validity timestamps
        { type: "uint256" }, // LYX value (0 for data-only calls)
        { type: "bytes"   }, // the UP calldata
      ],
      [25n, BigInt(lukso.id), nonce, validityTimestamps, 0n, upCalldata]
    )
  );

  // ── Step 4: Sign the hash ──────────────────────────────────────────────
  const signature = await walletClient.signMessage({ message: { raw: msgHash } });
  console.log(`  Signature: ${signature.slice(0, 20)}...`);

  // ── Step 5: Submit via executeRelayCall ───────────────────────────────
  // Any wallet can submit this — the controller doesn't pay the gas
  const txHash = await walletClient.writeContract({
    address: keyManagerAddress,
    abi: lsp6KeyManagerAbi,
    functionName: "executeRelayCall",
    args: [signature, nonce, validityTimestamps, upCalldata],
  });

  console.log(`  ✅ Relay tx: ${txHash}`);
  return txHash;
}

// ── Usage example: gasless setData on a Universal Profile ─────────────────

async function example_gaslessSetData() {
  const MY_CUSTOM_KEY = "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe" as Hex;
  const MY_VALUE = "0xdeadbeef" as Hex;

  // Encode the UP.setData call
  const setDataCalldata = encodeFunctionData({
    abi: lsp0Erc725AccountAbi,
    functionName: "setData",
    args: [MY_CUSTOM_KEY, MY_VALUE],
  });

  console.log("Submitting gasless setData...");

  await executeRelayTransaction(
    {
      upAddress:          "0xYourUniversalProfileAddress",
      keyManagerAddress:  "0xYourKeyManagerAddress",
      controllerKey:      "0xYourControllerPrivateKey",
      channelId:          0,   // sequential (safe default)
    },
    setDataCalldata,
    3600 // valid for 1 hour
  );
}

example_gaslessSetData();
