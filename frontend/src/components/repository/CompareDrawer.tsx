import React from 'react'
import { Link } from 'react-router-dom'
import { GitCompare, X, ArrowRight, Trash2 } from 'lucide-react'
import { useComparison } from '../../context/ComparisonContext'

export const CompareDrawer: React.FC = () => {
  const { comparedRepos, removeFromComparison, clearComparison } = useComparison()

  if (comparedRepos.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92vw] animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3.5 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-2 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 shrink-0">
            <GitCompare className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {comparedRepos.map((repo) => (
              <span
                key={repo.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shrink-0"
              >
                <span className="truncate max-w-[100px]">{repo.name}</span>
                <button
                  type="button"
                  onClick={() => removeFromComparison(repo.id.toString())}
                  className="text-zinc-400 hover:text-rose-500 transition-colors"
                  aria-label={`Remove ${repo.name} from comparison`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearComparison}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors"
            title="Clear all"
            aria-label="Clear all compared repositories"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition-colors shadow-sm shadow-violet-600/20"
          >
            <span>Compare ({comparedRepos.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

