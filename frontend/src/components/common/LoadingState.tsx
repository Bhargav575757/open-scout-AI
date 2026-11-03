import React from 'react'
import { Sparkles } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  subtext?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Searching and ranking matching repositories...',
  subtext = 'Analyzing intent and computing semantic relevance',
}) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="relative mb-5">
        <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-violet-500 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-violet-500/10 blur-sm -z-10 animate-ping" />
      </div>

      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {message}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
        {subtext}
      </p>

      {/* Skeleton cards */}
      <div className="w-full max-w-2xl mt-8 space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="flex gap-2 pt-2">
              <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
