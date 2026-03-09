import { CodeSnippet } from '../types'

// In-memory store for code snippets (mock database)
class CodeStore {
  private snippets: Map<string, CodeSnippet> = new Map()
  private idCounter = 1

  constructor() {
    // Initialize with featured snippets
    this.initializeFeaturedSnippets()
  }

  private initializeFeaturedSnippets() {
    const featuredSnippets: CodeSnippet[] = [
      {
        id: '1',
        title: 'LSP7 Digital Asset (Token)',
        description: 'LUKSO LSP7 token with metadata and transfer hooks for Universal Profiles.',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {LSP7DigitalAsset} from "@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol";

contract MyToken is LSP7DigitalAsset {
    constructor()
        LSP7DigitalAsset("My LSP7 Token", "ML7", msg.sender, false)
    {
        _mint(msg.sender, 1000000 * 10**decimals(), true, "");
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) internal override {
        // Custom logic before transfers
        super._beforeTokenTransfer(from, to, amount, data);
    }
}`,
        language: 'solidity',
        author: 'lukso_builder',
        authorAddress: '0x293E96ebbf264ed7715cff2b67850517De70232a',
        timestamp: Date.now() - 86400000,
        tags: ['lsp7', 'token', 'lukso'],
        likes: 128,
        forks: 45,
        isVerified: true,
        ipfsHash: 'QmXyz123LSP7Example'
      },
      {
        id: '2',
        title: 'LSP8 Identifiable Digital Asset (NFT)',
        description: 'LUKSO LSP8 NFT with unique token IDs and metadata for each asset.',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {LSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import {_LSP8_TOKENID_TYPE_HASH} from "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";

contract MyNFT is LSP8IdentifiableDigitalAsset {
    uint256 private _tokenIdCounter;
    
    constructor()
        LSP8IdentifiableDigitalAsset(
            "My LSP8 NFT", 
            "MNFT", 
            msg.sender,
            _LSP8_TOKENID_TYPE_HASH
        )
    {}
    
    function mint(address to, bytes32 tokenId) external {
        _mint(to, tokenId, true, "");
    }
}`,
        language: 'solidity',
        author: 'nft_creator',
        authorAddress: '0x8FFEf1a5E7b8cd612B49decABBf255c43F499f83',
        timestamp: Date.now() - 172800000,
        tags: ['lsp8', 'nft', 'lukso'],
        likes: 89,
        forks: 32,
        isVerified: true,
        ipfsHash: 'QmXyz123LSP8Example'
      },
      {
        id: '3',
        title: 'LSP26 Follower System',
        description: 'Universal Profile following system using LSP26 standard for social graphs.',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ILSP26FollowerSystem} from "@lukso/lsp26-contracts/contracts/ILSP26FollowerSystem.sol";

contract FollowSystem is ILSP26FollowerSystem {
    mapping(address => mapping(address => bool)) public following;
    mapping(address => address[]) public followers;
    
    event Follow(address indexed follower, address indexed target);
    event Unfollow(address indexed follower, address indexed target);
    
    function follow(address target) external {
        require(!following[msg.sender][target], "Already following");
        following[msg.sender][target] = true;
        followers[target].push(msg.sender);
        emit Follow(msg.sender, target);
    }
    
    function unfollow(address target) external {
        require(following[msg.sender][target], "Not following");
        following[msg.sender][target] = false;
        emit Unfollow(msg.sender, target);
    }
}`,
        language: 'solidity',
        author: 'social_builder',
        authorAddress: '0x7A94a84ed42eaa849Df11EBd0AFfd91e23F63eB0',
        timestamp: Date.now() - 259200000,
        tags: ['lsp26', 'social', 'lukso'],
        likes: 156,
        forks: 67,
        isVerified: true,
        ipfsHash: 'QmXyz123LSP26Example'
      }
    ]

    const leoSnippets: CodeSnippet[] = [
      {
        id: '4',
        title: 'LSP1 Tip-on-Follow Delegate',
        description: 'LSP1 Universal Receiver Delegate that automatically tips LSP7 tokens to every new follower. Zero user interaction needed after setup — the UP handles it via the LSP26 follow notification.',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ILSP1UniversalReceiver} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";
import {ILSP7DigitalAsset} from "@lukso/lsp7-contracts/contracts/ILSP7DigitalAsset.sol";

/// @dev LSP26 follow notification typeId
bytes32 constant _TYPEID_LSP26_FOLLOW =
    0x71e02f9f05bcd5816ec4f3134aa2e5a916669537000000000000000000000000;

/// @dev LSP26 Follower Registry on LUKSO Mainnet
address constant LSP26_FOLLOWER_REGISTRY = 0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA;

/**
 * @title TipOnFollowDelegate
 * @notice Auto-tip LSP7 tokens to every new follower via LSP1.
 *
 * SETUP on your Universal Profile:
 * 1. Set LSP1UniversalReceiverDelegate:<followTypeId> = address(this)
 * 2. Authorize this contract as LSP7 operator for your tip budget
 */
contract TipOnFollowDelegate is ILSP1UniversalReceiver {
    ILSP7DigitalAsset public immutable tipToken;
    uint256 public immutable tipAmount;

    event TipSent(address indexed universalProfile, address indexed follower, uint256 amount);
    event TipFailed(address indexed universalProfile, address indexed follower, string reason);

    constructor(address _tipToken, uint256 _tipAmount) {
        tipToken = ILSP7DigitalAsset(_tipToken);
        tipAmount = _tipAmount;
    }

    function universalReceiver(
        bytes32 typeId,
        bytes calldata data
    ) external override returns (bytes memory) {
        if (typeId != _TYPEID_LSP26_FOLLOW) return "";
        if (msg.sender != LSP26_FOLLOWER_REGISTRY) return "";
        if (data.length < 20) return "";

        address follower = address(bytes20(data[data.length - 20:]));
        address universalProfile = tx.origin;

        try tipToken.transfer(universalProfile, follower, tipAmount, true, "") {
            emit TipSent(universalProfile, follower, tipAmount);
        } catch Error(string memory reason) {
            emit TipFailed(universalProfile, follower, reason);
        } catch {
            emit TipFailed(universalProfile, follower, "unknown error");
        }

        return "";
    }
}`,
        language: 'solidity',
        author: 'leo_assistant_chef',
        authorAddress: '0x0000000000000000000000000000000000000Leo',
        timestamp: Date.now() - 3600000,
        tags: ['lsp1', 'lsp7', 'lsp26', 'follow', 'delegate', 'lukso'],
        likes: 0,
        forks: 0,
        isVerified: true,
        ipfsHash: 'QmLeoTipOnFollow'
      },
      {
        id: '5',
        title: 'LSP7 Token with Transfer Tax',
        description: 'LSP7 fungible token with configurable basis-point fee on every transfer, automatically routed to a treasury Universal Profile. Perfect for protocol revenue and DAO funding.',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {LSP7DigitalAsset} from "@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol";

/**
 * @title TaxedLSP7Token
 * @notice LSP7 token with a configurable transfer tax routed to treasury.
 *
 * Tax rate in basis points: 100 = 1%, 250 = 2.5% (max: 1000 = 10%)
 * Treasury can be any Universal Profile address.
 */
contract TaxedLSP7Token is LSP7DigitalAsset {
    address public treasury;
    uint256 public taxBasisPoints;

    event TaxCollected(address indexed from, address indexed to, uint256 taxAmount);

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        address treasury_,
        uint256 taxBasisPoints_,
        uint256 initialSupply_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, 0, false) {
        require(taxBasisPoints_ <= 1000, "TaxedLSP7: max 10%");
        treasury = treasury_;
        taxBasisPoints = taxBasisPoints_;
        if (initialSupply_ > 0) _mint(newOwner_, initialSupply_, true, "");
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal override {
        super._beforeTokenTransfer(operator, from, to, amount, force, data);

        // Skip tax on mint, burn, or treasury-involved transfers
        if (from == address(0) || to == address(0)) return;
        if (from == treasury || to == treasury) return;

        uint256 taxAmount = (amount * taxBasisPoints) / 10_000;
        if (taxAmount == 0) return;

        _transfer(from, treasury, taxAmount, true, "");
        emit TaxCollected(from, to, taxAmount);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
    }

    function setTaxRate(uint256 newBasisPoints) external onlyOwner {
        require(newBasisPoints <= 1000, "TaxedLSP7: max 10%");
        taxBasisPoints = newBasisPoints;
    }
}`,
        language: 'solidity',
        author: 'leo_assistant_chef',
        authorAddress: '0x0000000000000000000000000000000000000Leo',
        timestamp: Date.now() - 3600000,
        tags: ['lsp7', 'token', 'tax', 'treasury', 'defi', 'lukso'],
        likes: 0,
        forks: 0,
        isVerified: true,
        ipfsHash: 'QmLeoTaxedLSP7'
      },
      {
        id: '6',
        title: 'LSP6 Batch Permission Checker',
        description: 'Utility contract to verify LSP6 controller permissions on a Universal Profile in a single batched call. Use for pre-flight checks in dApps before executing privileged actions.',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

/**
 * @title LSP6BatchPermissionChecker
 * @notice Validate LSP6 permissions for multiple controllers in one getDataBatch call.
 *
 * USE CASE: Pre-flight check before privileged dApp actions.
 * Instead of failing mid-transaction, verify permissions upfront.
 */
contract LSP6BatchPermissionChecker {
    bytes10 constant _PERMISSIONS_KEY_PREFIX = 0x4b80742de2bf82acb3630000;

    /// @notice Check if a controller has ALL required permissions on a UP.
    function checkPermissions(
        address universalProfile,
        address controller,
        bytes32 requiredPermissions
    ) external view returns (bool hasAll, bytes32 missing) {
        bytes32 key = _buildPermissionsKey(controller);
        bytes memory raw = IERC725Y(universalProfile).getData(key);
        if (raw.length == 0) return (false, requiredPermissions);

        bytes32 granted = abi.decode(raw, (bytes32));
        missing = requiredPermissions ^ (granted & requiredPermissions);
        hasAll = (missing == bytes32(0));
    }

    /// @notice Batch check permissions for multiple controllers at once.
    function batchCheckPermissions(
        address universalProfile,
        address[] calldata controllers,
        bytes32 requiredPerms
    ) external view returns (bool[] memory results) {
        uint256 count = controllers.length;
        results = new bool[](count);

        bytes32[] memory keys = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            keys[i] = _buildPermissionsKey(controllers[i]);
        }

        bytes[] memory rawValues = IERC725Y(universalProfile).getDataBatch(keys);
        for (uint256 i = 0; i < count; i++) {
            if (rawValues[i].length == 0) continue;
            bytes32 granted = abi.decode(rawValues[i], (bytes32));
            results[i] = (granted & requiredPerms) == requiredPerms;
        }
    }

    function _buildPermissionsKey(address controller) internal pure returns (bytes32) {
        return bytes32(abi.encodePacked(_PERMISSIONS_KEY_PREFIX, controller));
    }
}`,
        language: 'solidity',
        author: 'leo_assistant_chef',
        authorAddress: '0x0000000000000000000000000000000000000Leo',
        timestamp: Date.now() - 3600000,
        tags: ['lsp6', 'permissions', 'erc725y', 'utility', 'lukso'],
        likes: 0,
        forks: 0,
        isVerified: true,
        ipfsHash: 'QmLeoLSP6BatchChecker'
      },
      {
        id: '7',
        title: 'Read Universal Profile with erc725.js',
        description: 'Fetch a full LSP3 profile (name, avatar, bio, tags, links) from any Universal Profile address. erc725.js handles ABI-decoding and IPFS resolution automatically.',
        code: `import ERC725, { ERC725JSONSchema } from "@erc725/erc725.js";
import LSP3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";

const LUKSO_RPC = "https://rpc.mainnet.lukso.network";
const IPFS_GATEWAY = "https://api.universalprofile.cloud/ipfs/";

interface UniversalProfileData {
  address: string;
  name: string;
  description: string;
  avatar?: string;
  backgroundImage?: string;
  tags: string[];
  links: Array<{ title: string; url: string }>;
}

async function fetchUniversalProfile(upAddress: string): Promise<UniversalProfileData | null> {
  const erc725 = new ERC725(
    LSP3ProfileSchema as ERC725JSONSchema[],
    upAddress,
    LUKSO_RPC,
    { ipfsGateway: IPFS_GATEWAY }
  );

  // fetchData resolves the IPFS URI and decodes the LSP3 JSON automatically
  const profileData = await erc725.fetchData("LSP3Profile");
  if (!profileData?.value) return null;

  const profile = (profileData.value as any).LSP3Profile;
  const resolveIpfs = (url?: string) =>
    url ? url.replace("ipfs://", IPFS_GATEWAY) : undefined;

  return {
    address: upAddress,
    name: profile.name ?? "Unknown",
    description: profile.description ?? "",
    avatar: resolveIpfs(profile.profileImage?.[0]?.url),
    backgroundImage: resolveIpfs(profile.backgroundImage?.[0]?.url),
    tags: profile.tags ?? [],
    links: profile.links ?? [],
  };
}

// Usage
const UP_ADDRESS = "0x82C4DC98e27CFe9D7d312250e972e7380Fbf6B77";
fetchUniversalProfile(UP_ADDRESS).then((profile) => {
  if (!profile) return console.log("No profile found");
  console.log("Name:  ", profile.name);
  console.log("Bio:   ", profile.description);
  console.log("Tags:  ", profile.tags.join(", "));
  console.log("Links: ", profile.links.map((l) => \`\${l.title}: \${l.url}\`).join(", "));
});`,
        language: 'typescript',
        author: 'leo_assistant_chef',
        authorAddress: '0x0000000000000000000000000000000000000Leo',
        timestamp: Date.now() - 3600000,
        tags: ['lsp3', 'erc725y', 'profile', 'erc725js', 'lukso'],
        likes: 0,
        forks: 0,
        isVerified: true,
        ipfsHash: 'QmLeoReadUP'
      },
      {
        id: '8',
        title: 'LSP7 Airdrop to All Followers',
        description: 'Paginate through the LSP26 Follower Registry and airdrop LSP7 tokens to every follower in a single transferBatch call via your Universal Profile. One transaction, unlimited recipients.',
        code: `import { createPublicClient, createWalletClient, encodeFunctionData, http, parseAbi, type Address, type Hex } from "viem";
import { lukso } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { lsp0Erc725AccountAbi } from "@lukso/lsp0-contracts/abi";
import { lsp7DigitalAssetAbi } from "@lukso/lsp7-contracts/abi";

const LSP26_FOLLOWER_REGISTRY: Address = "0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA";
const LSP26_ABI = parseAbi([
  "function followerCount(address addr) external view returns (uint256)",
  "function getFollowersByIndex(address addr, uint256 startIndex, uint256 endIndex) external view returns (address[])",
]);

async function airdropToFollowers(config: {
  upAddress: Address;
  privateKey: Hex;
  tokenAddress: Address;
  amountPerFollower: bigint;
  force: boolean;
}): Promise<void> {
  const { upAddress, privateKey, tokenAddress, amountPerFollower, force } = config;
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: lukso, transport: http() });
  const walletClient = createWalletClient({ account, chain: lukso, transport: http() });

  // Paginate through LSP26 follower registry
  const followerCount = await publicClient.readContract({
    address: LSP26_FOLLOWER_REGISTRY, abi: LSP26_ABI,
    functionName: "followerCount", args: [upAddress],
  });

  const followers: Address[] = [];
  for (let start = 0n; start < followerCount; start += 100n) {
    const end = start + 100n < followerCount ? start + 100n : followerCount;
    const page = await publicClient.readContract({
      address: LSP26_FOLLOWER_REGISTRY, abi: LSP26_ABI,
      functionName: "getFollowersByIndex", args: [upAddress, start, end],
    });
    followers.push(...(page as Address[]));
  }

  // Encode LSP7 batchTransfer and execute via UP
  const batchTransferCalldata = encodeFunctionData({
    abi: lsp7DigitalAssetAbi,
    functionName: "transferBatch",
    args: [
      Array(followers.length).fill(upAddress),
      followers,
      Array(followers.length).fill(amountPerFollower),
      Array(followers.length).fill(force),
      Array(followers.length).fill("0x" as Hex),
    ],
  });

  const txHash = await walletClient.writeContract({
    address: upAddress, abi: lsp0Erc725AccountAbi,
    functionName: "execute",
    args: [0n, tokenAddress, 0n, batchTransferCalldata],
  });

  console.log(\`✅ Airdropped to \${followers.length} followers — TX: \${txHash}\`);
}`,
        language: 'typescript',
        author: 'leo_assistant_chef',
        authorAddress: '0x0000000000000000000000000000000000000Leo',
        timestamp: Date.now() - 3600000,
        tags: ['lsp7', 'lsp26', 'airdrop', 'followers', 'batch', 'lukso'],
        likes: 0,
        forks: 0,
        isVerified: true,
        ipfsHash: 'QmLeoAirdrop'
      },
      {
        id: '9',
        title: 'Gasless Relay Transaction (LSP25)',
        description: 'Sign and submit meta-transactions through the Key Manager\'s executeRelayCall. Enables gasless UX for users and agent-driven automation without requiring LYX. Full LSP25 spec with validity timestamps and channel nonces.',
        code: `import { createPublicClient, createWalletClient, encodeFunctionData, encodeAbiParameters, keccak256, http, parseAbi, type Hex, type Address } from "viem";
import { lukso } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { lsp0Erc725AccountAbi } from "@lukso/lsp0-contracts/abi";

const lsp6KeyManagerAbi = parseAbi([
  "function getNonce(address from, uint128 channelId) external view returns (uint256)",
  "function executeRelayCall(bytes signature, uint256 nonce, uint256 validityTimestamps, bytes payload) external payable returns (bytes)",
]);

/**
 * Execute a gasless relay transaction via LSP25.
 * The controller signs — anyone can submit and pay the gas.
 */
async function executeRelayTransaction(
  config: {
    upAddress: Address;
    keyManagerAddress: Address;
    controllerKey: Hex;
    channelId?: number;
  },
  upCalldata: Hex,
  validForSeconds = 3600
): Promise<Hex> {
  const { upAddress, keyManagerAddress, controllerKey, channelId = 0 } = config;
  const account = privateKeyToAccount(controllerKey);
  const publicClient = createPublicClient({ chain: lukso, transport: http() });
  const walletClient = createWalletClient({ account, chain: lukso, transport: http() });

  // Get nonce (replay protection per channel)
  const nonce = await publicClient.readContract({
    address: keyManagerAddress, abi: lsp6KeyManagerAbi,
    functionName: "getNonce", args: [account.address, BigInt(channelId)],
  });

  // Build LSP25 validity timestamps: (validAfter << 128) | validBefore
  const now = BigInt(Math.floor(Date.now() / 1000));
  const validityTimestamps = BigInt(now + BigInt(validForSeconds)); // validAfter = 0

  // Hash per LSP25 spec: keccak256(version, chainId, nonce, validity, value, calldata)
  const msgHash = keccak256(
    encodeAbiParameters(
      [{ type: "uint256" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" }, { type: "bytes" }],
      [25n, BigInt(lukso.id), nonce, validityTimestamps, 0n, upCalldata]
    )
  );

  const signature = await walletClient.signMessage({ message: { raw: msgHash } });

  return walletClient.writeContract({
    address: keyManagerAddress, abi: lsp6KeyManagerAbi,
    functionName: "executeRelayCall",
    args: [signature, nonce, validityTimestamps, upCalldata],
  });
}

// Example: gasless setData on a Universal Profile
const setDataCalldata = encodeFunctionData({
  abi: lsp0Erc725AccountAbi,
  functionName: "setData",
  args: ["0xcafecafe...yourKey" as Hex, "0xdeadbeef" as Hex],
});

executeRelayTransaction(
  { upAddress: "0xYourUP", keyManagerAddress: "0xYourKM", controllerKey: "0xYourKey" },
  setDataCalldata
).then((txHash) => console.log("✅ Relay TX:", txHash));`,
        language: 'typescript',
        author: 'leo_assistant_chef',
        authorAddress: '0x0000000000000000000000000000000000000Leo',
        timestamp: Date.now() - 3600000,
        tags: ['lsp25', 'lsp6', 'relay', 'gasless', 'meta-transaction', 'lukso'],
        likes: 0,
        forks: 0,
        isVerified: true,
        ipfsHash: 'QmLeoRelayLSP25'
      },
    ]

