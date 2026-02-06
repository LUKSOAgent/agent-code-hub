import React from 'react';
import { LucideIcon, Search, FileCode, Upload, Wallet, FolderOpen, AlertCircle } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  type?: 'search' | 'code' | 'upload' | 'wallet' | 'generic' | 'error';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}

const defaultConfigs = {
  search: {
    icon: Search,
    title: 'No results found',
    description: 'We couldn\'t find anything matching your search. Try adjusting your filters or search query.'
  },
  code: {
    icon: FileCode,
    title: 'No code snippets yet',
    description: 'Get started by uploading your first code snippet to share with the community.'
  },
  upload: {
    icon: Upload,
    title: 'Ready to share?',
    description: 'Upload your code snippets to share with the blockchain developer community.'
  },
  wallet: {
    icon: Wallet,
    title: 'Connect your wallet',
    description: 'Please connect your wallet to access this feature. We support Universal Profile and MetaMask.'
  },
  generic: {
    icon: FolderOpen,
    title: 'Nothing here yet',
    description: 'There are no items to display at the moment.'
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We encountered an error while loading this content. Please try again.'
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon: CustomIcon,
  className = ''
}) => {
  const config = defaultConfigs[type];
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  const iconColors = {
    search: 'text-slate-500',
    code: 'text-blue-400',
    upload: 'text-emerald-400',
    wallet: 'text-purple-400',
    generic: 'text-slate-500',
    error: 'text-red-400'
  };

  const bgColors = {
    search: 'bg-slate-800/30',
    code: 'bg-blue-500/10',
    upload: 'bg-emerald-500/10',
    wallet: 'bg-purple-500/10',
    generic: 'bg-slate-800/30',
    error: 'bg-red-500/10'
  };

  const borderColors = {
    search: 'border-slate-700/30',
    code: 'border-blue-500/20',
    upload: 'border-emerald-500/20',
    wallet: 'border-purple-500/20',
    generic: 'border-slate-700/30',
    error: 'border-red-500/20'
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon Container */}
      <div 
        className={`w-20 h-20 rounded-2xl ${bgColors[type]} border ${borderColors[type]} flex items-center justify-center mb-6`}
      >
        <Icon className={`w-10 h-10 ${iconColors[type]}`} aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        {displayDescription}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {actionLabel && (actionHref || onAction) && (
          <>
            {actionHref ? (
              <a href={actionHref}>
                <Button 
                  variant={type === 'error' ? 'primary' : type === 'wallet' ? 'secondary' : 'primary'}
                  icon={type === 'upload' ? Upload : type === 'code' ? Upload : undefined}
                >
                  {actionLabel}
                </Button>
              </a>
            ) : (
              <Button 
                onClick={onAction}
                variant={type === 'error' ? 'primary' : type === 'wallet' ? 'secondary' : 'primary'}
                icon={type === 'upload' ? Upload : type === 'code' ? Upload : undefined}
              >
                {actionLabel}
              </Button>
            )}
          </>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <Button 
            variant="ghost" 
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

// Specialized empty states
export const SearchEmptyState: React.FC<{
  searchQuery?: string;
  onClearSearch?: () => void;
}> = ({ searchQuery, onClearSearch }) => (
  <EmptyState
    type="search"
    title={searchQuery ? `No results for "${searchQuery}"` : 'No results found'}
    description="Try adjusting your search terms or filters to find what you're looking for."
    secondaryActionLabel="Clear filters"
    onSecondaryAction={onClearSearch}
  />
);

export const CodeEmptyState: React.FC<{
  isOwnProfile?: boolean;
}> = ({ isOwnProfile = false }) => (
  <EmptyState
    type="code"
    title={isOwnProfile ? 'You haven\'t uploaded any code yet' : 'No code snippets found'}
    description={isOwnProfile 
      ? 'Share your knowledge with the community by uploading your first code snippet.'
      : 'This user hasn\'t uploaded any code snippets yet.'
    }
    actionLabel="Upload Code"
    actionHref="#/upload"
  />
);

export const WalletEmptyState: React.FC = () => (
  <EmptyState
    type="wallet"
    title="Connect Your Wallet"
    description="Connect your Universal Profile or MetaMask wallet to view your code snippets and reputation."
  />
);

export const ErrorEmptyState: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => (
  <EmptyState
    type="error"
    actionLabel="Try Again"
    onAction={onRetry}
  />
);

export default EmptyState;
