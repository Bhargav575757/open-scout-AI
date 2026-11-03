import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowUpDown,
  Filter as FilterIcon,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  FolderGit2,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { SearchBar } from '../components/search/SearchBar'
import { RepositoryCard } from '../components/repository/RepositoryCard'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'
import { apiService } from '../services/api'
import { mockExamplePrompts } from '../data/mockData'
import type { Repository, GitHubRepositoryItem } from '../types'

const AVAILABLE_LANGUAGES = [
  'All Languages',
  'Python',
  'TypeScript',
  'JavaScript',
  'Go',
  'Rust',
  'Java',
  'C++',
]

const STAR_OPTIONS = [
  { label: 'All stars', value: 0 },
  { label: '10+ ⭐', value: 10 },
  { label: '50+ ⭐', value: 50 },
  { label: '100+ ⭐', value: 100 },
  { label: '500+ ⭐', value: 500 },
  { label: '1,000+ ⭐', value: 1000 },
]

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All Languages')
  const [minStars, setMinStars] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('stars')
  const [page, setPage] = useState<number>(1)
  const perPage = 10

  const [repositories, setRepositories] = useState<Repository[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Map GitHub raw API items to frontend Repository model
  const mapGitHubItemToRepo = (item: GitHubRepositoryItem): Repository => {
    return {
      id: item.id.toString(),
      name: item.name,
      full_name: item.full_name,
      owner: item.owner || 'unknown',
      ownerAvatar: item.owner_avatar_url || undefined,
      owner_avatar_url: item.owner_avatar_url,
      description: item.description || 'No description provided.',
      html_url: item.html_url,
      githubUrl: item.html_url,
      language: item.language || 'Various',
      stars: item.stars ?? item.stargazers_count ?? 0,
      forks: item.forks ?? item.forks_count ?? 0,
      watchers: item.watchers_count || 0,
      openIssues: item.open_issues_count || 0,
      license: item.license || 'Unspecified',
      lastUpdated: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recently',
      updated_at: item.updated_at,
      created_at: item.created_at,
      topics: item.topics || [],
      matchReason: `Live GitHub repository matching "${query}" with ${item.stars ?? 0} stars.`,
      defaultBranch: item.default_branch || 'main',
      isLiveGitHub: true,
    }
  }

  const executeSearch = useCallback(
    async (
      searchQuery: string,
      lang: string,
      stars: number,
      sort: string,
      targetPage: number
    ) => {
      const trimmed = searchQuery.trim()
      if (!trimmed) {
        setRepositories([])
        setTotalCount(0)
        setHasSearched(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)
      setHasSearched(true)

      try {
        const response = await apiService.search({
          query: trimmed,
          language: lang !== 'All Languages' ? lang : undefined,
          min_stars: stars > 0 ? stars : undefined,
          sort: sort !== 'best-match' ? sort : undefined,
          page: targetPage,
          limit: perPage,
        })

        const mapped = (response.items || []).map(mapGitHubItemToRepo)
        setRepositories(mapped)
        setTotalCount(response.total_count || 0)
        setPage(response.page || targetPage)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to search GitHub repositories'
        setError(msg)
        setRepositories([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    },
    [perPage]
  )

  // Trigger search on mount if query param present, or sync query param
  useEffect(() => {
    const q = searchParams.get('q') || ''
    if (q) {
      setQuery(q)
      executeSearch(q, selectedLanguage, minStars, sortBy, 1)
    }
  }, [searchParams])

  const handleSearchSubmit = (newQuery: string) => {
    setQuery(newQuery)
    setPage(1)
    setSearchParams(newQuery ? { q: newQuery } : {})
    executeSearch(newQuery, selectedLanguage, minStars, sortBy, 1)
  }

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang)
    setPage(1)
    if (query.trim()) {
      executeSearch(query, lang, minStars, sortBy, 1)
    }
  }

  const handleMinStarsChange = (stars: number) => {
    setMinStars(stars)
    setPage(1)
    if (query.trim()) {
      executeSearch(query, selectedLanguage, stars, sortBy, 1)
    }
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setPage(1)
    if (query.trim()) {
      executeSearch(query, selectedLanguage, minStars, newSort, 1)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    executeSearch(query, selectedLanguage, minStars, sortBy, newPage)
  }

  const handleResetFilters = () => {
    setSelectedLanguage('All Languages')
    setMinStars(0)
    setSortBy('stars')
    setPage(1)
    if (query.trim()) {
      executeSearch(query, 'All Languages', 0, 'stars', 1)
    }
  }

  const totalPages = Math.min(100, Math.ceil(totalCount / perPage))

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Discover GitHub Repositories"
        description="Search real-time open-source repositories from the official GitHub REST API based on technical concepts and requirements."
        badgeText="GitHub REST API v3"
        showDemoBadge={false}
      />

      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <SearchBar
            initialQuery={query}
            onSearch={handleSearchSubmit}
            placeholder="Search GitHub repositories (e.g. AI healthcare chatbot Python React)..."
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
          {(selectedLanguage !== 'All Languages' || minStars > 0) && (
            <span className="w-2 h-2 rounded-full bg-violet-600" />
          )}
        </button>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <ArrowUpDown className="w-4 h-4 text-zinc-400" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
          >
            <option value="stars">Sort: Most Stars</option>
            <option value="forks">Sort: Most Forks</option>
            <option value="updated">Sort: Recently Updated</option>
            <option value="best-match">Sort: Best Match</option>
          </select>
        </div>
      </div>

      {/* Main Discover Layout (Filters Sidebar + Repository Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-20 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                GitHub Filters
              </h3>
            </div>
            {(selectedLanguage !== 'All Languages' || minStars > 0) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Programming Language Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Programming Language
            </label>
            <div className="space-y-1">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Stars Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Minimum Stars
            </label>
            <div className="space-y-1">
              {STAR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleMinStarsChange(opt.value)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    minStars === opt.value
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* GitHub Live API Badge */}
          <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-semibold mb-1">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Real GitHub Data</span>
            </div>
            Repositories fetched live using qualifiers like <code>language:Python</code> and <code>stars:&gt;=10</code>.
          </div>
        </aside>

        {/* Repository Cards Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Search Intent Banner */}
          {query && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-500/20 text-xs">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                <span>
                  GitHub Query:{' '}
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                    &ldquo;{query}&rdquo;
                  </strong>
                  {totalCount > 0 && ` (${totalCount.toLocaleString()} repositories found)`}
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

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Search Error</p>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => executeSearch(query, selectedLanguage, minStars, sortBy, page)}
                  className="mt-2 text-xs font-semibold underline cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            </div>
          )}

          {/* Content States */}
          {isLoading ? (
            <LoadingState
              message="Querying GitHub REST API..."
              subtext="Retrieving verified repositories, stargazer counts, and metadata"
            />
          ) : !hasSearched && !query ? (
            <div className="py-12 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Ready to search live open-source repositories
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Enter your technical stack or project concept in the search bar above to fetch actual public repositories from GitHub.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {mockExamplePrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSearchSubmit(prompt)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-violet-500 cursor-pointer"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          ) : repositories.length === 0 ? (
            <EmptyState
              title="No repositories found on GitHub"
              description="No public GitHub repositories matched your search query and filters. Try broadening your keywords or lowering your star threshold."
              onAction={handleResetFilters}
              actionLabel="Reset Filters"
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {repositories.map((repo) => (
                  <RepositoryCard key={repo.id} repository={repo} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 pb-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Showing page <strong className="text-zinc-900 dark:text-zinc-100">{page}</strong> of{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100">{totalPages}</strong> ({totalCount.toLocaleString()} results)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1 || isLoading}
                      onClick={() => handlePageChange(page - 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={page >= totalPages || isLoading}
                      onClick={() => handlePageChange(page + 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
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
                GitHub Filters
              </h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-400 block mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                >
                  {AVAILABLE_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-zinc-400 block mb-2">
                  Minimum Stars
                </label>
                <select
                  value={minStars}
                  onChange={(e) => handleMinStarsChange(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                >
                  {STAR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-xs shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
