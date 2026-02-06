import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Heart, 
  GitFork, 
  Clock, 
  Shield, 
  Copy, 
  Check, 
  Share2, 
  Flag,
  ChevronLeft,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Download,
  FileCode,
  Hash,
  User,
  Calendar,
  Eye
} from 'lucide-react'
import Button from '../components/Button'
import type { CodeSnippet, Comment } from '../types'

// Mock data
const mockSnippet: CodeSnippet = {
  id: '1',
  title: 'ERC-20 Token with Burn Function',
  description: 'A secure ERC-20 token implementation with burn functionality and access control. This contract includes minting capabilities for the owner, burning functionality for token holders, and standard ERC-20 interface implementation.',
  code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18;
    
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    function burnFrom(address account, uint256 amount) public {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}`,
  language: 'solidity',
  author: 'dev_alice',
  authorAddress: '0x1234567890abcdef1234567890abcdef12345678',
  timestamp: Date.now() - 86400000,
  tags: ['erc20', 'token', 'defi', 'openzeppelin', 'solidity'],
  likes: 128,
  forks: 45,
  isVerified: true,
  license: 'MIT'
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'security_expert',
    content: 'Great implementation! Consider adding a pause functionality for emergency situations.',
    timestamp: Date.now() - 3600000,
    likes: 12
  },
  {
    id: '2',
    author: 'defi_builder',
    content: 'Used this in production, works flawlessly. The burn functionality is gas efficient.',
    timestamp: Date.now() - 7200000,
    likes: 8
  },
  {
    id: '3',
    author: 'solidity_dev',
    content: 'Would recommend adding events for mint and burn operations for better traceability.',
    timestamp: Date.now() - 86400000,
    likes: 5
  }
]

const CodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [snippet] = useState<CodeSnippet>(mockSnippet)
  const [comments] = useState<Comment[]>(mockComments)
  const [copied, setCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isForked, setIsForked] = useState(false)
  const [activeTab, setActiveTab] = useState<'code' | 'comments'>('code')
  const [newComment, setNewComment] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([snippet.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${snippet.title.replace(/\s+/g, '_').toLowerCase()}.${getFileExtension(snippet.language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileExtension = (lang: string) => {
    const extensions: Record<string, string> = {
      solidity: 'sol',
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      rust: 'rs',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs'
    }
    return extensions[lang.toLowerCase()] || 'txt'
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      solidity: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      javascript: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      typescript: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
      python: 'text-green-400 bg-green-500/10 border-green-500/20',
      rust: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      go: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    }
    return colors[lang.toLowerCase()] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'
  }

  // Improved syntax highlighting
  const highlightCode = (code: string) => {
    let highlighted = code
      // Comments
      .replace(/(\/\/.*)/g, '<span class="text-slate-500 italic">$1</span>')
      // Strings
      .replace(/(".*?")/g, '<span class="text-emerald-400">$1</span>')
      // Keywords
      .replace(/\b(import|pragma|contract|function|public|private|external|internal|view|pure|returns|return|if|else|require|emit|event|struct|enum|mapping|address|uint|int|bool|string|bytes|memory|storage|calldata|constant|constructor|modifier|interface|library|using|for|new|is|this|super|selfdestruct|delegatecall|call|staticcall|keccak256|ecrecover|blockhash|gasleft)\b/g, '<span class="text-purple-400">$1</span>')
      // Built-in types
      .replace(/\b(ERC20|Ownable|msg\.sender|msg\.value|block\.timestamp|block\.number|tx\.origin|now)\b/g, '<span class="text-cyan-400">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>')
      // Function names (before parentheses)
      .replace(/\b(\w+)(?=\()/g, '<span class="text-blue-400">$1</span>')
    
    return highlighted
  }

  // Split code into lines for line numbers
  const codeLines = snippet.code.split('\n')

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div 
          className={`pt-6 mb-6 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Link 
            to="/browse"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Back to browse</span>
          </Link>
        </div>

        {/* Header Card */}
        <div 
          className={`glass-card p-6 sm:p-8 mb-6 transition-all duration-500 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getLanguageColor(snippet.language)}`}>
              <FileCode className="w-3.5 h-3.5" />
              {snippet.language}
            </span>
            {snippet.isVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
            {snippet.license && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-slate-400 bg-slate-500/10 border border-slate-500/20">
                <Hash className="w-3.5 h-3.5" />
                {snippet.license}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            {snippet.title}
          </h1>
          
          {/* Description */}
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            {snippet.description}
          </p>

          {/* Author & Actions Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {snippet.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{snippet.author}</p>
                <p className="text-sm text-slate-500 font-mono">{snippet.authorAddress.slice(0, 6)}...{snippet.authorAddress.slice(-4)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={isLiked ? 'primary' : 'secondary'}
                size="sm"
                icon={Heart}
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? 'text-red-400' : ''}
              >
                {snippet.likes + (isLiked ? 1 : 0)}
              </Button>
              <Button
                variant={isForked ? 'primary' : 'secondary'}
                size="sm"
                icon={GitFork}
                onClick={() => setIsForked(!isForked)}
              >
                {snippet.forks + (isForked ? 1 : 0)}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Share2}
              >
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Code/Comments */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div 
              className={`flex items-center gap-1 border-b border-slate-700/50 mb-6 transition-all duration-500 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                  activeTab === 'code' 
                    ? 'text-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-4 h-4" />
                Code
                {activeTab === 'code' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                  activeTab === 'comments' 
                    ? 'text-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Comments
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs">
                  {comments.length}
                </span>
                {activeTab === 'comments' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
                )}
              </button>
            </div>

            {/* Content */}
            {activeTab === 'code' ? (
              <div 
                className={`space-y-6 transition-all duration-500 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                {/* Code Block */}
                <div className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950">
                  {/* Code Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <span className="ml-3 text-sm text-slate-500 font-mono">contract.sol</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Code Content with Line Numbers */}
                  <div className="flex overflow-x-auto">
                    {/* Line Numbers */}
                    <div className="flex-shrink-0 py-4 px-4 text-right bg-slate-900/30 border-r border-slate-800 select-none">
                      {codeLines.map((_, index) => (
                        <div key={index} className="text-xs text-slate-600 font-mono leading-6">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                    {/* Code */}
                    <div className="flex-1 py-4 px-4 overflow-x-auto">
                      <pre className="text-sm font-mono leading-6">
                        <code 
                          className="text-slate-300"
                          dangerouslySetInnerHTML={{ __html: highlightCode(snippet.code) }}
                        />
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-lg text-sm text-slate-400 bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 hover:text-white transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div 
                className={`space-y-6 transition-all duration-500 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                {/* Add Comment */}
                <div className="glass-card p-5">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    Add a comment
                  </h3>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts or ask a question..."
                    className="w-full h-28 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <div className="flex justify-end mt-3">
                    <Button size="sm">Post Comment</Button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div 
                      key={comment.id}
                      className="glass-card p-5 animate-fade-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{comment.author}</span>
                            <span className="text-slate-500 text-xs">{formatDate(comment.timestamp)}</span>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-400 transition-colors">
                              <ThumbsUp className="w-4 h-4" />
                              {comment.likes}
                            </button>
                            <button className="text-sm text-slate-500 hover:text-white transition-colors">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div 
            className={`space-y-6 transition-all duration-500 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Metadata Card */}
            <div className="glass-card p-5">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Metadata
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Created</span>
                  <span className="text-white text-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {formatDate(snippet.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Language</span>
                  <span className="text-white text-sm">{snippet.language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">License</span>
                  <span className="text-white text-sm">{snippet.license || 'Unlicensed'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">File Size</span>
                  <span className="text-white text-sm">{(snippet.code.length / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="glass-card p-5">
              <h3 className="text-white font-medium mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 text-center">
                  <Heart className="w-5 h-5 text-red-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{snippet.likes}</div>
                  <div className="text-xs text-slate-500">Likes</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 text-center">
                  <GitFork className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{snippet.forks}</div>
                  <div className="text-xs text-slate-500">Forks</div>
                </div>
              </div>
            </div>

            {/* Related Tags */}
            <div className="glass-card p-5">
              <h3 className="text-white font-medium mb-4">Related Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['defi', 'ethereum', 'web3', 'smart-contracts', 'tokens'].map((tag) => (
                  <Link
                    key={tag}
                    to={`/browse?tag=${tag}`}
                    className="px-3 py-1.5 rounded-lg text-sm text-slate-400 bg-slate-800/50 border border-slate-700/30 hover:border-blue-500/30 hover:text-blue-400 transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Report */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-sm">
              <Flag className="w-4 h-4" />
              Report this code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeDetail
