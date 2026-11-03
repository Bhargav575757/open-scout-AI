import React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useComparison } from '../../context/ComparisonContext'

export const NotificationToast: React.FC = () => {
  const { notification, clearNotification } = useComparison()

  if (!notification) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xl max-w-md">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <span className="text-sm font-medium">{notification}</span>
        <button
          type="button"
          onClick={clearNotification}
          className="ml-auto text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
