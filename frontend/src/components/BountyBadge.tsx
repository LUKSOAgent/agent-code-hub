import React from 'react';
import { DollarSign, CheckCircle2, Coins } from 'lucide-react';
import type { Bounty } from '../types';

interface BountyBadgeProps {
  bounty: Bounty;
  size?: 'sm' | 'md' | 'lg';
  showClaimed?: boolean;
  className?: string;
}

const BountyBadge: React.FC<BountyBadgeProps> = ({
  bounty,
  size = 'md',
  showClaimed = false,
  className = '',
}) => {
  const amount = parseFloat(bounty.amount);
  
  if (amount === 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-slate-500 ${className}`}>
        <Coins className="w-3.5 h-3.5" />
        <span className="text-xs">No bounty</span>
      </span>
    );
  }

  const formatAmount = (amt: number): string => {
    if (amt >= 1000000) {
      return (amt / 1000000).toFixed(1) + 'M';
    }
    if (amt >= 1000) {
      return (amt / 1000).toFixed(1) + 'K';
    }
    return amt.toLocaleString();
  };

  const getTokenSymbol = (token: string): string => {
    // Common token mappings
    const tokenMap: Record<string, string> = {
      '0x0000000000000000000000000000000000000000': 'ETH',
      'ETH': 'ETH',
      'WETH': 'WETH',
      'USDC': 'USDC',
      'USDT': 'USDT',
      'DAI': 'DAI',
      'AGENTPO': 'AGENTPO',
    };
    
    return tokenMap[token] || token.slice(0, 6);
  };

  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
      claimed: 'w-3 h-3',
    },
    md: {
      container: 'px-3 py-1 gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
      claimed: 'w-4 h-4',
    },
    lg: {
      container: 'px-4 py-2 gap-2',
      icon: 'w-5 h-5',
      text: 'text-base',
      claimed: 'w-5 h-5',
    },
  };

  const classes = sizeClasses[size];
  const tokenSymbol = getTokenSymbol(bounty.token);

  // Claimed state
  if (bounty.isClaimed && showClaimed) {
    return (
      <div
        className={`inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 ${classes.container} ${className}`}
      >
        <CheckCircle2 className={classes.claimed} />
        <span className={`${classes.text} font-medium`}>
          {formatAmount(amount)} {tokenSymbol}
        </span>
        <span className={`${classes.text} text-emerald-500/70`}>claimed</span>
      </div>
    );
  }

  // Active bounty
  return (
    <div
      className={`inline-flex items-center rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 ${classes.container} ${className}`}
    >
      <DollarSign className={classes.icon} />
      <span className={`${classes.text} font-semibold`}>
        {formatAmount(amount)} {tokenSymbol}
      </span>
    </div>
  );
};

// Compact version for lists
export const BountyCompact: React.FC<{ bounty: Bounty }> = ({ bounty }) => {
  const amount = parseFloat(bounty.amount);
  if (amount === 0) return null;

  const formatAmount = (amt: number): string => {
    if (amt >= 1000000) return (amt / 1000000).toFixed(1) + 'M';
    if (amt >= 1000) return (amt / 1000).toFixed(1) + 'K';
    return amt.toLocaleString();
  };

  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400 text-xs font-medium">
      <DollarSign className="w-3 h-3" />
      {formatAmount(amount)}
    </span>
  );
};

// Large hero version for issue detail pages
export const BountyHero: React.FC<{ bounty: Bounty; title?: string }> = ({ 
  bounty, 
  title = 'Bounty' 
}) => {
  const amount = parseFloat(bounty.amount);
  
  if (amount === 0) {
    return (
      <div className="text-center p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
        <Coins className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500">No bounty set</p>
      </div>
    );
  }

  const getTokenSymbol = (token: string): string => {
    const tokenMap: Record<string, string> = {
      '0x0000000000000000000000000000000000000000': 'ETH',
      'ETH': 'ETH',
      'WETH': 'WETH',
      'USDC': 'USDC',
      'USDT': 'USDT',
      'DAI': 'DAI',
    };
    return tokenMap[token] || token.slice(0, 6);
  };

  return (
    <div className={`text-center p-6 rounded-2xl border ${
      bounty.isClaimed 
        ? 'bg-emerald-500/5 border-emerald-500/20' 
        : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20'
    }`}>
      <p className="text-sm text-slate-500 mb-2">{title}</p>
      <div className="flex items-center justify-center gap-2 mb-2">
        {bounty.isClaimed ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        ) : (
          <DollarSign className="w-8 h-8 text-amber-400" />
        )}
        <span className={`text-3xl font-bold ${bounty.isClaimed ? 'text-emerald-400' : 'text-amber-400'}`}>
          {amount.toLocaleString()}
        </span>
        <span className={`text-xl ${bounty.isClaimed ? 'text-emerald-400/70' : 'text-amber-400/70'}`}>
          {getTokenSymbol(bounty.token)}
        </span>
      </div>
      {bounty.isClaimed && bounty.claimedBy && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <p className="text-sm text-emerald-400/70">
            Claimed by {bounty.claimedBy}
          </p>
          {bounty.claimedAt && (
            <p className="text-xs text-emerald-400/50 mt-1">
              {new Date(bounty.claimedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BountyBadge;
