import React from 'react'
import { FolderSearch, RotateCcw } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No repositories found',
  description = 'Try broadening your search query or relaxing your language and difficulty filters.',
  actionLabel = 'Reset Filters',
  onAction,
  icon,
}) => {
  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/30 dark:bg-zinc-900/30">
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4">
        {icon || <FolderSearch className="w-7 h-7" />}
      </div>

      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
        {description}
      </p>

      {onAction && (
        <Button
          variant="secondary"
          size="sm"
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

