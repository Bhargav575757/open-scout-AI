import React from 'react'
import type { DifficultyLevel } from '../../types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'difficulty' | 'language' | 'accent' | 'outline' | 'score'
  difficulty?: DifficultyLevel
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  difficulty,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  let variantClasses = 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60'

  if (variant === 'accent') {
    variantClasses = 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20'
  } else if (variant === 'outline') {
    variantClasses = 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800'
  } else if (variant === 'score') {
    variantClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-semibold'
  } else if (variant === 'difficulty' && difficulty) {
    switch (difficulty) {
      case 'Beginner':
        variantClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
        break
      case 'Intermediate':
        variantClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
        break
      case 'Advanced':
        variantClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
        break
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border transition-colors ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  )
}
