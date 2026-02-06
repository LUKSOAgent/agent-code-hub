# LUKSO Universal Profile Integration

This frontend now fully supports LUKSO Universal Profiles (UP) with proper KeyManager integration.

## Features

- ✅ Universal Profile detection and connection
- ✅ Multi-wallet support via RainbowKit (UP, MetaMask, WalletConnect, etc.)
- ✅ Proper transaction execution through UP.execute() via KeyManager
- ✅ LSP3 profile data fetching (name, description, images)
- ✅ Batch transaction support for UPs
- ✅ LUKSO Testnet chain configuration

## Installation

```bash
npm install
```

This will install:
- `@lukso/lsp-factory.js` - For UP creation and management
- `@lukso/lsp-smart-contracts` - Contract ABIs and utilities
- `@lukso/up-provider` - Universal Profile provider utilities
- `@rainbow-me/rainbowkit` - Multi-wallet connection UI
- `wagmi` - Ethereum React hooks
- `viem` - Ethereum JavaScript library

## Usage

### Connecting Wallet

The app uses RainbowKit's `ConnectButton` which automatically detects:
- Universal Profile Browser Extension
- MetaMask
- WalletConnect-compatible wallets

```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit'

<ConnectButton />
```

### Using Universal Profile Hooks

```tsx
import { useUniversalProfile, useCodeRegistry, useUPTransaction } from './hooks/useLukso'

// Detect UP and fetch profile data
const { upAddress, isUP, upProfile, isConnected } = useUniversalProfile()

// Register code through UP or EOA
const { registerCode } = useCodeRegistry()
const txHash = await registerCode(ipfsHash, name, description, tags, language, version)

// Execute custom transactions through UP
const { executeThroughUP } = useUPTransaction()
const txHash = await executeThroughUP(
  contractAddress,
  contractABI,
  'functionName',
  [arg1, arg2]
)
```

### Transaction Flow

When connected via UP:
1. Transaction is encoded for the target contract
2. Wrapped in `UP.execute(operation, to, value, data)` call
3. Sent to the UP address
4. UP forwards to KeyManager for permission verification
5. KeyManager executes if controller has permission

When connected via EOA (MetaMask):
1. Transaction is sent directly to target contract
2. Works exactly like standard Web3 interactions

## Contract Addresses (LUKSO Testnet)

- **CodeRegistry**: `0xF07CCA0d521B1ccE1f6b71879d37ef9ab45BF758`
- **CodeAttribution**: `0xEf4C853f8521fcf475CcF1Cc29D17A9b979e3eC7`
- **ReputationToken**: `0xbACc1604b99Bf988d4F5A429a717FfCEb44Bc0F5`

## Testing with Universal Profile

1. Install [Universal Profile Browser Extension](https://docs.lukso.tech/guides/browser-extension/install-browser-extension)
2. Create a Universal Profile on [UniversalProfile.cloud](https://universalprofile.cloud) (Testnet)
3. Fund with Testnet LYX from [LUKSO Testnet Faucet](https://faucet.testnet.lukso.network)
4. Open the app and click "Connect"
5. Select "Universal Profile" from the wallet options
6. Approve the connection in the UP extension

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  RainbowKit      │────▶│  Wagmi/Viem     │
│                 │     │  Wallet Selector │     │  Web3 Provider  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                               │
         │                                               ▼
         │                                        ┌─────────────────┐
         │                                        │  Browser Wallet │
         │                                        │  (MetaMask/UP)  │
         │                                        └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│  useLukso Hooks │                           │  LUKSO Testnet  │
│                 │                           │  Contracts      │
│  - useUniversalProfile                      │                 │
│  - useUPTransaction                         │  - CodeRegistry │
│  - useCodeRegistry                          │  - Attribution  │
│  - useCodeAttribution                       │  - Reputation   │
│  - useReputationToken                       │                 │
└─────────────────┘                           └─────────────────┘
```

## UP Detection Logic

The app detects Universal Profiles by:

1. Checking if the connected address has code (is a smart contract)
2. Calling `supportsInterface()` for:
   - `0x24871b3a` (LSP0ERC725Account)
   - `0x7545acac` (ERC725X)
   - `0x629aa694` (ERC725Y)
3. If any interface is supported, the address is treated as a UP

## KeyManager Permissions

For transactions to succeed through a UP:
- The controller (signer) must have appropriate permissions in the KeyManager
- Required permissions for this app:
  - `CALL` (0x0000000000000000000000000000000000000000000000000000000000000400)
  - `TRANSFERVALUE` (0x0000000000000000000000000000000000000000000000000000000000000100)

## Troubleshooting

### "No KeyManager found for UP"
- Ensure your UP was deployed with a KeyManager
- Check that the controller has the required permissions

### "Failed to execute transaction"
- Verify you have enough LYX for gas
- Check that the controller has CALL permission in KeyManager
- Ensure the UP contract is not paused or locked

### "Profile data not loading"
- LSP3 profile data is fetched from IPFS
- Check your internet connection
- The profile may not have LSP3 metadata set

## Resources

- [LUKSO Documentation](https://docs.lukso.tech)
- [Universal Profile Docs](https://docs.lukso.tech/standards/universal-profile/introduction)
- [LSP Standards](https://docs.lukso.tech/standards/introduction)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)
- [Wagmi Docs](https://wagmi.sh)
