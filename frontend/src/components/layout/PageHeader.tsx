import React from 'react'
import { DEMO_DATA_BADGE_TEXT } from '../../data/mockData'

interface PageHeaderProps {
  title: string
  description?: string
  badgeText?: string
  children?: React.ReactNode
  showDemoBadge?: boolean
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badgeText,
  children,
  showDemoBadge = true,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80 mb-6">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {badgeText && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-medium">
              {badgeText}
            </span>
          )}
          {showDemoBadge && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
              {DEMO_DATA_BADGE_TEXT}
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  )
}