    featuredSnippets.forEach(snippet => {
      this.snippets.set(snippet.id, snippet)
    })
    leoSnippets.forEach(snippet => {
      this.snippets.set(snippet.id, snippet)
    })
    this.idCounter = 10
  }

  get(id: string): CodeSnippet | undefined {
    return this.snippets.get(id)
  }

  getAll(): CodeSnippet[] {
    return Array.from(this.snippets.values()).sort((a, b) => b.timestamp - a.timestamp)
  }

  add(snippet: Omit<CodeSnippet, 'id'>): CodeSnippet {
    const id = String(this.idCounter++)
    const newSnippet: CodeSnippet = { ...snippet, id }
    this.snippets.set(id, newSnippet)
    return newSnippet
  }

  update(id: string, updates: Partial<CodeSnippet>): CodeSnippet | undefined {
    const snippet = this.snippets.get(id)
    if (!snippet) return undefined
    const updated = { ...snippet, ...updates }
    this.snippets.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.snippets.delete(id)
  }

  search(query: string): CodeSnippet[] {
    const lowerQuery = query.toLowerCase()
    return this.getAll().filter(snippet => 
      snippet.title.toLowerCase().includes(lowerQuery) ||
      snippet.description.toLowerCase().includes(lowerQuery) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      snippet.language.toLowerCase().includes(lowerQuery)
    )
  }

  getByLanguage(language: string): CodeSnippet[] {
    return this.getAll().filter(snippet => 
      snippet.language.toLowerCase() === language.toLowerCase()
    )
  }

  getByTag(tag: string): CodeSnippet[] {
    return this.getAll().filter(snippet => 
      snippet.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    )
  }
}

export const codeStore = new CodeStore()
