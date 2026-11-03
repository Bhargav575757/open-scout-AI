import React, { useState } from 'react'
import { Search, Sparkles, X, ArrowRight } from 'lucide-react'

interface SearchBarProps {
  initialQuery?: string
  placeholder?: string
  onSearch: (query: string) => void
  size?: 'normal' | 'large'
  isLoading?: boolean
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  placeholder = 'Describe what you want to build (e.g. "AI healthcare chatbot using Python and React")...',
  onSearch,
  size = 'normal',
  isLoading = false,
  className = '',
}) => {
  const [query, setQuery] = useState(initialQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleClear = () => {
    setQuery('')
  }

  const isLarge = size === 'large'

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full group ${className}`}
    >
      <div
        className={`relative flex items-center w-full rounded-2xl border transition-all duration-200 bg-white dark:bg-zinc-900/90 shadow-sm ${
          isLarge
            ? 'p-2 md:p-2.5 border-zinc-300 dark:border-zinc-700/80 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/15'
            : 'p-1.5 border-zinc-200 dark:border-zinc-800 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/15'
        }`}
      >
        <div className="flex items-center pl-3 pr-2 text-zinc-400 group-focus-within:text-violet-500 transition-colors">
          {isLarge ? (
            <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none ${
            isLarge ? 'text-base md:text-lg py-1' : 'text-sm py-1'
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors mr-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={`flex items-center justify-center font-medium rounded-xl text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition-all disabled:opacity-50 disabled:pointer-events-none shrink-0 shadow-sm shadow-violet-600/20 ${
            isLarge
              ? 'px-5 py-2.5 text-sm md:text-base gap-2'
              : 'px-3.5 py-1.5 text-xs gap-1.5'
          }`}
        >
          <span>Find Repos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
