import React, { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Code2, 
  ChevronDown,
  X,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react'
import CodeCard from '../components/CodeCard'
import type { CodeSnippet } from '../types'

// Mock data - in real app would come from API
const mockSnippets: CodeSnippet[] = [
  {
    id: '1',
    title: 'ERC-20 Token with Burn Function',
    description: 'A secure ERC-20 token implementation with burn functionality and access control.',
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract MyToken is ERC20, Ownable {\n    constructor() ERC20("MyToken", "MTK") {\n        _mint(msg.sender, 1000000 * 10**decimals());\n    }\n    \n    function burn(uint256 amount) public {\n        _burn(msg.sender, amount);\n    }\n}`,
    language: 'solidity',
    author: 'dev_alice',
    authorAddress: '0x1234...5678',
    timestamp: Date.now() - 86400000,
    tags: ['erc20', 'token', 'defi'],
    likes: 128,
    forks: 45,
    isVerified: true
  },
  {
    id: '2',
    title: 'NFT Minting Contract',
    description: 'Simple NFT minting contract with metadata support and minting limits.',
    code: `contract NFTMint is ERC721 {\n    uint256 public maxSupply = 10000;\n    uint256 public mintPrice = 0.05 ether;\n    \n    function mint(uint256 quantity) external payable {\n        require(totalSupply() + quantity <= maxSupply);\n        require(msg.value >= mintPrice * quantity);\n        _safeMint(msg.sender, quantity);\n    }\n}`,
    language: 'solidity',
    author: 'crypto_bob',
    authorAddress: '0xabcd...efgh',
    timestamp: Date.now() - 172800000,
    tags: ['nft', 'erc721', 'minting'],
    likes: 89,
    forks: 32,
    isVerified: true
  },
  {
    id: '3',
    title: 'Staking Contract',
    description: 'Yield farming staking contract with reward distribution mechanism.',
    code: `contract StakingPool is ReentrancyGuard {\n    mapping(address => uint256) public stakes;\n    mapping(address => uint256) public rewards;\n    \n    function stake(uint256 amount) external {\n        updateReward(msg.sender);\n        stakes[msg.sender] += amount;\n        token.transferFrom(msg.sender, address(this), amount);\n    }\n}`,
    language: 'solidity',
    author: 'yield_farmer',
    authorAddress: '0x9876...5432',
    timestamp: Date.now() - 259200000,
    tags: ['staking', 'yield', 'defi'],
    likes: 156,
    forks: 67,
    isVerified: true
  },
  {
    id: '4',
    title: 'JavaScript Web3 Connection',
    description: 'Helper function to connect to Web3 wallet with error handling.',
    code: `async function connectWallet() {\n  if (!window.ethereum) {\n    throw new Error('MetaMask not installed');\n  }\n  \n  const accounts = await window.ethereum\n    .request({ method: 'eth_requestAccounts' });\n    \n  return accounts[0];\n}`,
    language: 'javascript',
    author: 'web3_dev',
    authorAddress: '0x1111...2222',
    timestamp: Date.now() - 432000000,
    tags: ['web3', 'javascript', 'wallet'],
    likes: 234,
    forks: 89,
    isVerified: true
  },
  {
    id: '5',
    title: 'Python Blockchain API Client',
    description: 'Python client for interacting with blockchain APIs.',
    code: `import requests\n\nclass BlockchainClient:\n    def __init__(self, api_key):\n        self.api_key = api_key\n        self.base_url = 'https://api.example.com'\n    \n    def get_balance(self, address):\n        resp = requests.get(\n            f'{self.base_url}/balance/{address}'\n        )\n        return resp.json()}`,
    language: 'python',
    author: 'py_dev',
    authorAddress: '0x3333...4444',
    timestamp: Date.now() - 604800000,
    tags: ['python', 'api', 'blockchain'],
    likes: 67,
    forks: 23,
    isVerified: false
  },
  {
    id: '6',
    title: 'Access Control Contract',
    description: 'Role-based access control for smart contracts.',
    code: `abstract contract AccessControl {\n    mapping(bytes32 => mapping(address => bool)) private _roles;\n    \n    modifier onlyRole(bytes32 role) {\n        require(hasRole(role, msg.sender));\n        _;\n    }\n    \n    function grantRole(bytes32 role, address account) external {\n        _roles[role][account] = true;\n    }\n}`,
    language: 'solidity',
    author: 'security_expert',
    authorAddress: '0x5555...6666',
    timestamp: Date.now() - 1209600000,
    tags: ['security', 'access-control', 'solidity'],
    likes: 312,
    forks: 145,
    isVerified: true
  }
]

const languages = ['All', 'Solidity', 'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go']
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' }
]

const Browse: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const filteredSnippets = useMemo(() => {
    let filtered = [...mockSnippets]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        snippet =>
          snippet.title.toLowerCase().includes(query) ||
          snippet.description.toLowerCase().includes(query) ||
          snippet.tags.some(tag => tag.toLowerCase().includes(query)) ||
          snippet.author.toLowerCase().includes(query)
      )
    }

    // Language filter
    if (selectedLanguage !== 'All') {
      filtered = filtered.filter(
        snippet => snippet.language.toLowerCase() === selectedLanguage.toLowerCase()
      )
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case 'newest':
        filtered.sort((a, b) => b.timestamp - a.timestamp)
        break
      case 'trending':
        filtered.sort((a, b) => (b.likes + b.forks * 2) - (a.likes + a.forks * 2))
        break
    }

    return filtered
  }, [searchQuery, selectedLanguage, sortBy])

  const activeFiltersCount = (selectedLanguage !== 'All' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0)

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          className={`mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Browse Code Snippets
              </h1>
            </div>
          </div>
          <p className="text-slate-400 ml-13 sm:ml-14">
            Discover and explore code from our community of developers
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div 
          className={`mb-6 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, tags, or author..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <X className="h-4 w-4 text-slate-500 hover:text-white transition-colors" />
                </button>
              )}
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Row */}
          <div className={`mt-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
            {/* Language Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500 mr-1">Language:</span>
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedLanguage === lang
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Sort and View Options */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-500 hover:text-white'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-500 hover:text-white'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count & Active Filters */}
        <div 
          className={`flex flex-wrap items-center gap-3 mb-6 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-slate-400 text-sm">
            Showing <span className="text-white font-medium">{filteredSnippets.length}</span> results
          </p>
          
          {selectedLanguage !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
              {selectedLanguage}
              <button onClick={() => setSelectedLanguage('All')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {sortBy !== 'newest' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm">
              {sortOptions.find(o => o.value === sortBy)?.label}
              <button onClick={() => setSortBy('newest')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSelectedLanguage('All')
                setSortBy('newest')
                setSearchQuery('')
              }}
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Results Grid/List */}
        {filteredSnippets.length > 0 ? (
          <div 
            className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'flex flex-col gap-4'
            } transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {filteredSnippets.map((snippet, index) => (
              <div 
                key={snippet.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CodeCard 
                  code={snippet} 
                  variant={viewMode === 'list' ? 'compact' : 'default'} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div 
            className={`text-center py-20 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              We couldn&apos;t find any code snippets matching your search. 
              Try adjusting your filters or search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedLanguage('All')
                setSortBy('newest')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Browse
