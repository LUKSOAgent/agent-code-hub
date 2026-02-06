import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color: 'blue' | 'cyan' | 'emerald' | 'purple' | 'orange'
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    icon: 'text-blue-500',
    glow: 'shadow-blue-500/20'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    icon: 'text-cyan-500',
    glow: 'shadow-cyan-500/20'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    icon: 'text-emerald-500',
    glow: 'shadow-emerald-500/20'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    icon: 'text-purple-500',
    glow: 'shadow-purple-500/20'
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    icon: 'text-orange-500',
    glow: 'shadow-orange-500/20'
  }
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const colors = colorVariants[color]

  return (
    <div className={`relative p-5 rounded-xl ${colors.bg} border ${colors.border} overflow-hidden group hover-lift`}>
      {/* Glow effect */}
      <div className={`absolute -top-10 -right-10 w-20 h-20 ${colors.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className={`text-2xl font-bold text-white mt-1`}>{value}</p>
            
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-xl bg-slate-900/50 ${colors.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsCard
