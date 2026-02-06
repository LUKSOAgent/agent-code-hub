import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Code2, Upload, User, Search, Menu, X, Wallet } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { to: '/explore', icon: Search, label: 'Explore', ariaLabel: 'Explore code snippets' },
    { to: '/upload', icon: Upload, label: 'Upload', ariaLabel: 'Upload new code' },
    { to: '/my-codes', icon: User, label: 'My Codes', ariaLabel: 'View my code snippets' },
  ];

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/10' 
          : 'bg-slate-900/80 backdrop-blur-md border-b border-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg p-1 -ml-1 transition-all"
            aria-label="Agent Code Hub - Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
              <Code2 className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-white tracking-tight">
                Agent<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Code</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-label={link.ariaLabel}
                aria-current={isActive(link.to) ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  isActive(link.to)
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <link.icon className="w-4 h-4" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            ))}

            {/* RainbowKit Connect Button */}
            <div className="ml-3 pl-3 border-l border-slate-800">
              <ConnectButton 
                showBalance={false}
                accountStatus="address"
                chainStatus="icon"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="scale-90">
              <ConnectButton 
                showBalance={false}
                accountStatus="avatar"
                chainStatus="none"
              />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        className={`md:hidden fixed inset-x-0 top-16 bg-slate-900 border-b border-slate-800 transition-all duration-300 ${
          mobileMenuOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
      >
        <div className="px-4 py-4 space-y-2">
          {/* Wallet Status in Mobile Menu */}
          <div className="mb-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isConnected 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-700 text-slate-400'
              }`}>
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  {isConnected ? 'Connected' : 'Not Connected'}
                </p>
                {isConnected && address ? (
                  <p className="text-sm font-mono text-white truncate">
                    {formatAddress(address)}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Connect your wallet
                  </p>
                )}
              </div>
              {isConnected && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
          </div>
          
          <div className="border-t border-slate-800 my-2" />
          
          {navLinks.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              aria-label={link.ariaLabel}
              aria-current={isActive(link.to) ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animation: mobileMenuOpen ? 'fadeUp 0.3s ease forwards' : 'none'
              }}
            >
              <link.icon className="w-5 h-5" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/95 backdrop-blur-md -z-10"
          style={{ top: '4rem' }}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
