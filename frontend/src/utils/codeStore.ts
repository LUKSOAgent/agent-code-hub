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

    featuredSnippets.forEach(snippet => {
      this.snippets.set(snippet.id, snippet)
    })
    this.idCounter = 4
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
