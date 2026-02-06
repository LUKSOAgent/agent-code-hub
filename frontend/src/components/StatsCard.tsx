import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color: 'blue' | 'cyan' | 'emerald' | 'purple' | 'orange' | 'pink' | 'red';
  loading?: boolean;
  onClick?: () => void;
  href?: string;
}

// Pre-defined color configurations (required for Tailwind to work properly)
const colorConfigs = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    icon: 'text-blue-500',
    glow: 'shadow-blue-500/20',
    hoverBorder: 'hover:border-blue-500/40'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    icon: 'text-cyan-500',
    glow: 'shadow-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/40'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    icon: 'text-emerald-500',
    glow: 'shadow-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    icon: 'text-purple-500',
    glow: 'shadow-purple-500/20',
    hoverBorder: 'hover:border-purple-500/40'
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    icon: 'text-orange-500',
    glow: 'shadow-orange-500/20',
    hoverBorder: 'hover:border-orange-500/40'
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    text: 'text-pink-400',
    icon: 'text-pink-500',
    glow: 'shadow-pink-500/20',
    hoverBorder: 'hover:border-pink-500/40'
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    icon: 'text-red-500',
    glow: 'shadow-red-500/20',
    hoverBorder: 'hover:border-red-500/40'
  }
};

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color,
  loading,
  onClick,
  href
}) => {
  const colors = colorConfigs[color];
  const isClickable = !!onClick || !!href;

  const content = (
    <div 
      className={`
        relative p-5 rounded-xl ${colors.bg} border ${colors.border} ${colors.hoverBorder}
        overflow-hidden group transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:' + colors.glow : ''}
        ${loading ? 'animate-pulse' : ''}
      `}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.() || (href && (window.location.href = href));
        }
      } : undefined}
    >
      {/* Background glow effect */}
      <div 
        className={`
          absolute -top-10 -right-10 w-20 h-20 ${colors.bg} rounded-full blur-2xl 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
        `} 
      />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-slate-400 text-sm font-medium truncate">{title}</p>
            <p className="text-2xl font-bold text-white mt-1 tracking-tight">
              {loading ? '—' : value}
            </p>
            
            {trend && !loading && (
              <div className="flex items-center gap-1.5 mt-2">
                {trend.value === 0 ? (
                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                ) : trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className={`text-xs font-medium ${
                  trend.value === 0 ? 'text-slate-500' :
                  trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {trend.value === 0 ? 'No change' : `${trend.isPositive ? '+' : ''}${trend.value}%`}
                </span>
                {trend.label && (
                  <span className="text-xs text-slate-500">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          
          <div className={`
            p-3 rounded-xl bg-slate-900/50 ${colors.icon}
            group-hover:scale-110 transition-transform duration-300
          `}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return content;
};

// Compact version for smaller spaces
export const StatsCardCompact: React.FC<Omit<StatsCardProps, 'trend'>> = ({
  title,
  value,
  icon: Icon,
  color,
  loading,
  onClick,
  href
}) => {
  const colors = colorConfigs[color];
  const isClickable = !!onClick || !!href;

  const content = (
    <div 
      className={`
        flex items-center gap-3 p-3 rounded-lg ${colors.bg} border ${colors.border}
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:' + colors.hoverBorder : ''}
        ${loading ? 'animate-pulse' : ''}
      `}
    >
      <div className={`p-2 rounded-lg bg-slate-900/30 ${colors.icon}`}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 truncate">{title}</p>
        <p className="text-lg font-semibold text-white">
          {loading ? '—' : value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }
  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }
  return content;
};

// Stats group for displaying multiple stats
export const StatsGroup: React.FC<{
  stats: Array<StatsCardProps>;
  columns?: 2 | 3 | 4;
  compact?: boolean;
}> = ({ stats, columns = 4, compact = false }) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  const CardComponent = compact ? StatsCardCompact : StatsCard;

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <div 
          key={stat.title}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardComponent {...stat} />
        </div>
      ))}
    </div>
  );
};

export default StatsCard;
