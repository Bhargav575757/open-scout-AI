import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  History,
  Search,
  ArrowRight,
  Trash2,
  Clock,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { mockSearchHistory } from '../data/mockData'
import type { SearchHistoryItem } from '../types'

export const SearchHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const [historyList, setHistoryList] = useState<SearchHistoryItem[]>(mockSearchHistory)

  const handleSearchAgain = (query: string) => {
    navigate(`/discover?q=${encodeURIComponent(query)}`)
  }

  const handleDeleteItem = (id: string) => {
    setHistoryList((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAll = () => {
    setHistoryList([])
  }

  const handleRestoreDefaults = () => {
    setHistoryList(mockSearchHistory)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <PageHeader
        title="Search History"
        description="Review previous natural-language queries, extracted criteria, and recommendation match counts."
        badgeText="Query Logs"
        showDemoBadge={true}
      >
        {historyList.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </PageHeader>

      {historyList.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8" />}
          title="Search history is empty"
          description="You have cleared all previous search logs. You can restore the sample demo query history at any time."
          actionLabel="Restore Sample History"
          onAction={handleRestoreDefaults}
        />
      ) : (
        <div className="space-y-3">
          {historyList.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="font-semibold text-violet-600 dark:text-violet-400">
                    {item.resultsCount} matching blueprints
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-start gap-2">
                  <Search className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <span>&ldquo;{item.query}&rdquo;</span>
                </h3>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-zinc-400 hover:text-rose-500 transition-colors rounded-lg"
                  title="Delete from history"
                  aria-label="Delete history entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSearchAgain(item.query)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-sm shadow-violet-600/20 cursor-pointer"
                >
                  <span>Search again</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
