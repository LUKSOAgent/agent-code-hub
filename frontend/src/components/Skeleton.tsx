import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseStyles = 'bg-slate-700/50';
  
  const variantStyles = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl'
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1em' : undefined)
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

// Pre-built skeleton patterns
export const CodeCardSkeleton: React.FC<{ variant?: 'default' | 'compact' }> = ({ variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl glass-card animate-pulse">
        <Skeleton variant="circular" width={40} height={40} animation="none" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} animation="none" />
          <div className="flex gap-2">
            <Skeleton width={60} height={16} animation="none" />
            <Skeleton width={80} height={16} animation="none" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton width={40} height={20} animation="none" />
          <Skeleton width={40} height={20} animation="none" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl glass-card overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <Skeleton width={80} height={24} variant="rounded" animation="none" />
              <Skeleton width={60} height={24} variant="rounded" animation="none" />
            </div>
            <Skeleton width="80%" height={24} animation="none" />
            <Skeleton width="100%" height={16} animation="none" />
            <Skeleton width="60%" height={16} animation="none" />
          </div>
        </div>
        {/* Tags */}
        <div className="flex gap-2 mt-3">
          <Skeleton width={60} height={20} variant="rounded" animation="none" />
          <Skeleton width={50} height={20} variant="rounded" animation="none" />
          <Skeleton width={70} height={20} variant="rounded" animation="none" />
        </div>
      </div>
      {/* Code Preview */}
      <div className="px-5 pb-5">
        <Skeleton height={80} variant="rounded" animation="none" className="bg-slate-800/50" />
      </div>
      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={24} height={24} animation="none" />
          <Skeleton width={80} height={16} animation="none" />
        </div>
        <div className="flex gap-4">
          <Skeleton width={50} height={20} animation="none" />
          <Skeleton width={50} height={20} animation="none" />
        </div>
      </div>
    </div>
  );
};

export const StatsCardSkeleton: React.FC = () => (
  <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/30 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton width={80} height={14} animation="none" />
        <Skeleton width={60} height={32} animation="none" />
        <Skeleton width={100} height={16} animation="none" />
      </div>
      <Skeleton variant="rounded" width={48} height={48} animation="none" />
    </div>
  </div>
);

export const PageHeaderSkeleton: React.FC = () => (
  <div className="mb-8 animate-pulse">
    <div className="flex items-center gap-3 mb-2">
      <Skeleton variant="rounded" width={40} height={40} animation="none" />
      <Skeleton width={200} height={32} animation="none" />
    </div>
    <Skeleton width="60%" height={20} className="ml-14" animation="none" />
  </div>
);

export const SearchBarSkeleton: React.FC = () => (
  <div className="w-full animate-pulse">
    <Skeleton height={56} variant="rounded" animation="none" className="bg-slate-800/30" />
  </div>
);

export const CodeDetailSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    {/* Back button */}
    <Skeleton width={120} height={20} className="mb-8" animation="none" />
    
    {/* Header */}
    <div className="mb-8 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" height={36} animation="none" />
          <Skeleton width="100%" height={20} animation="none" />
        </div>
        <Skeleton width={80} height={28} variant="rounded" animation="none" />
      </div>
      <div className="flex gap-2">
        <Skeleton width={60} height={24} variant="rounded" animation="none" />
        <Skeleton width={50} height={24} variant="rounded" animation="none" />
        <Skeleton width={70} height={24} variant="rounded" animation="none" />
      </div>
      <div className="flex gap-4">
        <Skeleton width={140} height={16} animation="none" />
        <Skeleton width={80} height={16} animation="none" />
      </div>
    </div>

    {/* Voting section */}
    <Skeleton height={120} variant="rounded" className="mb-8" animation="none" />

    {/* Code block */}
    <Skeleton height={300} variant="rounded" animation="none" />
  </div>
);

// Grid of skeletons
export const SkeletonGrid: React.FC<{ 
  count?: number; 
  columns?: 1 | 2 | 3;
  type?: 'code-card' | 'stats-card';
}> = ({ count = 6, columns = 3, type = 'code-card' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
  };

  const SkeletonComponent = type === 'code-card' ? CodeCardSkeleton : StatsCardSkeleton;

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
