/**
 * LSP7 TOKEN AIRDROP TO ALL FOLLOWERS
 *
 * USE CASE: Reward your entire follower base with an LSP7 token airdrop
 *           in a single batched transaction via your Universal Profile.
 *           Perfect for community rewards, loyalty programs, or launch events.
 *
 * HOW IT WORKS:
 * 1. Paginate through the LSP26 Follower Registry to get all your followers
 * 2. Build an LSP7 transferBatch call (many recipients, one transaction)
 * 3. Execute the batch via your Universal Profile
 *
 * REQUIREMENTS:
 * - Controller private key with CALL permission on your UP
 * - UP must hold enough LSP7 tokens: followers × amountPerFollower
 *
 * INSTALL:
 *   npm install viem @lukso/lsp0-contracts @lukso/lsp7-contracts
 *
 * Docs: https://docs.lukso.tech/standards/social/lsp26-follower-system
 *       https://docs.lukso.tech/standards/tokens/lsp7-digital-asset
 */

import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  parseAbi,
  type Address,
  type Hex,
} from "viem";
import { lukso } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { lsp0Erc725AccountAbi } from "@lukso/lsp0-contracts/abi";
import { lsp7DigitalAssetAbi } from "@lukso/lsp7-contracts/abi";

// ── Constants ──────────────────────────────────────────────────────────────

const LSP26_FOLLOWER_REGISTRY: Address = "0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA";
const LSP26_ABI = parseAbi([
  "function followerCount(address addr) external view returns (uint256)",
  "function getFollowersByIndex(address addr, uint256 startIndex, uint256 endIndex) external view returns (address[])",
]);

const PAGE_SIZE = 100n; // fetch 100 followers per RPC call

// ── Types ──────────────────────────────────────────────────────────────────

interface AirdropConfig {
  /** Your Universal Profile address */
  upAddress: Address;
  /** Controller private key (must have CALL permission on the UP) */
  privateKey: Hex;
  /** LSP7 token contract to distribute */
  tokenAddress: Address;
  /** Amount to send per follower, in token units (18 decimals) */
  amountPerFollower: bigint;
  /**
   * force = true  → send to any address (including EOAs)
   * force = false → only send to Universal Profiles (recommended)
   */
  force: boolean;
}

// ── Core ───────────────────────────────────────────────────────────────────

/**
 * Airdrop LSP7 tokens to all followers of a Universal Profile.
 *
 * Uses a single transferBatch call for efficiency — one transaction regardless
 * of follower count (up to EVM block gas limits, ~500–1000 recipients).
 * For very large follower bases, split into batches of 200–300.
 */
async function airdropToFollowers(config: AirdropConfig): Promise<void> {
  const { upAddress, privateKey, tokenAddress, amountPerFollower, force } = config;

  const account = privateKeyToAccount(privateKey);

  const publicClient = createPublicClient({ chain: lukso, transport: http() });
  const walletClient = createWalletClient({ account, chain: lukso, transport: http() });

  // ── Step 1: Fetch all followers ────────────────────────────────────────
  const followerCount = await publicClient.readContract({
    address: LSP26_FOLLOWER_REGISTRY,
    abi: LSP26_ABI,
    functionName: "followerCount",
    args: [upAddress],
  });

  console.log(`📊 Follower count: ${followerCount}`);
  if (followerCount === 0n) {
    console.log("No followers to airdrop to.");
    return;
  }

  const followers: Address[] = [];

  for (let start = 0n; start < followerCount; start += PAGE_SIZE) {
    const end = start + PAGE_SIZE < followerCount ? start + PAGE_SIZE : followerCount;
    const page = await publicClient.readContract({
      address: LSP26_FOLLOWER_REGISTRY,
      abi: LSP26_ABI,
      functionName: "getFollowersByIndex",
      args: [upAddress, start, end],
    });
    followers.push(...(page as Address[]));
    console.log(`  Fetched ${followers.length} / ${followerCount} followers`);
  }

  // ── Step 2: Encode LSP7 transferBatch ─────────────────────────────────
  const batchTransferCalldata = encodeFunctionData({
    abi: lsp7DigitalAssetAbi,
    functionName: "transferBatch",
    args: [
      Array(followers.length).fill(upAddress),        // from: always the UP
      followers,                                        // to: each follower
      Array(followers.length).fill(amountPerFollower), // amount per recipient
      Array(followers.length).fill(force),             // force flag
      Array(followers.length).fill("0x" as Hex),       // extra data (empty)
    ],
  });

  // ── Step 3: Execute via Universal Profile ─────────────────────────────
  const totalTokens = amountPerFollower * BigInt(followers.length);
  console.log(`\n🚀 Sending airdrop:`);
  console.log(`   Recipients:  ${followers.length}`);
  console.log(`   Per wallet:  ${amountPerFollower / 10n ** 18n} tokens`);
  console.log(`   Total:       ${totalTokens / 10n ** 18n} tokens`);

  const txHash = await walletClient.writeContract({
    address: upAddress,
    abi: lsp0Erc725AccountAbi,
    functionName: "execute",
    args: [
      0n,                   // CALL operation
      tokenAddress,         // to: the LSP7 token contract
      0n,                   // value: no LYX sent
      batchTransferCalldata,
    ],
  });

  console.log(`\n✅ Airdrop complete!`);
  console.log(`   TX hash: ${txHash}`);
}

// ── Usage ──────────────────────────────────────────────────────────────────

airdropToFollowers({
  upAddress:         "0xYourUniversalProfileAddress",
  privateKey:        "0xYourControllerPrivateKey",
  tokenAddress:      "0xYourLSP7TokenAddress",
  amountPerFollower: 100n * 10n ** 18n,  // 100 tokens per follower
  force:             false,              // only send to Universal Profiles
});
