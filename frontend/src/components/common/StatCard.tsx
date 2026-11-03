import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { QuickStat } from '../../types'

interface StatCardProps {
  stat: QuickStat
  icon?: React.ReactNode
}

export const StatCard: React.FC<StatCardProps> = ({ stat, icon }) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {stat.label}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {stat.value}
        </span>
        {stat.change && (
          <span
            className={`inline-flex items-center text-xs font-medium ${
              stat.trend === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : stat.trend === 'down'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {stat.trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
            {stat.trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
            {stat.trend === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
            {stat.change}
          </span>
        )}
      </div>

      {stat.description && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
          {stat.description}
        </p>
      )}
    </div>
  )
}
