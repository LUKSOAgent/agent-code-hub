import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Code2, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Shield, 
  Users,
  ChevronRight,
  Terminal,
  Globe,
  Lock,
  Rocket,
  Github
} from 'lucide-react'
import CodeCard from '../components/CodeCard'
import Button from '../components/Button'
import type { CodeSnippet } from '../types'

// Mock data for featured snippets
const featuredSnippets: CodeSnippet[] = [
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
  }
]

const stats = [
  { value: '10K+', label: 'Code Snippets', icon: Code2 },
  { value: '5K+', label: 'Developers', icon: Users },
  { value: '100%', label: 'Verified Code', icon: Shield },
  { value: '50ms', label: 'Avg. Load Time', icon: Zap }
]

const features = [
  {
    icon: Shield,
    title: 'Verified Code',
    description: 'All code snippets are verified and audited by our community of expert developers.',
    color: 'emerald'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant access to thousands of code snippets with our optimized search engine.',
    color: 'yellow'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join a thriving community of blockchain developers sharing knowledge and code.',
    color: 'blue'
  },
  {
    icon: Lock,
    title: 'Secure Storage',
    description: 'Your code is stored securely on IPFS and blockchain for permanent access.',
    color: 'purple'
  },
  {
    icon: Globe,
    title: 'Universal Profile',
    description: 'Native support for LUKSO Universal Profiles with reputation tracking.',
    color: 'pink'
  },
  {
    icon: Terminal,
    title: 'Developer First',
    description: 'Built by developers for developers with syntax highlighting and smart features.',
    color: 'cyan'
  }
]

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-[120px] opacity-40" />
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-b from-cyan-500/15 to-transparent rounded-full blur-[100px] opacity-30" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-purple-500/10 to-transparent rounded-full blur-[80px] opacity-30" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-blue-500/20 mb-8 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">The Future of Code Sharing</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">NEW</span>
            </div>

            {/* Title */}
            <h1 
              className={`text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Share & Discover{' '}
              <span className="gradient-text">Smart Contract</span>{' '}
              Code
            </h1>

            {/* Subtitle */}
            <p 
              className={`text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              The premier platform for blockchain developers to share, discover, 
              and collaborate on verified smart contract code snippets.
            </p>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link to="/browse">
                <Button size="lg" icon={Code2} iconPosition="left" className="w-full sm:w-auto group">
                  Browse Code
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/upload">
                <Button variant="outline" size="lg" icon={Rocket} iconPosition="left" className="w-full sm:w-auto">
                  Post Your Code
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div 
              className={`grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="p-4 sm:p-5 rounded-2xl glass-card border border-slate-700/30 group hover:border-blue-500/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Code Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/50 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Snippets</h2>
              </div>
              <p className="text-slate-400 ml-4">Hand-picked code from our community</p>
            </div>
            <Link 
              to="/browse"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-blue-400 hover:text-blue-300 font-medium transition-all hover:bg-blue-500/10"
            >
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSnippets.map((snippet, index) => (
              <div 
                key={snippet.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CodeCard code={snippet} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 text-sm mb-4">
              <Zap className="w-4 h-4 text-yellow-400" />
              Powerful Features
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose <span className="gradient-text">Agent Code Hub</span>?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Built for developers, by developers. Everything you need to build better smart contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-6 rounded-2xl glass-card hover:border-blue-500/30 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-500/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                description: 'Connect your Universal Profile or MetaMask wallet to get started.'
              },
              {
                step: '02',
                title: 'Share Code',
                description: 'Upload your smart contract code with descriptions and tags.'
              },
              {
                step: '03',
                title: 'Earn Reputation',
                description: 'Get likes and forks to build your developer reputation.'
              }
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="p-8 rounded-2xl glass-card text-center">
                  <div className="text-5xl font-bold text-slate-700/50 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-slate-700 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-8 sm:p-12 lg:p-16 rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-teal-600/20" />
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" />
            
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-blue-500/50" />
            
            {/* Content */}
            <div className="relative text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Share Your Code?
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                Join thousands of developers sharing their smart contract code. 
                Get feedback, earn reputation, and help the community grow.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/upload">
                  <Button size="lg" icon={Sparkles} className="w-full sm:w-auto">
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                    Explore Code
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-white">Agent</span>
                <span className="gradient-text">Code</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Built for the blockchain developer community
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
