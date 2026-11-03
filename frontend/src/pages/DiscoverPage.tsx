import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowUpDown,
  Filter as FilterIcon,
  X,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { SearchBar } from '../components/search/SearchBar'
import { FilterPanel } from '../components/filters/FilterPanel'
import { RepositoryCard } from '../components/repository/RepositoryCard'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'
import { mockRepositories } from '../data/mockData'
import type { FilterState, Repository, SortOption } from '../types'

const initialFilters: FilterState = {
  searchQuery: '',
  languages: [],
  minStars: 0,
  difficulties: [],
  licenses: [],
  recentlyUpdatedOnly: false,
  sortBy: 'relevance',
}

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [filters, setFilters] = useState<FilterState>({
    ...initialFilters,
    searchQuery: initialQuery,
  })

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Sync state if query parameter changes
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setFilters((prev) => ({ ...prev, searchQuery: q }))
  }, [searchParams])

  const handleSearchSubmit = (newQuery: string) => {
    setIsLoading(true)
    setSearchParams(newQuery ? { q: newQuery } : {})
    setFilters((prev) => ({ ...prev, searchQuery: newQuery }))
    setTimeout(() => {
      setIsLoading(false)
    }, 350)
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
    setSearchParams({})
  }

  // Filter and sort repositories locally
  const filteredRepositories = useMemo(() => {
    let result: Repository[] = [...mockRepositories]

    // 1. Text search (matches name, description, topics, matchReason, language)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase()
      result = result.filter(
        (repo) =>
          repo.name.toLowerCase().includes(q) ||
          repo.description.toLowerCase().includes(q) ||
          repo.matchReason.toLowerCase().includes(q) ||
          repo.language.toLowerCase().includes(q) ||
          repo.topics.some((t) => t.toLowerCase().includes(q)) ||
          repo.technologies.some((tech) => tech.toLowerCase().includes(q))
      )
    }

    // 2. Language filter
    if (filters.languages.length > 0) {
      result = result.filter((repo) => filters.languages.includes(repo.language))
    }

    // 3. Minimum stars filter
    if (filters.minStars > 0) {
      result = result.filter((repo) => repo.stars >= filters.minStars)
    }

    // 4. Difficulty filter
    if (filters.difficulties.length > 0) {
      result = result.filter((repo) => filters.difficulties.includes(repo.difficulty))
    }

    // 5. License filter
    if (filters.licenses.length > 0) {
      result = result.filter((repo) => filters.licenses.includes(repo.license))
    }

    // 6. Recently updated filter (e.g. hours or days ago)
    if (filters.recentlyUpdatedOnly) {
      result = result.filter(
        (repo) =>
          repo.lastUpdated.includes('hours') ||
          repo.lastUpdated.includes('Yesterday') ||
          repo.lastUpdated.includes('days')
      )
    }

    // 7. Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'stars') {
        return b.stars - a.stars
      }
      if (filters.sortBy === 'updated') {
        return a.lastUpdated.localeCompare(b.lastUpdated)
      }
      // 'relevance' (default: docQualityScore combined with stars)
      return b.docQualityScore - a.docQualityScore
    })

    return result
  }, [filters])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Discover Repositories"
        description="Explore verified open-source projects matched to your natural-language technical requirements."
        badgeText="Semantic Matching"
        showDemoBadge={true}
      />

      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <SearchBar
            initialQuery={filters.searchQuery}
            onSearch={handleSearchSubmit}
            placeholder="Search by topic, framework, language, or freeform project idea..."
            isLoading={isLoading}
          />
        </div>

        {/* Mobile filter toggle */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
        >
          <FilterIcon className="w-4 h-4 text-violet-500" />
          <span>Filters</span>
          {(filters.languages.length > 0 ||
            filters.minStars > 0 ||
            filters.difficulties.length > 0 ||
            filters.licenses.length > 0) && (
            <span className="w-2 h-2 rounded-full bg-violet-600" />
          )}
        </button>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <ArrowUpDown className="w-4 h-4 text-zinc-400" />
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({ ...filters, sortBy: e.target.value as SortOption })
            }
            className="text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
          >
            <option value="relevance">Sort: AI Relevance</option>
            <option value="stars">Sort: Most Stars</option>
            <option value="updated">Sort: Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Main Discover Layout (Filters Sidebar + Repository Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            totalCount={mockRepositories.length}
            filteredCount={filteredRepositories.length}
          />
        </div>

        {/* Repository Cards Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Search / Intent Banner */}
          {filters.searchQuery && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-500/20 text-xs">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                <span>
                  Query intent:{' '}
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                    &ldquo;{filters.searchQuery}&rdquo;
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSearchSubmit('')}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isLoading ? (
            <LoadingState />
          ) : filteredRepositories.length === 0 ? (
            <EmptyState
              title="No repositories match your filter criteria"
              description="Try adjusting your keywords, lowering star thresholds, or resetting language filters."
              onAction={handleResetFilters}
              actionLabel="Reset All Filters"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRepositories.map((repo) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-white dark:bg-zinc-900 h-full p-5 overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Filter Repositories
              </h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleResetFilters}
              totalCount={mockRepositories.length}
              filteredCount={filteredRepositories.length}
            />
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-xs shadow-md"
            >
              Apply Filters ({filteredRepositories.length} matches)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
