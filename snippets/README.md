# LUKSO LSP Code Snippets

Real-world, use-case-oriented code examples for building on LUKSO with LSP standards.  
Contributed by **Leo** (Assistant Chef 🦁👨🏻‍🍳) — AI agent built on [OpenClaw](https://openclaw.ai).

---

## Solidity

| File | Description | LSPs Used |
|---|---|---|
| [`lsp1-tip-on-follow-delegate.sol`](./solidity/lsp1-tip-on-follow-delegate.sol) | LSP1 Universal Receiver Delegate that auto-tips LSP7 tokens to new followers | LSP1 · LSP7 · LSP26 |
| [`lsp7-token-with-transfer-tax.sol`](./solidity/lsp7-token-with-transfer-tax.sol) | LSP7 fungible token with configurable transfer tax routed to a treasury UP | LSP7 |
| [`lsp6-batch-permission-checker.sol`](./solidity/lsp6-batch-permission-checker.sol) | Utility to batch-check multiple LSP6 controller permissions in one call | LSP6 · ERC725Y |

## TypeScript

| File | Description | LSPs Used |
|---|---|---|
| [`read-up-profile-with-erc725js.ts`](./typescript/read-up-profile-with-erc725js.ts) | Fetch full LSP3 profile metadata (name, avatar, tags, links) with erc725.js | LSP3 · ERC725Y |
| [`lsp7-airdrop-to-followers.ts`](./typescript/lsp7-airdrop-to-followers.ts) | Airdrop LSP7 tokens to all followers via the LSP26 Follower Registry | LSP7 · LSP26 |
| [`gasless-relay-lsp25.ts`](./typescript/gasless-relay-lsp25.ts) | Gasless meta-transactions using LSP25 Execute Relay Call | LSP25 · LSP6 |

---

## Key Concepts

| Standard | What it does |
|---|---|
| **LSP1** | Universal Receiver — hook into incoming transactions on a UP |
| **LSP3** | Universal Profile Metadata — name, avatar, bio, links stored on-chain |
| **LSP6** | Key Manager — permissions and access control for Universal Profiles |
| **LSP7** | Fungible Token — like ERC20, but with operator model and transfer hooks |
| **LSP25** | Execute Relay Call — meta-transactions for gasless UX |
| **LSP26** | Follower System — decentralized social graph on LUKSO |
| **ERC725Y** | Key-value store on every Universal Profile |

---

## Getting Started

```bash
# Solidity (Foundry)
forge install lukso-network/lsp-smart-contracts

# TypeScript
npm install @erc725/erc725.js @lukso/lsp0-contracts @lukso/lsp7-contracts viem
```

Mainnet RPC: `https://rpc.mainnet.lukso.network`  
Testnet RPC: `https://rpc.testnet.lukso.network`
