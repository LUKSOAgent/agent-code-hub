import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import { Code2, Upload, User, Search } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              Agent Code Hub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/explore"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/explore')
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Explore</span>
            </Link>

            <Link
              to="/upload"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/upload')
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Upload</span>
            </Link>

            <Link
              to="/my-codes"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/my-codes')
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">My Codes</span>
            </Link>

            {/* RainbowKit Connect Button */}
            <div className="ml-2">
              <ConnectButton 
                showBalance={false}
                accountStatus="address"
                chainStatus="icon"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
